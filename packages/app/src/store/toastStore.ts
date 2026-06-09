// @/store/toastStore.ts
import { create } from 'zustand';
import React      from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToastType =
  | 'default'
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

export type ToastPosition =
  | 'bottom-center'   // default — floats up from bottom-center
  | 'bottom-left'     // bottom-left corner stack
  | 'bottom-right'    // bottom-right corner stack
  | 'side-right'      // slides in from the right edge
  | 'side-left';      // slides in from the left edge

export interface ToastAction {
  label:   string;
  onClick: () => void;
}

export interface ToastOptions {
  /** Visual type. Controls accent colour and default icon. Default: 'default'. */
  type?:        ToastType;
  /** Where the toast appears. Default: 'bottom-center'. */
  position?:    ToastPosition;
  /**
   * Auto-dismiss after this many milliseconds.
   * Set to 0 for a permanent toast that must be closed manually.
   * Default: 4000.
   */
  duration?:    number;
  /** Secondary line below the main message. */
  description?: string;
  /** Codicon icon name to show on the left. Auto-set from `type` if omitted. */
  icon?:        string;
  /** Inline action button rendered inside the toast. */
  action?:      ToastAction;
  /** Extra CSS class(es) appended to the toast element. */
  className?:   string;
  /**
   * Advanced inline style override.
   * ⚠ Prefer using `type` and theme variables instead of setting
   * `background` here — this is intentionally undocumented in the examples.
   */
  style?:       React.CSSProperties;
}

export interface ToastRecord extends Required<Omit<ToastOptions, 'description' | 'icon' | 'action' | 'className' | 'style'>> {
  id:          string;
  message:     string;
  createdAt:   number;
  // Optional fields kept optional
  description?: string;
  icon?:        string;
  action?:      ToastAction;
  className?:   string;
  style?:       React.CSSProperties;
}

// ── Default icons per type ────────────────────────────────────────────────────

export const DEFAULT_ICONS: Record<ToastType, string> = {
  default: 'info',
  success: 'check',
  error:   'error',
  warning: 'warning',
  info:    'info',
};

// ── Store ─────────────────────────────────────────────────────────────────────

interface ToastState {
  toasts: ToastRecord[];
  _add:   (message: string, options?: ToastOptions) => string;
  remove: (id: string) => void;
  clear:  () => void;
}

let _counter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  _add: (message, options = {}) => {
    const id = `toast-${Date.now()}-${++_counter}`;
    const record: ToastRecord = {
      id,
      message,
      type:     options.type     ?? 'default',
      position: options.position ?? 'bottom-center',
      duration: options.duration ?? 4000,
      createdAt: Date.now(),
      description: options.description,
      icon:        options.icon,
      action:      options.action,
      className:   options.className,
      style:       options.style,
    };
    set(s => ({ toasts: [...s.toasts, record] }));
    return id;
  },

  remove: (id) =>
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  clear: () => set({ toasts: [] }),
}));

// ── Public toast() API ────────────────────────────────────────────────────────

const _fire = (message: string, options?: ToastOptions): string =>
  useToastStore.getState()._add(message, options);

export const toast = Object.assign(
  (message: string, options?: ToastOptions) => _fire(message, options),
  {
    success: (message: string, options?: Omit<ToastOptions, 'type'>) =>
      _fire(message, { ...options, type: 'success' }),

    error: (message: string, options?: Omit<ToastOptions, 'type'>) =>
      _fire(message, { ...options, type: 'error' }),

    warning: (message: string, options?: Omit<ToastOptions, 'type'>) =>
      _fire(message, { ...options, type: 'warning' }),

    info: (message: string, options?: Omit<ToastOptions, 'type'>) =>
      _fire(message, { ...options, type: 'info' }),

    /** Side toast shorthand — defaults to side-right. */
    side: (message: string, options?: Omit<ToastOptions, 'position'> & { position?: 'side-right' | 'side-left' }) =>
      _fire(message, { position: 'side-right', ...options }),

    /** Remove a specific toast by id. */
    dismiss: (id: string) => useToastStore.getState().remove(id),

    /** Remove all toasts immediately. */
    clear: () => useToastStore.getState().clear(),
  }
);