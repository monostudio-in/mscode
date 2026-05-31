package com.editor.mscode.terminal;

import android.os.ParcelFileDescriptor;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Holds all state for a single PTY terminal session.
 * Owned by TerminalForegroundService; read by NativeTerminalPlugin.
 */
public class TerminalSession {

    /** Unique ID from frontend (e.g. "tab_1", "lsp_python"). */
    public final String id;

    /** "local" | "server" — cosmetic label forwarded to frontend. */
    public String type = "local";

    /** Master PTY file descriptor (returned by nativeCreateSubprocess). */
    public int ptyFd = -1;

    /** PID of the proot child process. */
    public int childPid = -1;

    /** Wrapper around ptyFd so Android can GC-manage the fd. */
    public ParcelFileDescriptor pfd = null;

    /** Write to this to send keystrokes/commands into the terminal. */
    public OutputStream out = null;

    /** Read from this to receive terminal output. */
    public InputStream in = null;

    /** Background thread draining {@link #in} and firing onData events. */
    public Thread readThread = null;

    /** False after the PTY closes or the session is killed. */
    public volatile boolean running = false;

    public TerminalSession(String id) {
        this.id = id;
    }
}
