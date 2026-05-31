package com.editor.mscode.terminal;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

/**
 * Writes per-session Alpine init shell scripts.
 *
 * Each terminal session gets its own init script so:
 *   • Different sessions can start in different directories.
 *   • Scripts are cleaned up after the session exits.
 */
public class InitScriptWriter {

    private final RootfsManager rootfs;

    public InitScriptWriter(RootfsManager rootfs) {
        this.rootfs = rootfs;
    }

    /**
     * Writes a session init script to {@code outputPath}.
     *
     * @param outputPath  Where to write the script (e.g. filesDir/init_tab1.sh).
     * @param projectCwd  Proot-accessible path to open on startup.
     *                    Falls back silently to /root if the dir doesn't exist inside proot.
     */
    public void write(String outputPath, String projectCwd) throws IOException {
        String hostname = rootfs.getStoredHostname();

        // Single-quote safe path
        String safeCwd = (projectCwd != null && !projectCwd.isEmpty())
            ? projectCwd.replace("'", "'\\''")
            : "/root";

        String script =
            "#!/bin/sh\n" +
            "export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n" +
            "export HOME=/root\n" +
            "export TERM=xterm-256color\n" +
            "export LANG=C.UTF-8\n" +
            "export PIP_BREAK_SYSTEM_PACKAGES=1\n" +
            // DNS fallback
            "if [ ! -s /etc/resolv.conf ]; then\n" +
            "    echo 'nameserver 8.8.8.8' > /etc/resolv.conf\n" +
            "fi\n" +
            // First-run package install (guarded by marker file)
            "if [ ! -f /root/.mscode_setup_done ]; then\n" +
            "    echo -e '\\e[34;1m[*]\\e[0m Installing packages...'\n" +
            "    apk update -q && apk upgrade -q\n" +
            "    apk add -q bash gcompat glib nano\n" +
            "    touch /root/.mscode_setup_done\n" +
            "    clear\n" +
            "    echo -e '\\e[1;32m[+] Alpine Ready! Welcome to MS Code.\\e[0m'\n" +
            "fi\n" +
            // cd to project dir with feedback
            "if [ -d '" + safeCwd + "' ]; then\n" +
            "    cd '" + safeCwd + "'\n" +
            "    echo -e \"\\e[33m[+] Opened: $PWD\\e[0m\"\n" +
            "else\n" +
            "    cd /root\n" +
            "    echo -e \"\\e[31m[!] Path not found, opened /root\\e[0m\"\n" +
            "fi\n" +
            // Dynamic hostname (reads from file so setHostname() takes effect live)
            "MSCODE_HOST=$(cat /etc/mscode_hostname 2>/dev/null || echo '" + hostname + "')\n" +
            "export PS1='\\[\\e[1;32m\\]ide@'\"$MSCODE_HOST\"'\\[\\e[0m\\]:\\[\\e[1;34m\\]\\w\\[\\e[0m\\]$ '\n" +
            // Use bash if available, ash otherwise
            "if [ -f /bin/bash ]; then exec /bin/bash --login; else exec /bin/ash; fi\n";

        File f = new File(outputPath);
        f.getParentFile().mkdirs();
        try (FileOutputStream fos = new FileOutputStream(f)) {
            fos.write(script.getBytes("UTF-8"));
        }
        f.setExecutable(true, false);
    }

    /** Deletes the init script after session exit to avoid stale files. */
    public void cleanup(String outputPath) {
        new File(outputPath).delete();
    }
}
