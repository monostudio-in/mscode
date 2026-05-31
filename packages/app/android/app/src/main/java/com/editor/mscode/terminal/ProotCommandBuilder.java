package com.editor.mscode.terminal;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Builds the proot command array and environment for a terminal session
 * or a one-shot background execution.
 *
 * Separated from the plugin/service so it can be tested independently
 * and reused by both PTY sessions and backgroundExecute().
 */
public class ProotCommandBuilder {

    private final String prootPath;
    private final String rootfsPath;
    private final String nativeLibDir;
    private final String filesDir;
    private final String tmpPath;

    public ProotCommandBuilder(RootfsManager mgr, String nativeLibDir) {
        this.prootPath    = mgr.getProotPath();
        this.rootfsPath   = mgr.getRootfsPath();
        this.filesDir     = mgr.getFilesDir();
        this.nativeLibDir = nativeLibDir;
        this.tmpPath      = mgr.getTmpPath();
    }

    // ─── Terminal session command ─────────────────────────────────────────────

    /**
     * Full proot command for an interactive PTY session.
     *
     * @param initScriptPath  Per-session init shell script (sets PS1, cd, etc.)
     */
    public String[] buildSessionCommand(String initScriptPath) {
        List<String> cmd = new ArrayList<>();
        cmd.add(prootPath);
        addCommonProotFlags(cmd);
        cmd.add("sh");
        cmd.add(initScriptPath);
        return cmd.toArray(new String[0]);
    }

    /**
     * Minimal proot command for backgroundExecute() — no PTY, no init script.
     *
     * @param shellCommand  The sh -c command to run inside Alpine.
     */
    // Replace existing minimal command with full mounts
    public String[] buildBackgroundCommand(String shellCommand) {
        List<String> cmd = new ArrayList<>();
        cmd.add(prootPath);
        addCommonProotFlags(cmd); // ← Full mounts (/data, /sdcard) + --kill-on-exit
        cmd.add("sh");
        cmd.add("-c");
        cmd.add(shellCommand);
        return cmd.toArray(new String[0]);
    }

    /** Expose PROOT environment variables for ProcessBuilder */
    public Map<String, String> getProotEnv() {
        List<String> envList = new ArrayList<>();
        addCommonEnv(envList);
        Map<String, String> envMap = new java.util.HashMap<>();
        for (String e : envList) {
            String[] parts = e.split("=", 2);
            if (parts.length == 2) envMap.put(parts[0], parts[1]);
        }
        return envMap;
    }
    

    // ─── Environment ─────────────────────────────────────────────────────────

    /**
     * Environment for PTY sessions (full set).
     */
    public String[] buildSessionEnv() {
        List<String> env = new ArrayList<>();
        addCommonEnv(env);
        return env.toArray(new String[0]);
    }

