// src/features/git/core/gitLogger.ts
//
// Shared logging utilities for all git modules.
// Mirrors VS Code behaviour:
//   • Every git command is logged to the "Git" output channel
//   • Silent ops never force-open the panel
//   • User-initiated ops call openGitPanel() before running

import { useOutputStore } from '@/features/termis/components/output/store/outputStore';
import { useTermisStore }  from '@/features/termis/store/termisStore';

export const GIT_CHANNEL = 'Git';

/**
 * Appends a timestamped command + output entry to the "Git" output channel.
 * Never forces the panel open — callers that want visibility call openGitPanel() first.
 */
export function logGit(label: string, output: string): void {
  try {
    const store = useOutputStore.getState();
    store.createChannel(GIT_CHANNEL);           // no-op if already exists
    const ts = new Date().toLocaleTimeString();
    store.appendLog(GIT_CHANNEL, `[${ts}] > git ${label}`);
    if (output) store.appendLog(GIT_CHANNEL, output);
  } catch { /* output store not ready during early boot */ }
}

/**
 * Switches the Output panel to the "Git" channel and makes it visible.
 * Called before user-initiated operations (commit, push, pull, …).
 */
export function openGitPanel(): void {
  try {
    useOutputStore.getState().setActiveChannel(GIT_CHANNEL);
    useTermisStore.getState().setActiveView('output');
  } catch { /* termis store not ready */ }
}
