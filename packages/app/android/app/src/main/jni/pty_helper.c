// pty_helper.c — Native PTY engine for MS Code IDE Terminal
// Handles: PTY creation, fork/exec with controlling terminal, resize, signals

#include <jni.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <signal.h>
#include <termios.h>
#include <sys/ioctl.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <android/log.h>

#define LOG_TAG "NativePTY"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO,  LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

// ─── PTY Pair ────────────────────────────────────────────────────────────────

/**
 * Creates a master/slave PTY pair using /dev/ptmx.
 * Returns 0 on success, -1 on failure.
 */
static int create_pty_pair(int *master_fd, int *slave_fd) {
    *master_fd = open("/dev/ptmx", O_RDWR | O_CLOEXEC);
    if (*master_fd < 0) {
        LOGE("open(/dev/ptmx) failed: %s", strerror(errno));
        return -1;
    }

    if (grantpt(*master_fd) != 0) {
        LOGE("grantpt failed: %s", strerror(errno));
        close(*master_fd);
        return -1;
    }

    if (unlockpt(*master_fd) != 0) {
        LOGE("unlockpt failed: %s", strerror(errno));
        close(*master_fd);
        return -1;
    }

    char slave_name[256];
    if (ptsname_r(*master_fd, slave_name, sizeof(slave_name)) != 0) {
        LOGE("ptsname_r failed: %s", strerror(errno));
        close(*master_fd);
        return -1;
    }

    *slave_fd = open(slave_name, O_RDWR | O_CLOEXEC);
    if (*slave_fd < 0) {
        LOGE("open slave(%s) failed: %s", slave_name, strerror(errno));
        close(*master_fd);
        return -1;
    }

    LOGI("PTY created: master=%d slave=%d (%s)", *master_fd, *slave_fd, slave_name);
    return 0;
}

// ─── String Array Helpers ─────────────────────────────────────────────────────

static char **jarray_to_c(JNIEnv *env, jobjectArray arr) {
    if (!arr) return NULL;
    jsize len = (*env)->GetArrayLength(env, arr);
    char **result = malloc((len + 1) * sizeof(char *));
    if (!result) return NULL;

    for (jsize i = 0; i < len; i++) {
        jstring js = (jstring)(*env)->GetObjectArrayElement(env, arr, i);
        if (js) {
            const char *cs = (*env)->GetStringUTFChars(env, js, NULL);
            result[i] = strdup(cs);
            (*env)->ReleaseStringUTFChars(env, js, cs);
            (*env)->DeleteLocalRef(env, js);
        } else {
            result[i] = strdup("");
        }
    }
    result[len] = NULL;
    return result;
}

static void free_c_array(char **arr) {
    if (!arr) return;
    for (int i = 0; arr[i]; i++) free(arr[i]);
    free(arr);
}

// ─── Main JNI: Create Subprocess with PTY ────────────────────────────────────

/**
 * Creates a child subprocess connected to a real PTY.
 *
 * @param cmd      Full command + args array (e.g. {"/system/bin/linker64", "proot", ...})
 * @param envVars  Environment as {"KEY=VALUE", ...}
 * @param cwd      Working directory inside proot (e.g. "/root")
 * @param pids     int[1] — filled with child PID on success
 * @param rows     Initial terminal rows
 * @param cols     Initial terminal columns
 * @return         master PTY fd on success, -1 on failure
 */