    /**
     * Environment map for ProcessBuilder-based background execution.
     * Call pb.environment().clear() first, then putAll(this).
     */
    public java.util.Map<String, String> buildBackgroundEnvMap() {
        java.util.Map<String, String> map = new java.util.LinkedHashMap<>();
        map.put("PROOT_LOADER",   nativeLibDir + "/libproot-loader.so");
        File l32 = new File(nativeLibDir, "libproot-loader32.so");
        if (l32.exists()) map.put("PROOT_LOADER32", l32.getAbsolutePath());
        map.put("PROOT_TMP_DIR",  tmpPath);
        map.put("HOME",           "/root");
        map.put("TMPDIR",         tmpPath);
        map.put("TERM",           "xterm-256color");
        map.put("LANG",           "C.UTF-8");
        map.put("PATH",           "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin");
        map.put("LD_LIBRARY_PATH", filesDir + ":" + nativeLibDir);
        return map;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void addCommonProotFlags(List<String> cmd) {
        cmd.add("--link2symlink");  // symlink support for apk — safe with libproot-loader.so
        cmd.add("--sysvipc");
        cmd.add("-L");              // ignore non-fatal mount errors
        cmd.add("--kill-on-exit"); // kill child tree when proot exits
        cmd.add("-0");             // fake root inside Alpine
        cmd.add("-r"); cmd.add(rootfsPath);
        cmd.add("-w"); cmd.add("/");

        // Android system partitions — needed for libproot-loader.so ELF resolution
        for (String mnt : new String[]{
                "/apex", "/odm", "/product", "/system", "/system_ext", "/vendor",
                "/linkerconfig/ld.config.txt",
                "/linkerconfig/com.android.art/ld.config.txt",
                "/plat_property_contexts", "/property_contexts",
                "/storage"}) {
            if (new File(mnt).exists()) { cmd.add("-b"); cmd.add(mnt); }
        }

        cmd.add("-b"); cmd.add("/dev");
        cmd.add("-b"); cmd.add("/proc");
        cmd.add("-b"); cmd.add("/sys");
        cmd.add("-b"); cmd.add("/data");
        cmd.add("-b"); cmd.add(filesDir + ":/root");
        cmd.add("-b"); cmd.add("/sdcard");
        if (new File("/storage").exists()) {
            cmd.add("-b"); cmd.add("/storage");
        }

        // fd binds
        // Removed unnecessary explicit fd binds that cause proot warnings
        // if (new File("/proc/self/fd").exists())
        //     { cmd.add("-b"); cmd.add("/proc/self/fd:/dev/fd"); }
        // if (new File("/proc/self/fd/0").exists())
        //     { cmd.add("-b"); cmd.add("/proc/self/fd/0:/dev/stdin"); }
        // if (new File("/proc/self/fd/1").exists())
        //     { cmd.add("-b"); cmd.add("/proc/self/fd/1:/dev/stdout"); }
        // if (new File("/proc/self/fd/2").exists())
        //     { cmd.add("-b"); cmd.add("/proc/self/fd/2:/dev/stderr"); }

        cmd.add("-b"); cmd.add("/dev/urandom:/dev/random");
        cmd.add("-b"); cmd.add(tmpPath + ":/dev/shm");
    }

    // private void addCommonEnv(List<String> env) {
    //     env.add("PROOT_LOADER=" + nativeLibDir + "/libproot-loader.so");
    //     File l32 = new File(nativeLibDir, "libproot-loader32.so");
    //     if (l32.exists()) env.add("PROOT_LOADER32=" + l32.getAbsolutePath());
    //     env.add("PROOT_TMP_DIR=" + tmpPath);
    //     env.add("HOME=/root");
    //     env.add("TERM=xterm-256color");
    //     env.add("LANG=C.UTF-8");
    //     // Add color 
    //     env.add("PS1=\\[\\e[1;32m\\]ide@mscode\\[\\e[0m\\]:\\[\\e[1;34m\\]\\w\\[\\e[0m\\]$ ");
    //     env.add("TMPDIR=" + tmpPath);
    //     env.add("PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin");
    //     env.add("LD_LIBRARY_PATH=" + filesDir + ":" + nativeLibDir);
    // }
    
    private void addCommonEnv(List<String> env) {
        env.add("PROOT_LOADER=" + nativeLibDir + "/libproot-loader.so");
        File l32 = new File(nativeLibDir, "libproot-loader32.so");
        if (l32.exists()) env.add("PROOT_LOADER32=" + l32.getAbsolutePath());
        env.add("PROOT_TMP_DIR=" + tmpPath);
        env.add("HOME=/root");
        env.add("TERM=xterm-256color");
        env.add("LANG=C.UTF-8");
        
        env.add("PS1=\\[\\e[1;32m\\]ide@mscode\\[\\e[0m\\]:\\[\\e[1;34m\\]$(pwd | awk -F/ '{if (NF>3) print \"../\"$(NF-1)\"/\"$NF; else print $0}')\\[\\e[0m\\] /~ $ ");
        
        env.add("TMPDIR=" + tmpPath);
        env.add("PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin");
        env.add("LD_LIBRARY_PATH=" + filesDir + ":" + nativeLibDir);
    }
    
}
