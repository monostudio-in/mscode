package com.editor.mscode.terminal;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicReference;
import java.util.Map;

/**
 * Java-side WebSocket server that bridges a process's stdio to WebSocket clients.
 *
 * ─── Why this exists ──────────────────────────────────────────────────────
 *  LSP servers (pyright, clangd) communicate over stdio.
 *  Monaco Editor communicates over WebSocket.
 *  This class bridges the two — no websocat dependency needed inside Alpine.
 *
 *  Advantages over websocat-inside-Alpine:
 *    • Port is GUARANTEED open when startAndAwait() returns.
 *    • No extra Alpine package to install.
 *    • Not subject to proot process lifecycle issues.
 *    • Uses a random free port → no conflicts.
 *
 * ─── Usage ────────────────────────────────────────────────────────────────
 *  // Find a free port
 *  int port;
 *  try (ServerSocket s = new ServerSocket(0)) { port = s.getLocalPort(); }
 *
 *  // Build proot command that runs the language server
 *  String[] cmd = builder.buildLspCommand("pyright-langserver --stdio");
 *
 *  ProcessServer server = new ProcessServer(port, cmd, envMap);
 *  server.startAndAwait();   // blocks until listening
 *  // port is now open — return it to frontend
 *
 * ─── Dependencies ─────────────────────────────────────────────────────────
 *  Add to build.gradle:
 *    implementation 'org.java-websocket:Java-WebSocket:1.5.4'
 *
 * ─── Lifecycle ────────────────────────────────────────────────────────────
 *  • One ProcessServer per LSP session.
 *  • When the WebSocket client disconnects, the server stops itself
 *    (which destroys the proot/language-server process).
 *  • For a new session, create a new ProcessServer on the same port.
 *
 * (Adapted from Acode's ProcessServer.java — MIT licence)
 */
public class ProcessServer extends WebSocketServer {

    private final String[] cmd;
    private final Map<String, String> env; // Env map for PRoot variables
    private final CountDownLatch readyLatch = new CountDownLatch(1);
    private final AtomicReference<Exception> startError = new AtomicReference<>();

    // Attached to each WebSocket connection so onMessage/onClose can find the process.
    private static final class ConnState {
        final Process    process;
        final OutputStream stdin;

        ConnState(Process process, OutputStream stdin) {
            this.process = process;
            this.stdin   = stdin;
        }
    }

    /**
     * @param port  Local port to bind (use 0 for auto, then call getPort() after).
     * @param cmd   Full command to spawn (e.g. proot + language server args).
     * @param env   Environment variables required for PRoot execution.
     */
    public ProcessServer(int port, String[] cmd, Map<String, String> env) {
        super(new InetSocketAddress("127.0.0.1", port));
        this.cmd = cmd;
        this.env = env;
    }

    // ─── Helper: find a free port ─────────────────────────────────────────────

    public static int findFreePort() throws Exception {
        try (ServerSocket s = new ServerSocket(0)) {
            return s.getLocalPort();
        }
    }

    // ─── Startup ─────────────────────────────────────────────────────────────

    /**
     * Starts the WebSocket server and BLOCKS until it is listening.
     * Returns normally when the port is bound and ready.
     * Throws if the server fails to start (port in use, bind error, etc.).
     */
    public void startAndAwait() throws Exception {
        start();
        readyLatch.await();
        Exception err = startError.get();
        if (err != null) throw err;
    }

    @Override
    public void onStart() {
        readyLatch.countDown(); // unblocks startAndAwait()
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        if (conn == null) {
            // Startup/bind failure — report to startAndAwait()
            startError.set(ex);
            readyLatch.countDown();
        }
        // Per-connection errors are handled in onClose
    }

    // ─── Connection lifecycle ─────────────────────────────────────────────────

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        try {
            // Spawn the language server with the correct Alpine PRoot environment
            ProcessBuilder pb = new ProcessBuilder(cmd);
            pb.environment().clear();
            if (env != null) {
                pb.environment().putAll(env); // Inject PRoot loader and paths
            }
            
            Process process = pb.redirectErrorStream(true).start();
            InputStream stdout = process.getInputStream();
            OutputStream stdin = process.getOutputStream();

            conn.setAttachment(new ConnState(process, stdin));

            // Stream process stdout → WebSocket (binary frames for LSP)
            new Thread(() -> {
                try {
                    byte[] buf = new byte[8192]; int len;
                    while ((len = stdout.read(buf)) != -1) {
                        conn.send(ByteBuffer.wrap(buf, 0, len));
                    }
                } catch (Exception ignored) {}
                // Process exited — close the WebSocket cleanly
                conn.close(1000, "process exited");
            }, "lsp-stdout-reader").start();

        } catch (Exception e) {
            conn.close(1011, "Failed to start process: " + e.getMessage());
        }
    }

    /** Binary frame from Monaco → write directly to language server stdin. */
    @Override
    public void onMessage(WebSocket conn, ByteBuffer msg) {
        try {
            ConnState state = conn.getAttachment();
            if (state != null) {
                state.stdin.write(msg.array(), msg.position(), msg.remaining());
                state.stdin.flush();
            }
        } catch (Exception ignored) {}
    }

    /** Text frame fallback (some clients send text). */
    @Override
    public void onMessage(WebSocket conn, String message) {
        try {
            ConnState state = conn.getAttachment();
            if (state != null) {
                state.stdin.write(message.getBytes(StandardCharsets.UTF_8));
                state.stdin.flush();
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        // Kill the language server process
        try {
            ConnState state = conn.getAttachment();
            if (state != null) state.process.destroy();
        } catch (Exception ignored) {}

        // Stop the WebSocket server on a separate thread to avoid deadlock
        // (stop() joins worker threads; calling from a worker would deadlock)
        new Thread(() -> {
            try { stop(); } catch (Exception ignored) {}
        }, "lsp-server-stop").start();
    }
}