package com.editor.mscode.terminal;

import android.content.Context;
import android.util.Log;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Manages the Alpine Linux rootfs and proot binaries on the device.
 *
 * ─── Setup priority ───────────────────────────────────────────────────────
 *  Binaries (proot + libtalloc):
 *    1. Copy from nativeLibraryDir (jniLibs) — fastest, no network.
 *    2. Download from GitHub — fallback if jniLibs not bundled.
 *
 *  Alpine rootfs:
 *    1. Already extracted → skip.
 *    2. Bundled asset zip (alpine-<arch>.zip) → extract from APK.
 *       The zip wraps the tar.gz so gradle doesn't strip/compress it.
 *    3. Download tar.gz directly from Alpine CDN → extract.
 */
public class RootfsManager {

    private static final String TAG = "RootfsManager";

    private final Context context;

    /** Resolved once, reused everywhere. */
    private final String filesDir;
    private final String nativeLibDir;

    public RootfsManager(Context context) {
        this.context      = context;
        this.filesDir     = context.getFilesDir().getAbsolutePath();
        this.nativeLibDir = context.getApplicationInfo().nativeLibraryDir;
    }

    // ─── Public API ───────────────────────────────────────────────────────────

    public String getFilesDir()     { return filesDir; }
    public String getRootfsPath()   { return filesDir + "/alpine_core"; }
    public String getProotPath()    { return filesDir + "/proot"; }
    public String getTmpPath()      { return getRootfsPath() + "/tmp"; }

    /** Returns true if Alpine is fully extracted. */
    public boolean isRootfsReady() {
        return new File(getRootfsPath(), "etc/alpine-release").exists();
    }

    /**
     * Ensures proot + libtalloc.so.2 are in filesDir.
     * Copies from nativeLibraryDir (jniLibs/libproot.so → filesDir/proot).
     * Falls back to network download if not bundled.
     *
     * @param arch  "aarch64" or "x86_64"
     */
    public void ensureBinaries(String arch) throws IOException {
        File prootDest  = new File(filesDir, "proot");
        File tallocDest = new File(filesDir, "libtalloc.so.2");

        // Try jniLibs first (libproot.so → proot, libtalloc.so → libtalloc.so.2)
        File prootLib  = new File(nativeLibDir, "libproot.so");
        File tallocLib = new File(nativeLibDir, "libtalloc.so");

        if (!prootDest.exists()) {
            if (prootLib.exists()) {
                Log.i(TAG, "Copying proot from jniLibs...");
                copyFile(prootLib, prootDest);
            } else {
                Log.i(TAG, "Downloading proot for " + arch + "...");
                String base = "https://github.com/Sou6900/termis/raw/refs/heads/main/jniLibs/"
                              + arch + "/";
                downloadFile(base + "proot", prootDest);
            }
            prootDest.setExecutable(true, false);
        }

        if (!tallocDest.exists()) {
            if (tallocLib.exists()) {
                Log.i(TAG, "Copying libtalloc from jniLibs...");
                copyFile(tallocLib, tallocDest);
            } else {
                Log.i(TAG, "Downloading libtalloc for " + arch + "...");
                String base = "https://github.com/Sou6900/termis/raw/refs/heads/main/jniLibs/"
                              + arch + "/";
                downloadFile(base + "libtalloc.so.2", tallocDest);
            }
        }
    }

    /**
     * Ensures Alpine rootfs is extracted.
     * See class Javadoc for priority order.
     *
     * @param arch  "aarch64" or "x86_64"
     */
    public void ensureRootfs(String arch) throws IOException {
        String rootfsPath = getRootfsPath();

        if (isRootfsReady()) return; // ✅ already done

        // Try bundled zip asset
        String assetName = "alpine-" + arch + ".zip";
        if (hasAsset(assetName)) {
            Log.i(TAG, "Extracting bundled Alpine (" + assetName + ")...");
            extractAlpineFromAsset(assetName, rootfsPath);
            return;
        }

        // Fallback: download from CDN
        String alpineUrl = arch.equals("aarch64")
            ? "https://dl-cdn.alpinelinux.org/alpine/latest-stable/releases/aarch64/alpine-minirootfs-3.23.3-aarch64.tar.gz"
            : "https://dl-cdn.alpinelinux.org/alpine/v3.21/releases/x86_64/alpine-minirootfs-3.21.0-x86_64.tar.gz";

        Log.i(TAG, "Downloading Alpine rootfs for " + arch + "...");
        File tarGz = new File(filesDir, "alpine.tar.gz");
        downloadFile(alpineUrl, tarGz);
        new File(rootfsPath).mkdirs();
        extractTarGz(rootfsPath, tarGz);
        tarGz.delete();
    }

