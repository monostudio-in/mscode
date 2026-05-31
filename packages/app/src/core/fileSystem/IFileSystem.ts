// src/core/fileSystem/IFileSystem.ts

/**
 * ============================================================================
 *  MS CODE UNIFIED ABSTRACT VIRTUAL FILE SYSTEM INTERFACE (VFS)
 * ============================================================================
 * * ─── PLATFORM INVERSION ARCHITECTURE ───────────────────────────────────────
 * * ┌──────────────────────────────────────────────────┐
 * │          │          Core Workspace / Editor Engine          │
 * │          └────────────────────────┬─────────────────────────┘
 * │                                   │
 * │                                   ▼ Consumes
 * │          ┌──────────────────────────────────────────────────┐
 * │          │             IFileSystem Interface                 │
 * │          └────────────────────────┬─────────────────────────┘
 * │                                   │
 * ┌───────────────────────────┼───────────────────────────┐
 * ▼ Plugs In                  ▼ Plugs In                  ▼ Plugs In
 * ┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
 * │  AndroidFileSystem   │    │  WindowsFileSystem   │    │  WebMemoryFileSystem │
 * │ (Private Sandbox/I/O)│    │ (Native Win32 APIs)  │    │ (Browser IndexedDB)  │
 * └──────────────────────┘    └──────────────────────┘    └──────────────────────┘
 * * @description
 * This definitions file establishes the primary storage boundary contract for MS Code.
 * By decoupling the physical platform operations through dependency inversion, the entire
 * IDE engine can read, write, clone, and traverse directories without being aware of the
 * underlying filesystem hardware implementation details.
 */

/**
 * Normalized directory snapshot metadata record.
 * Represents standard file or folder attributes returned during traversal passes.
 */
export interface FileStat {
  /** The natural name of the node including extensions (e.g., 'index.tsx' or 'styles') */
  name: string;
  /** Complete absolute canonical layout path target (e.g., '/storage/emulated/0/project/index.tsx') */
  path: string;
  /** Flags whether the current node represents a container directory layout branch. */
  isDirectory: boolean;
}

/**
 * Primary Core File System Abstract Boundary Protocol.
 * Every environmental runtime adapter must implement this interface to drive data streams.
 */
export interface IFileSystem {
  
  /**
   * Scans a target directory scope and returns an array of its top-level entry configurations.
   * * @param {string} path Specific absolute location folder targeted for verification.
   * @returns {Promise<FileStat[]>} Flat collection holding individual directory layout metrics snapshots.
   * * @example
   * const files = await fs.readDir('/my-project');
   * // Expected: [{ name: 'src', path: '/my-project/src', isDirectory: true }, ...]
   */
  readDir(path: string): Promise<FileStat[]>;

  /**
   * Extracts data payload text streams out of a targeted layout node file.
   * * @param {string} path Raw absolute filepath variable target.
   * @returns {Promise<string>} Standardized raw character string containing file content.
   */
  readFile(path: string): Promise<string>;

  /**
   * Commits string data blocks directly back into a specified absolute file location node.
   * If parent path branches do not exist, they should be automatically provisioned recursively.
   * * @param {string} path Target location reference where content must be persisted.
   * @param {string} content Raw text payload block stream to save.
   */
  writeFile(path: string, content: string): Promise<void>;

  /**
   * Provisions a brand-new storage folder tracking boundary sequence on the system layout.
   * * @param {string} path Target folder tree node to compile.
   */
  mkdir(path: string): Promise<void>;

  /**
   * Mutates structural tracking properties, reassigning file labels or changing directory trees.
   * * @param {string} oldPath Valid source coordinate point link where elements currently reside.
   * @param {string} newPath Destination layout path mapping where footprints must relocate.
   */
  rename(oldPath: string, newPath: string): Promise<void>;

  /**
   * Erases a targeted filesystem node point from physical hardware storage allocations.
   * If target matches a folder directory, it must perform deep recursive sweeps to purge all contents.
   * * @param {string} path Target point node location tracking references to destroy.
   */
  delete(path: string): Promise<void>;

  /**
   * Optional optimization feature: Performs deep copies of files or complete subdirectory structures.
   * * @param {string} fromPath Origin structural source link.
   * @param {string} toPath Target point destination link.
   */
  copy?(fromPath: string, toPath: string): Promise<void>;

  /**
   * Optional platform anchor launcher: Triggers OS native system directory pickers 
   * to securely choose active root folder permissions coordinates for workspace mounting.
   * * @returns {Promise<{ success: boolean; name?: string; path?: string }>} Response footprint variables.
   */
  openFolder?(): Promise<{ success: boolean; name?: string; path?: string }>;

  /**
   * Optional cleanup routine: Detaches active document tracking listeners, flushes state tables,
   * and unmounts folder tree file watchers safely.
   */
  closeFolder?(): void;
}