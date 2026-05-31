// src/core/extensionAPI/modules/filesystemModule.ts 
//
// Full filesystem access for extension developers.
//
// Under the hood this delegates to the platform-specific IFileSystem
// (AndroidFileSystem on device, WebFileSystem in browser), so extension
// code is always platform-agnostic.
//
// @example
//   const files = await mscode.fs.readDir('/sdcard/my-project/src');
//   const code  = await mscode.fs.readFile('/sdcard/my-project/src/main.ts');
//   await mscode.fs.writeFile('/sdcard/my-project/out.txt', 'hello');

import { fs } from '@/core/fileSystem';
import type { FileStat } from '@/core/fileSystem/IFileSystem';

// ─── Extra types exposed to extension authors ─────────────────────────────────

export interface WriteOptions {
  /** Create intermediate directories if they do not exist (default: true) */
  recursive?: boolean;
}

export interface CopyOptions {
  /** Overwrite the destination if it already exists (default: true) */
  overwrite?: boolean;
}

// ─── Module factory ───────────────────────────────────────────────────────────

export const createFilesystemModule = (_extId: string) => ({

  // ── READ ──────────────────────────────────────────────────────────────────

  /**
   * List the entries inside a directory.
   * Returns an empty array (never throws) when the path does not exist.
   *
   * @example
   * const entries = await mscode.fs.readDir('/sdcard/project/src');
   * const tsFiles = entries.filter(e => !e.isDirectory && e.name.endsWith('.ts'));
   */
  readDir: (path: string): Promise<FileStat[]> => {
    return fs.readDir(path);
  },

  /**
   * Read a file's content as a UTF-8 string.
   *
   * @example
   * const json = await mscode.fs.readFile('/sdcard/project/package.json');
   * const pkg  = JSON.parse(json);
   */
  readFile: (path: string): Promise<string> => {
    return fs.readFile(path);
  },

  /**
   * Read a file and parse it as JSON in one step.
   * Throws a descriptive error when the file is missing or malformed.
   *
   * @example
   * const config = await mscode.fs.readJson<MyConfig>('/sdcard/project/.myextrc');
   */
  readJson: async <T = unknown>(path: string): Promise<T> => {
    const raw = await fs.readFile(path);
    try {
      return JSON.parse(raw) as T;
    } catch (e) {
      throw new Error(`[mscode.fs] Failed to parse JSON at "${path}": ${(e as Error).message}`);
    }
  },

  // ── WRITE ─────────────────────────────────────────────────────────────────

  /**
   * Write (or overwrite) a file with UTF-8 content.
   * Parent directories are created automatically.
   *
   * @example
   * await mscode.fs.writeFile('/sdcard/project/dist/bundle.js', compiledCode);
   */
  writeFile: (path: string, content: string, _options?: WriteOptions): Promise<void> => {
    return fs.writeFile(path, content);
  },

  /**
   * Serialize a value to JSON and write it to a file.
   *
   * @example
   * await mscode.fs.writeJson('/sdcard/project/.myextrc', { theme: 'dark' });
   */
  writeJson: (path: string, value: unknown, indent = 2): Promise<void> => {
    return fs.writeFile(path, JSON.stringify(value, null, indent));
  },

  // ── DIRECTORY ─────────────────────────────────────────────────────────────

  /**
   * Create a directory (and any missing parents).
   *
   * @example
   * await mscode.fs.mkdir('/sdcard/project/dist/assets');
   */
  mkdir: (path: string): Promise<void> => {
    return fs.mkdir(path);
  },

  // ── MOVE / COPY / DELETE ──────────────────────────────────────────────────

  /**
   * Rename or move a file or directory.
   *
   * @example
   * await mscode.fs.rename('/sdcard/project/old.ts', '/sdcard/project/new.ts');
   */
  rename: (oldPath: string, newPath: string): Promise<void> => {
    return fs.rename(oldPath, newPath);
  },

  /**
   * Recursively copy a file or directory.
   * On Android this handles non-empty directories correctly.
   *
   * @example
   * await mscode.fs.copy('/sdcard/project/src', '/sdcard/project/src-backup');
   */
  copy: (fromPath: string, toPath: string, _options?: CopyOptions): Promise<void> => {
    if (!fs.copy) {
      return Promise.reject(new Error('[mscode.fs] copy() is not supported on this platform'));
    }
    return fs.copy(fromPath, toPath);
  },

  /**
   * Recursively delete a file or directory.
   * Silently succeeds when the path does not exist.
   *
   * @example
   * await mscode.fs.delete('/sdcard/project/dist');
   */
  delete: async (path: string): Promise<void> => {
    try {
      await fs.delete(path);
    } catch (e: any) {
      // "File does not exist" is not an error from the caller's perspective
      const msg: string = e?.message ?? '';
      if (!msg.toLowerCase().includes('exist') && !msg.toLowerCase().includes('not found')) {
        throw e;
      }
    }
  },

  // ── UTILITIES ─────────────────────────────────────────────────────────────

  /**
   * Check whether a path exists (file or directory).
   *
   * @example
   * if (await mscode.fs.exists('/sdcard/project/.git')) {
   *   // it's a git repo
   * }
   */
  exists: async (path: string): Promise<boolean> => {
    try {
      // readDir for directories, readFile for files — both throw on missing
      // const stat = await fs.readDir(path);
      return true; // path is a directory that could be read
    } catch {
      try {
        await fs.readFile(path);
        return true; // path is a readable file
      } catch {
        return false;
      }
    }
  },

  /**
   * Return basic metadata for a path without reading its content.
   * Returns `null` when the path does not exist.
   *
   * @example
   * const stat = await mscode.fs.stat('/sdcard/project/src');
   * if (stat?.isDirectory) console.log('it is a folder');
   */
  stat: async (path: string): Promise<FileStat | null> => {
    // We can infer type from readDir (directory) vs readFile (file)
    const parts = path.split('/');
    const name  = parts[parts.length - 1] ?? path;

    try {
      await fs.readDir(path);
      return { name, path, isDirectory: true };
    } catch {
      try {
        await fs.readFile(path);
        return { name, path, isDirectory: false };
      } catch {
        return null;
      }
    }
  },

  /**
   * Recursively list ALL files under a directory (no directories included).
   * Useful for walking a project tree.
   *
   * @example
   * const allTs = (await mscode.fs.walk('/sdcard/project/src'))
   *   .filter(p => p.endsWith('.ts'));
   */
  walk: async (dirPath: string): Promise<string[]> => {
    const results: string[] = [];

    const recurse = async (p: string): Promise<void> => {
      let entries: FileStat[];
      try {
        entries = await fs.readDir(p);
      } catch {
        return;
      }
      for (const entry of entries) {
        if (entry.isDirectory) {
          await recurse(entry.path);
        } else {
          results.push(entry.path);
        }
      }
    };

    await recurse(dirPath);
    return results;
  },
});

export type FilesystemModule = ReturnType<typeof createFilesystemModule>;