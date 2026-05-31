// src/features/git/core/gitBranches.ts

import { run, runVisible, getAuthPrefix } from './gitRunner';
import type { GitBranch } from '../../types';

/** Returns the name of the currently checked-out branch (silent, for polling). */
export async function getCurrentBranch(cwd: string): Promise<string> {
  return run('branch --show-current', cwd, true);
}

/**
 * Lists all local and remote branches with tracking metadata.
 * Parses `git branch -vv --all` output into structured objects.
 */
export async function listBranches(cwd: string): Promise<GitBranch[]> {
  try {
    const output = await run('branch -vv --all', cwd, true);
    if (!output) return [];

    return output
      .split('\n')
      .filter(l => l.trim())
      .map(line => {
        const isCurrent = line.startsWith('*');
        const trimmed   = line.slice(2).trim();
        const isRemote  = trimmed.startsWith('remotes/');
        const namePart  = trimmed.split(/\s+/)[0];
        const name      = isRemote ? namePart.replace('remotes/', '') : namePart;

        if (name.endsWith('/HEAD') || name === 'HEAD') return null;

        let upstream: string | undefined;
        let ahead = 0, behind = 0;

        const trackMatch = trimmed.match(/\[([^\]]+)\]/);
        if (trackMatch) {
          const info = trackMatch[1];
          upstream   = info.split(':')[0].trim();
          const aM   = info.match(/ahead (\d+)/);
          const bM   = info.match(/behind (\d+)/);
          if (aM) ahead  = parseInt(aM[1], 10);
          if (bM) behind = parseInt(bM[1], 10);
        }

        return { name, isRemote, isCurrent, upstream, ahead, behind } as GitBranch;
      })
      .filter(Boolean) as GitBranch[];
  } catch {
    return [];
  }
}

// ─── Branch Operations (user-initiated → visible) ─────────────────────────────

/** Checks out an existing branch. */
export async function checkout(cwd: string, branch: string): Promise<void> {
  await runVisible(`checkout "${branch}"`, cwd);
}

/**
 * Creates and checks out a new branch.
 * If `fromBranch` is provided the new branch is based on it.
 */
export async function createBranch(cwd: string, name: string, fromBranch?: string): Promise<void> {
  if (fromBranch) {
    await runVisible(`checkout -b "${name}" "${fromBranch}"`, cwd);
  } else {
    await runVisible(`checkout -b "${name}"`, cwd);
  }
}

/** Force-deletes a local branch (mirrors VS Code's -D behaviour). */
export async function deleteBranch(cwd: string, name: string): Promise<void> {
  await runVisible(`branch -D "${name}"`, cwd);
}

/** Deletes a branch from the remote, using OAuth auth when available. */
export async function deleteRemoteBranch(cwd: string, remote: string, branch: string): Promise<void> {
  try {
    const authPrefix = await getAuthPrefix();
    await runVisible(`${authPrefix} push ${remote} --delete "${branch}"`, cwd);
  } catch (e: any) {
    if (e?.message?.includes('Authentication required') || e?.message?.includes('access denied')) {
      throw e;
    }
    await runVisible(`push ${remote} --delete "${branch}"`, cwd);
  }
}

/** Renames a branch. */
export async function renameBranch(cwd: string, oldName: string, newName: string): Promise<void> {
  await runVisible(`branch -m "${oldName}" "${newName}"`, cwd);
}

/** Merges the given branch into the current branch. */
export async function merge(cwd: string, branch: string): Promise<void> {
  await runVisible(`merge "${branch}"`, cwd);
}

/** Rebases the current branch onto the given branch. */
export async function rebase(cwd: string, branch: string): Promise<void> {
  await runVisible(`rebase "${branch}"`, cwd);
}
