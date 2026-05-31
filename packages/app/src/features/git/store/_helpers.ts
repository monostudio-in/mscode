// src/features/git/store/_helpers.ts
// ─── Private utilities shared across all git slices ───────────────────────────

import { Capacitor }            from '@capacitor/core';
import { useDecorationStore }   from '@/features/explorer/store/decorationStore';
import { useExplorerStore }     from '@/features/explorer/store/exploreStore';
import { useNotificationStore } from '@/store/notificationStore';
import { GIT_STATUS_META }      from '../types';
import type { GitChangedFile }  from '../types';

// ─── Workspace ────────────────────────────────────────────────────────────────

export const getCwd = (): string | null =>
  useExplorerStore.getState().workspacePath;

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifyError = (title: string, message: string) =>
  useNotificationStore.getState().addNotification({
    type: 'error', title, source: 'Git', message,
  });

export const notifySuccess = (message: string) =>
  useNotificationStore.getState().addNotification({
    type: 'success', title: 'Git', source: 'Git', message,
  });

// ─── Decorations ──────────────────────────────────────────────────────────────

export function syncDecorations(staged: GitChangedFile[], unstaged: GitChangedFile[]) {
  const entries: Record<string, { badge: string; color: string; tooltip: string; propagate: boolean }> = {};
  [...staged, ...unstaged].forEach(f => {
    const meta = GIT_STATUS_META[f.status];
    entries[f.path] = { badge: meta.badge, color: meta.color, tooltip: meta.label, propagate: true };
  });
  useDecorationStore.getState().setDecorations(entries);
}

// ─── Platform guard ───────────────────────────────────────────────────────────

export function assertNative(action: string): boolean {
  if (!Capacitor.isNativePlatform()) {
    console.warn(`[gitStore] "${action}" skipped — not on a native platform.`);
    return false;
  }
  return true;
}