    /** Creates filesDir/alpine_core/tmp if missing. */
    public void ensureTmpDir() {
        new File(getTmpPath()).mkdirs();
    }

    // ─── Hostname helpers ─────────────────────────────────────────────────────

    /** Reads persisted hostname from rootfs. Default: "mscode". */
    public String getStoredHostname() {
        File f = new File(getRootfsPath(), "etc/mscode_hostname");
        if (f.exists()) {
            try (FileInputStream fis = new FileInputStream(f)) {
                String h = new String(readAll(fis), "UTF-8").trim();
                if (!h.isEmpty()) return h;
            } catch (IOException ignored) {}
        }
        return "mscode";
    }

    /** Persists hostname to rootfs/etc/mscode_hostname. */
    public void saveHostname(String name) throws IOException {
        File f = new File(getRootfsPath(), "etc/mscode_hostname");
        f.getParentFile().mkdirs();
        try (FileOutputStream fos = new FileOutputStream(f)) {
            fos.write(name.getBytes("UTF-8"));
        }
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private boolean hasAsset(String name) {
        try {
            context.getAssets().open(name).close();
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    private void extractAlpineFromAsset(String assetName, String rootfsPath) throws IOException {
        File tmpZip = new File(context.getCacheDir(), assetName);

        try (InputStream in  = context.getAssets().open(assetName);
             FileOutputStream out = new FileOutputStream(tmpZip)) {
            pipe(in, out);
        }

        File tarGz = null;
        try (ZipInputStream zis = new ZipInputStream(new FileInputStream(tmpZip))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                String name = entry.getName();
                if (name.endsWith(".tar.gz") || name.endsWith(".tgz")) {
                    tarGz = new File(context.getCacheDir(), new File(name).getName());
                    try (FileOutputStream fos = new FileOutputStream(tarGz)) {
                        byte[] buf = new byte[65536]; int n;
                        while ((n = zis.read(buf)) != -1) fos.write(buf, 0, n);
                    }
                    break;
                }
            }
        }
        tmpZip.delete();

        if (tarGz == null) throw new IOException("No .tar.gz inside " + assetName);
        new File(rootfsPath).mkdirs();
        extractTarGz(rootfsPath, tarGz);
        tarGz.delete();
    }

    private void extractTarGz(String destDir, File tarFile) throws IOException {
        try {
            new ProcessBuilder("tar", "-xzf", tarFile.getAbsolutePath(), "-C", destDir)
                .redirectErrorStream(true).start().waitFor();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("tar interrupted", e);
        }
    }

    private void downloadFile(String urlStr, File dest) throws IOException {
        if (dest.exists()) return;
        HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
        conn.setConnectTimeout(30_000);
        conn.setReadTimeout(120_000);
        conn.connect();
        try (InputStream in  = conn.getInputStream();
             FileOutputStream out = new FileOutputStream(dest)) {
            pipe(in, out);
        }
    }

    private void copyFile(File src, File dest) throws IOException {
        try (FileInputStream in  = new FileInputStream(src);
             FileOutputStream out = new FileOutputStream(dest)) {
            pipe(in, out);
        }
    }

    static void pipe(InputStream in, OutputStream out) throws IOException {
        byte[] buf = new byte[65536]; int n;
        while ((n = in.read(buf)) != -1) out.write(buf, 0, n);
    }

    static byte[] readAll(InputStream in) throws IOException {
        java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
        byte[] buf = new byte[4096]; int n;
        while ((n = in.read(buf)) != -1) bos.write(buf, 0, n);
        return bos.toByteArray();
    }
}
