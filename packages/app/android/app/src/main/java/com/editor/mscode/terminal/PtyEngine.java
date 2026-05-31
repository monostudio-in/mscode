package com.editor.mscode.terminal;

/**
 * Thin wrapper around the JNI functions in pty_helper.c.
 *
 * All methods are static — load the library once at class init time.
 * The native function names in pty_helper.c must match:
 *   Java_com_editor_mscode_NativeTerminalPlugin_native*
 * Those are declared on NativeTerminalPlugin because Capacitor plugins
 * must load the library from the plugin class. PtyEngine just re-exposes them.
 *
 * Actually, since we moved the JNI declarations here, the C function names
 * must change too — OR we keep them on NativeTerminalPlugin and delegate.
 * To avoid rebuilding the .c file we keep declarations on the plugin class
 * and PtyEngine simply wraps the calls via a functional interface injected
 * at service start-up.
 *
 * ─── How to use ───────────────────────────────────────────────────────────
 *   // In NativeTerminalPlugin.onCreate / onLoad:
 *   PtyEngine.init(
 *       this::nativeCreateSubprocess,
 *       this::nativeResizePty,
 *       this::nativeWaitForChild,
 *       this::nativeSendSignal
 *   );
 */
public class PtyEngine {

    // ─── Functional interfaces ────────────────────────────────────────────────

    public interface CreateFn {
        int create(String[] cmd, String[] env, String cwd, int[] pids, int rows, int cols);
    }

    public interface ResizeFn  { void resize(int fd, int rows, int cols); }
    public interface WaitFn    { int  waitFor(int pid); }
    public interface SignalFn  { void signal(int pid, int signum); }

    // ─── Singleton references ─────────────────────────────────────────────────

    private static CreateFn createFn;
    private static ResizeFn resizeFn;
    private static WaitFn   waitFn;
    private static SignalFn  signalFn;

    /** Called once from NativeTerminalPlugin so the service can use these. */
    public static void init(CreateFn c, ResizeFn r, WaitFn w, SignalFn s) {
        createFn = c;
        resizeFn = r;
        waitFn   = w;
        signalFn = s;
    }

    public static boolean isReady() {
        return createFn != null;
    }

    // ─── Delegates ────────────────────────────────────────────────────────────

    /**
     * Creates a subprocess attached to a PTY.
     * @return master PTY fd, or -1 on failure.
     */
    public static int createSubprocess(String[] cmd, String[] env, String cwd,
                                       int[] pids, int rows, int cols) {
        return createFn.create(cmd, env, cwd, pids, rows, cols);
    }

    /** Updates the terminal window size (TIOCSWINSZ). */
    public static void resizePty(int fd, int rows, int cols) {
        resizeFn.resize(fd, rows, cols);
    }

    /**
     * Blocks until the child exits and returns its exit code.
     * Negative value → process killed by signal (-signum).
     */
    public static int waitForChild(int pid) {
        return waitFn.waitFor(pid);
    }

    /** Sends a POSIX signal to a process (or process group if pid < 0). */
    public static void sendSignal(int pid, int signum) {
        signalFn.signal(pid, signum);
    }
}
