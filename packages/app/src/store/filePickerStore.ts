// src/store/filePickerStore.ts
import { create } from 'zustand';
import { msEvents } from '@/core/extensionAPI/events/EventManager';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A named group of file extensions for the type-filter dropdown.
 * Use an empty `extensions` array to mean "All Files".
 */
export interface FileFilter {
  /** Label shown in the filter Select, e.g. "TypeScript Files" */
  label: string;
  /** Extensions without the leading dot, e.g. ['ts', 'tsx']. Empty = all files. */
  extensions: string[];
}

export interface PickerOptions {
  /**
   * Interaction mode:
   * - `file`      → pick one existing file   → resolves string | null
   * - `folder`    → navigate then confirm     → resolves string | null
   * - `saveAs`    → choose directory + name   → resolves string | null  (full path)
   * - `multiFile` → pick multiple files       → resolves string[] | null
   */
  mode: 'file' | 'folder' | 'saveAs' | 'multiFile';

  /** Modal title (auto-derived from mode when omitted). */
  title?: string;
  /** Header icon name from IconRegistry. */
  icon?: string;
  /** Override the confirm-button label. */
  buttonText?: string;

  /** File-type filters rendered as a Select in the footer. First entry is selected by default. */
  filters?: FileFilter[];
  /** Folder-mode gate: folder is only selectable when it contains every one of these filenames. */
  requiredFiles?: string[];

  /** Starting directory. Defaults to 'ROOT'. */
  defaultPath?: string;
  /** Pre-filled filename for saveAs mode. */
  defaultName?: string;
  /** Placeholder text for the saveAs filename input. */
  fileNamePlaceholder?: string;

  /**
   * Show the "New File" and "New Folder" toolbar buttons.
   * Defaults to true; set false to hide them.
   */
  allowCreate?: boolean;
  /** Show dotfiles (names starting with '.'). Defaults to false. */
  showHidden?: boolean;
}

type PickerResult = string | string[] | null;

interface FilePickerState {
  isOpen: boolean;
  options: PickerOptions | null;
  _resolve: ((result: PickerResult) => void) | null;

  /** Open picker for file / folder / saveAs modes. */
  showPicker(options: PickerOptions): Promise<string | null>;

  /** Open picker in multiFile mode. */
  showMultiPicker(options?: Omit<PickerOptions, 'mode'>): Promise<string[] | null>;

  /** Resolve the open promise and close the modal. */
  closePicker(result: PickerResult): void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFilePickerStore = create<FilePickerState>((set, get) => ({
  isOpen: false,
  options: null,
  _resolve: null,

  showPicker: (options) =>
    new Promise<string | null>((resolve) => {
      set({ isOpen: true, options, _resolve: resolve as (r: PickerResult) => void });
      msEvents.emit('onDidOpenFilePicker', options);
    }),

  showMultiPicker: (options = {}) =>
    new Promise<string[] | null>((resolve) => {
      const opts: PickerOptions = { ...options, mode: 'multiFile' };
      set({ isOpen: true, options: opts, _resolve: resolve as (r: PickerResult) => void });
      msEvents.emit('onDidOpenFilePicker', opts);
    }),

  closePicker: (result) => {
    const { _resolve } = get();
    if (_resolve) _resolve(result);
    set({ isOpen: false, options: null, _resolve: null });
    msEvents.emit('onDidCloseFilePicker', result);
  },
}));