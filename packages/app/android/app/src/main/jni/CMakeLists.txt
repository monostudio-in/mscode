cmake_minimum_required(VERSION 3.22.1)

project("mscode_pty")

# ─── pty_helper shared library ───────────────────────────────────────────────
add_library(
    pty_helper        # Name — must match System.loadLibrary("pty_helper")
    SHARED
    pty_helper.c
)

# Android NDK built-in libs
find_library(log-lib log)
find_library(android-lib android)

target_link_libraries(
    pty_helper
    ${log-lib}
    ${android-lib}
)

# Enable POSIX extensions (needed for ptsname_r, grantpt, etc.)
target_compile_options(pty_helper PRIVATE
    -D_GNU_SOURCE
    -Wall
    -Wextra
    -O2
)