// src/features/git/core/gitStash.ts

import { run, runVisible } from './gitRunner';

/** Returns all stash entries as structured objects (silent, for polling). */
export async function getStashes(
  cwd: string
): Promise<{ index: number; description: string }[]> {
  try {
    const out = await run('stash list', cwd, true);
    if (!out.trim()) return [];
    return out
      .split('\n')
      .map(line => {
        const match = line.match(/^stash@\{(\d+)\}:\s*(.*)$/);
        if (match) return { index: parseInt(match[1], 10), description: match[2] };
        return null;
      })
      .filter(Boolean) as { index: number; description: string }[];
  } catch {
    return [];
  }
}

/** Returns the list of file paths affected by the given stash entry (silent). */
export async function getStashFiles(cwd: string, index: number): Promise<string[]> {
  try {
    const out = await run(`stash show --name-only stash@{${index}}`, cwd, true);
    if (!out.trim()) return [];
    return out.split('\n').map(l => l.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Stashes current changes with optional message, untracked inclusion, and staged-only mode.
 */
export async function stash(
  cwd: string,
  message?: string,
  includeUntracked = false,
  onlyStaged = false
): Promise<void> {
  let cmd = 'stash push';
  if (includeUntracked) cmd += ' --include-untracked';
  if (onlyStaged)       cmd += ' --staged';
  if (message?.trim())  cmd += ` -m "${message.replace(/"/g, '\\"')}"`;
  await runVisible(cmd, cwd);
}

/** Applies a stash entry without removing it from the stash list. */
export async function stashApply(cwd: string, index?: number): Promise<void> {
  const target = index !== undefined ? `stash@{${index}}` : '';
  await runVisible(`stash apply ${target}`, cwd);
}

/** Applies a stash entry and removes it from the stash list. */
export async function stashPop(cwd: string, index?: number): Promise<void> {
  const target = index !== undefined ? `stash@{${index}}` : '';
  await runVisible(`stash pop ${target}`, cwd);
}

/** Removes a specific stash entry. */
export async function stashDrop(cwd: string, index: number): Promise<void> {
  await runVisible(`stash drop stash@{${index}}`, cwd);
}

/** Removes all stash entries. */
export async function stashClear(cwd: string): Promise<void> {
  await runVisible('stash clear', cwd);
}