JNIEXPORT jint JNICALL
Java_com_editor_mscode_NativeTerminalPlugin_nativeCreateSubprocess(
        JNIEnv  *env,
        jobject  thiz,
        jobjectArray cmd,
        jobjectArray envVars,
        jstring  cwd,
        jintArray pids,
        jint rows,
        jint cols)
{
    int master_fd, slave_fd;
    if (create_pty_pair(&master_fd, &slave_fd) < 0) return -1;

    // Set initial window size before fork so child inherits it
    struct winsize ws;
    memset(&ws, 0, sizeof(ws));
    ws.ws_row = (unsigned short)(rows > 0 ? rows : 24);
    ws.ws_col = (unsigned short)(cols > 0 ? cols : 80);
    ioctl(master_fd, TIOCSWINSZ, &ws);

    char **argv = jarray_to_c(env, cmd);
    char **envp = jarray_to_c(env, envVars);

    const char *cwd_str = NULL;
    if (cwd) cwd_str = (*env)->GetStringUTFChars(env, cwd, NULL);

    pid_t pid = fork();

    // ── Child Process ──────────────────────────────────────────────────────
    if (pid == 0) {
        close(master_fd); // child never uses master

        // 1. New session → becomes session leader
        if (setsid() < 0) {
            LOGE("[child] setsid failed: %s", strerror(errno));
            _exit(1);
        }

        // 2. Slave becomes controlling terminal of this session
        if (ioctl(slave_fd, TIOCSCTTY, 0) < 0) {
            LOGE("[child] TIOCSCTTY failed: %s (continuing anyway)", strerror(errno));
            // Not fatal — some kernels allow it even without this
        }

        // 3. Wire stdio to slave PTY
        dup2(slave_fd, STDIN_FILENO);
        dup2(slave_fd, STDOUT_FILENO);
        dup2(slave_fd, STDERR_FILENO);
        if (slave_fd > STDERR_FILENO) close(slave_fd);

        // 4. Change directory
        if (cwd_str) {
            if (chdir(cwd_str) != 0) {
                LOGE("[child] chdir(%s) failed: %s", cwd_str, strerror(errno));
            }
        }

        // 5. Reset signals to default so proot/bash behave normally
        signal(SIGINT,  SIG_DFL);
        signal(SIGQUIT, SIG_DFL);
        signal(SIGTSTP, SIG_DFL);
        signal(SIGTTIN, SIG_DFL);
        signal(SIGTTOU, SIG_DFL);
        signal(SIGCHLD, SIG_DFL);

        // 6. Execute
        if (envp) {
            execve(argv[0], argv, envp);
        } else {
            execv(argv[0], argv);
        }

        // If we get here, exec failed
        LOGE("[child] execve(%s) failed: %s", argv[0], strerror(errno));
        _exit(127);
    }

    // ── Parent Process ─────────────────────────────────────────────────────
    close(slave_fd);

    if (cwd_str) (*env)->ReleaseStringUTFChars(env, cwd, cwd_str);
    free_c_array(argv);
    free_c_array(envp);

    if (pid < 0) {
        LOGE("fork failed: %s", strerror(errno));
        close(master_fd);
        return -1;
    }

    // Write child PID out
    if (pids) {
        jint *p = (*env)->GetIntArrayElements(env, pids, NULL);
        p[0] = (jint)pid;
        (*env)->ReleaseIntArrayElements(env, pids, p, 0);
    }

    LOGI("Subprocess started: pid=%d master_fd=%d", pid, master_fd);
    return (jint)master_fd;
}

// ─── Resize PTY ──────────────────────────────────────────────────────────────

JNIEXPORT void JNICALL
Java_com_editor_mscode_NativeTerminalPlugin_nativeResizePty(
        JNIEnv *env, jobject thiz,
        jint master_fd, jint rows, jint cols)
{
    if (master_fd < 0) return;
    struct winsize ws;
    memset(&ws, 0, sizeof(ws));
    ws.ws_row = (unsigned short)rows;
    ws.ws_col = (unsigned short)cols;
    if (ioctl(master_fd, TIOCSWINSZ, &ws) < 0) {
        LOGE("TIOCSWINSZ failed: %s", strerror(errno));
    }
}

// ─── Send Signal ─────────────────────────────────────────────────────────────

JNIEXPORT void JNICALL
Java_com_editor_mscode_NativeTerminalPlugin_nativeSendSignal(
        JNIEnv *env, jobject thiz,
        jint pid, jint signum)
{
    if (pid <= 0) return;
    if (kill((pid_t)pid, signum) < 0) {
        LOGE("kill(%d, %d) failed: %s", pid, signum, strerror(errno));
    }
}

// ─── Wait/Reap Child ─────────────────────────────────────────────────────────

JNIEXPORT jint JNICALL
Java_com_editor_mscode_NativeTerminalPlugin_nativeWaitForChild(
        JNIEnv *env, jobject thiz, jint pid)
{
    if (pid <= 0) return -1;
    int status = 0;
    waitpid((pid_t)pid, &status, WNOHANG);
    return (jint)status;
}