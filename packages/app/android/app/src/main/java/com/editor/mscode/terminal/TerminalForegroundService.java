package com.editor.mscode.terminal;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Android Foreground Service that owns all terminal sessions and background processes.
 *
 * ─── Why a Service? ───────────────────────────────────────────────────────
 *  Android kills background threads when the app is minimised or the screen
 *  turns off ("Phantom Process" killing on Android 12+). A Foreground Service
 *  with a visible notification is protected from this — the OS will not kill
 *  it while the notification is showing.
 *
 * ─── WakeLock ─────────────────────────────────────────────────────────────
 *  When running LSP servers (pyright, clangd) or long compilations, we need
 *  the CPU to stay active even with the screen off. acquireWakeLock() is
 *  called automatically when at least one session is running; released when
 *  the last session closes.
 *
 * ─── IPC with NativeTerminalPlugin ────────────────────────────────────────
 *  The plugin binds to this service via the LocalBinder and calls methods
 *  directly (same process → no IPC overhead). Events (onData, onExit) are
 *  delivered back through the EventCallback interface.
 */
public class TerminalForegroundService extends Service {

    private static final String TAG         = "TerminalService";
    private static final String CHANNEL_ID  = "mscode_terminal";
    private static final int    NOTIF_ID    = 1001;

    // ─── Actions ─────────────────────────────────────────────────────────────
    public static final String ACTION_STOP = "com.editor.mscode.terminal.STOP";

    // ─── Binder (same-process binding) ───────────────────────────────────────
    public class LocalBinder extends Binder {
        public TerminalForegroundService getService() {
            return TerminalForegroundService.this;
        }
    }

    private final IBinder binder = new LocalBinder();

    @Override
    public IBinder onBind(Intent intent) { return binder; }

    // ─── Event callback ───────────────────────────────────────────────────────

    /** NativeTerminalPlugin implements this to receive PTY output events. */
    public interface EventCallback {
        void onData(String sessionId, String data);
        void onExit(String sessionId, int exitCode);
        void onLog(String message);
    }

    private EventCallback eventCallback;

    public void setEventCallback(EventCallback cb) {
        this.eventCallback = cb;
    }

    private void emit(String sessionId, String data) {
        if (eventCallback != null) eventCallback.onData(sessionId, data);
    }
    private void emitExit(String sessionId, int code) {
        if (eventCallback != null) eventCallback.onExit(sessionId, code);
    }
    private void emitLog(String msg) {
        Log.d(TAG, msg);
        if (eventCallback != null) eventCallback.onLog(msg);
    }
    
    
    // ─── Background Terminal Pre-Setup ────────────────────────────────

    public boolean isRootfsReady() {
        return rootfs.isRootfsReady();
    }

    public void ensureSetup(String arch) throws Exception {
        // এই লকটা নিশ্চিত করবে যে একই সাথে একাধিক সেটআপ রান করবে না
        synchronized (rootfsLock) {
            rootfs.ensureBinaries(arch);
            rootfs.ensureRootfs(arch);
            rootfs.ensureTmpDir();
        }
    }

    // ─── State ────────────────────────────────────────────────────────────────

    private final ConcurrentHashMap<String, TerminalSession> sessions
        = new ConcurrentHashMap<>();

    // Shared Alpine setup — serialize with this lock
    private final Object rootfsLock = new Object();

    private RootfsManager    rootfs;
    private ProotCommandBuilder builder;
    private InitScriptWriter  scriptWriter;

    private PowerManager.WakeLock wakeLock;
    private boolean wakeLockHeld = false;

    // ─── Lifecycle ────────────────────────────────────────────────────────────

