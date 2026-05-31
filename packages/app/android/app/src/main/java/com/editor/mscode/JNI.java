// com/editor/mscode/JNI.java
package com.editor.mscode;

public final class JNI {
    static {
        System.loadLibrary("termux"); // C ফাইলটা কম্পাইল হয়ে libtermux.so হবে
    }

    public static native int createSubprocess(
        String cmd, String cwd, String[] args, String[] envVars,
        int[] processId, int rows, int columns, int cellWidth, int cellHeight
    );

    public static native void setPtyWindowSize(int fd, int rows, int cols, int cellWidth, int cellHeight);
    public static native void setPtyUTF8Mode(int fd); // (তোমার C ফাইলে এটা আছে)
    public static native int waitFor(int processId);
    public static native void close(int fileDescriptor);
}