    @Override
    public void onCreate() {
        super.onCreate();
        rootfs        = new RootfsManager(this);
        scriptWriter  = new InitScriptWriter(rootfs);
        createNotificationChannel();
        startForeground(NOTIF_ID, buildNotification("Terminal ready"));
        emitLog("TerminalForegroundService started");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            stopSelf();
        }
        return START_STICKY; // restart if killed
    }

    @Override
    public void onDestroy() {
        // Kill all sessions cleanly
        for (TerminalSession s : sessions.values()) cleanupSession(s);
        sessions.clear();
        releaseWakeLock();
        super.onDestroy();
    }

    // ─── Public API (called by NativeTerminalPlugin) ──────────────────────────

    /**
     * Initialises the builder with the plugin's native library dir.
     * Must be called once after binding before any session is started.
     */
    public void initBuilder(String nativeLibDir) {
        this.builder = new ProotCommandBuilder(rootfs, nativeLibDir);
    }

    /**
     * Starts a new PTY terminal session.
     *
     * @param sessionId   Unique ID.
     * @param projectPath Android path to open in the terminal (mapped to proot).
     * @param type        "local" | "server".
     * @param arch        Device ABI: "aarch64" or "x86_64".
     * @param rows        Initial terminal rows.
     * @param cols        Initial terminal columns.
     * @throws Exception  On rootfs/proot setup failure or PTY creation failure.
     */
    public void startSession(String sessionId, String projectPath,
                             String type, String arch,
                             int rows, int cols) throws Exception {

        if (sessions.containsKey(sessionId))
            throw new IllegalStateException("Session '" + sessionId + "' already exists");

        // Alpine setup (serialized across concurrent starts)
        synchronized (rootfsLock) {
            rootfs.ensureBinaries(arch);
            rootfs.ensureRootfs(arch);
            rootfs.ensureTmpDir();
        }

        // Map project path → proot-accessible path
        String prootCwd = (projectPath != null && new File(projectPath).isDirectory())
            ? projectPath : "/root";

        // Write per-session init script
        String initPath = rootfs.getFilesDir() + "/init_" + sessionId + ".sh";
        scriptWriter.write(initPath, prootCwd);

        String[] cmd = builder.buildSessionCommand(initPath);
        String[] env = builder.buildSessionEnv();

        emitLog("🚀 Starting [" + sessionId + "] " + type
                + (prootCwd.equals("/root") ? "" : " → " + prootCwd));

        TerminalSession session = new TerminalSession(sessionId);
        session.type = type;
        sessions.put(sessionId, session);

        int[] pids = new int[1];
        session.ptyFd = PtyEngine.createSubprocess(cmd, env,
                                                    rootfs.getFilesDir(),
                                                    pids, rows, cols);
        if (session.ptyFd < 0) {
            sessions.remove(sessionId);
            scriptWriter.cleanup(initPath);
            throw new RuntimeException("PTY subprocess creation failed");
        }

        session.childPid = pids[0];
        session.pfd      = android.os.ParcelFileDescriptor.adoptFd(session.ptyFd);
        session.out      = new FileOutputStream(session.pfd.getFileDescriptor());
        session.in       = new FileInputStream(session.pfd.getFileDescriptor());
        session.running  = true;

        emitLog("🟢 [" + sessionId + "] pid=" + session.childPid);
        updateNotification(sessions.size() + " session(s) running");
        acquireWakeLock();

        // Read loop
        final String sid = sessionId;
        session.readThread = new Thread(() -> {
            try {
                byte[] buf = new byte[4096]; int n;
                while (session.running && (n = session.in.read(buf)) != -1) {
                    emit(sid, new String(buf, 0, n, "UTF-8"));
                }
            } catch (Exception ignored) {}
            finally {
                session.running = false;
                scriptWriter.cleanup(initPath);
                int exitCode = PtyEngine.waitForChild(session.childPid);
                emitExit(sid, exitCode);
                sessions.remove(sid);
                if (sessions.isEmpty()) {
                    releaseWakeLock();
                    updateNotification("Terminal ready");
                } else {
                    updateNotification(sessions.size() + " session(s) running");
                }
            }
        }, "pty-read-" + sessionId);
        session.readThread.setDaemon(true);
        session.readThread.start();
    }

    /** Writes raw bytes to a session's PTY stdin. */
    public void write(String sessionId, String data) throws IOException {
        TerminalSession s = sessions.get(sessionId);
        if (s == null || !s.running) return;
        s.out.write(data.getBytes("UTF-8"));
        s.out.flush();
    }

    /** Sends command + newline to a running session. */
    public void execute(String sessionId, String command) throws IOException {
        write(sessionId, command + "\n");
    }

    /** Updates the PTY window size. */
    public void resize(String sessionId, int rows, int cols) {
        TerminalSession s = sessions.get(sessionId);
        if (s != null && s.ptyFd >= 0) PtyEngine.resizePty(s.ptyFd, rows, cols);
    }

    /** Sends SIGINT to the session's process group (Ctrl+C). */
    public void sendInterrupt(String sessionId) {
        TerminalSession s = sessions.get(sessionId);
        if (s != null && s.childPid > 0) PtyEngine.sendSignal(-s.childPid, 2);
    }

    /** Kills a session and frees all resources. */
    public void closeSession(String sessionId) {
        cleanupSession(sessions.remove(sessionId));
        if (sessions.isEmpty()) {
            releaseWakeLock();
            updateNotification("Terminal ready");
        } else {
            updateNotification(sessions.size() + " session(s) running");
        }
    }

    public boolean isRunning(String sessionId) {
        TerminalSession s = sessions.get(sessionId);
        return s != null && s.running;
    }

    public TerminalSession getSession(String sessionId) {
        return sessions.get(sessionId);
    }

    public List<String> getAllSessionIds() {
        return new ArrayList<>(sessions.keySet());
    }

    // ─── Background execute (no PTY) ─────────────────────────────────────────

    /**
     * Runs a command inside Alpine proot WITHOUT a PTY.
     * Captures combined stdout+stderr and returns them.
     * Blocks the calling thread — run on a background thread.
     */
    public BackgroundResult backgroundExecute(String command) throws Exception {
        if (!rootfs.isRootfsReady())
            throw new IllegalStateException("Alpine rootfs not ready — call startSession() first");

        String[] cmd = builder.buildBackgroundCommand(command);

        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.environment().clear();
        pb.environment().putAll(builder.buildBackgroundEnvMap());
        pb.redirectErrorStream(true);

        Process proc    = pb.start();
        byte[]  output  = readAll(proc.getInputStream());
        int     exitCode = proc.waitFor();

        return new BackgroundResult(new String(output, "UTF-8"), exitCode);
    }

    /** Result of backgroundExecute(). */
    public static class BackgroundResult {
        public final String output;
        public final int    exitCode;
        BackgroundResult(String output, int exitCode) {
            this.output   = output;
            this.exitCode = exitCode;
        }
    }
    
    // ─── Streaming Background Execute ─────────────────────────────────

    public interface BackgroundStreamListener {
        void onData(String data);
    }

    /**
     * Runs a command in background and streams the terminal output in real-time.
     */
    // Track background processes to allow killing
    private final Map<String, Process> backgroundProcesses = new ConcurrentHashMap<>();

    public interface BackgroundProcessListener {
        void onData(String data);
        void onExit(int exitCode);
    }

    // Injecting Proot Environment
    public void streamBackgroundExecute(
            String sessionId, String[] cmd, 
            Map<String, String> env, String cwd, 
            BackgroundProcessListener listener
    ) {
        new Thread(() -> {
            try {
                ProcessBuilder pb = new ProcessBuilder(cmd);
                pb.environment().clear();
                if (env != null) pb.environment().putAll(env); // ← PROOT_LOADER Inject
                
                if (cwd != null && !cwd.isEmpty()) pb.directory(new File(cwd));
                pb.redirectErrorStream(true);

                Process process = pb.start();
                backgroundProcesses.put(sessionId, process);

                InputStream in = process.getInputStream();
                byte[] buf = new byte[4096]; int len;
                while ((len = in.read(buf)) != -1) {
                    if (listener != null) listener.onData(new String(buf, 0, len));
                }
                
                int exitCode = process.waitFor();
                backgroundProcesses.remove(sessionId);
                if (listener != null) listener.onExit(exitCode);
                
            } catch (Exception e) {
                if (listener != null) {
                    listener.onData("\n[Service Error] " + e.getMessage() + "\n");
                    listener.onExit(-1);
                }
                backgroundProcesses.remove(sessionId);
            }
        }).start();
    }

    public void killBackgroundProcess(String sessionId) {
        Process p = backgroundProcesses.remove(sessionId);
        if (p != null) p.destroy();
    }    
    
 
    // ─── LSP / ProcessServer ─────────────────────────────────────────────────

    /**
     * Starts a Java WebSocket server that bridges a language server's stdio.
     * Returns the port number — connect to ws://127.0.0.1:{port}.
     *
     * Blocks until the port is bound (guaranteed ready when this returns).
     *
     * @param cmd  Full command to run (proot + language server).
     */

    // Alpine command full proot command wrap -> env 
    public int spawnProcessServer(String alpineCommand) throws Exception {
        // builder.buildBackgroundCommand() whole proot invocation creation
        // যেমন: ["/data/data/.../proot", "--link2symlink", ..., "/bin/sh", "-c", "pyright-langserver --stdio"]
        String[] cmd    = builder.buildBackgroundCommand(alpineCommand);
        java.util.Map<String, String> envMap = builder.buildBackgroundEnvMap();
    
        int port = ProcessServer.findFreePort();
        ProcessServer server = new ProcessServer(port, cmd, envMap);
        server.startAndAwait();
        emitLog("🔌 ProcessServer listening on port " + port);
        return port;
    }

    // ─── Hostname ─────────────────────────────────────────────────────────────

    /**
     * Persists a new hostname and live-updates PS1 in all running sessions.
     */
    public void setHostname(String name) throws IOException {
        rootfs.saveHostname(name);
        
        // IT CAUSE OTHER TERMINAL UNWANTED PUSH
        // String ps1 = "export PS1='\\[\\e[1;32m\\]ide@" + name
        //     + "\\[\\e[0m\\]:\\[\\e[1;34m\\]\\w\\[\\e[0m\\]$ '\n";
        // for (TerminalSession s : sessions.values()) {
        //     if (s.running && s.out != null) {
        //         try { s.out.write(ps1.getBytes("UTF-8")); s.out.flush(); }
        //         catch (IOException ignored) {}
        //     }
        // }
        
    }

    // ─── WakeLock ─────────────────────────────────────────────────────────────

    /**
     * Acquires a PARTIAL_WAKE_LOCK so the CPU keeps running when the screen
     * turns off (needed for LSP servers and long compilations).
     */
    public void acquireWakeLock() {
        if (wakeLockHeld) return;
        if (wakeLock == null) {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "MsCode:Terminal");
            wakeLock.setReferenceCounted(false);
        }
        wakeLock.acquire();
        wakeLockHeld = true;
        emitLog("⚡ WakeLock acquired");
    }

    public void releaseWakeLock() {
        if (wakeLockHeld && wakeLock != null) {
            wakeLock.release();
            wakeLockHeld = false;
            emitLog("💤 WakeLock released");
        }
    }

    public boolean isWakeLockHeld() { return wakeLockHeld; }

    // ─── Notification ─────────────────────────────────────────────────────────

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel ch = new NotificationChannel(
                CHANNEL_ID, "MS Code Terminal",
                NotificationManager.IMPORTANCE_LOW);
            ch.setDescription("Keeps terminal sessions alive in the background");
            getSystemService(NotificationManager.class).createNotificationChannel(ch);
        }
    }

    private void updateNotification(String text) {
        Notification n = buildNotification(text);
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm != null) nm.notify(NOTIF_ID, n);
    }

    private Notification buildNotification(String text) {
        Intent stopIntent = new Intent(this, TerminalForegroundService.class);
        stopIntent.setAction(ACTION_STOP);
        PendingIntent stopPi = PendingIntent.getService(this, 0, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("MS Code Terminal")
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_menu_send)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .addAction(android.R.drawable.ic_delete, "Stop", stopPi)
            .build();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void cleanupSession(TerminalSession s) {
        if (s == null) return;
        s.running = false;
        if (s.childPid > 0) PtyEngine.sendSignal(s.childPid, 9);
        try { if (s.out != null) s.out.close(); } catch (Exception ignored) {}
        try { if (s.in  != null) s.in.close();  } catch (Exception ignored) {}
        try { if (s.pfd != null) s.pfd.close(); } catch (Exception ignored) {}
        if (s.readThread != null) s.readThread.interrupt();
    }

    private static byte[] readAll(InputStream in) throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        byte[] buf = new byte[4096]; int n;
        while ((n = in.read(buf)) != -1) bos.write(buf, 0, n);
        return bos.toByteArray();
    }
}
