// src/features/git/core/gitStatus.ts

import { run, runVisible }  from './gitRunner';
import type { GitChangedFile, GitFileStatus } from '../../types';

/**
 * Parses `git status --porcelain=v1` and returns two flat lists:
 * staged files (index changes) and unstaged files (working-tree changes).
 */
export async function getStatus(
  cwd: string
): Promise<{ staged: GitChangedFile[]; unstaged: GitChangedFile[] }> {
  try {
    const output = await run('status --porcelain=v1', cwd, true); // silent polling

    const staged:   GitChangedFile[] = [];
    const unstaged: GitChangedFile[] = [];

    if (!output) return { staged, unstaged };

    const lines = output.split('\n').filter(line => line.length > 3);

    for (const line of lines) {
      const x = line[0]; // index (staged) status character
      const y = line[1]; // working-tree (unstaged) status character

      let relativePath = line.substring(3).trim();

      // Git wraps paths with special characters in double-quotes
      if (relativePath.startsWith('"') && relativePath.endsWith('"')) {
        relativePath = relativePath.slice(1, -1);
      }

      let oldPath: string | undefined;

      // Renamed files are reported as "old -> new"
      if (relativePath.includes(' -> ')) {
        const parts = relativePath.split(' -> ');
        oldPath      = `${cwd}/${parts[0].trim()}`;
        relativePath = parts[1].trim();
      }

      const absolutePath = `${cwd}/${relativePath}`;
      const name         = relativePath.split('/').pop() || relativePath;

      // 1. Untracked file (??)
      if (x === '?' && y === '?') {
        unstaged.push({ path: absolutePath, name, status: 'untracked' });
        continue;
      }

      // 2. Staged change (X column)
      if (x !== ' ' && x !== '?' && x !== '!') {
        let status: GitFileStatus = 'modified';
        if (x === 'A') status = 'added';
        if (x === 'D') status = 'deleted';
        if (x === 'R') status = 'renamed';
        if (x === 'U') status = 'conflicted';
        staged.push({ path: absolutePath, name, status, oldPath });
      }

      // 3. Unstaged change (Y column)
      if (y !== ' ' && y !== '?' && y !== '!') {
        let status: GitFileStatus = 'modified';
        if (y === 'A') status = 'added';
        if (y === 'D') status = 'deleted';
        if (y === 'R') status = 'renamed';
        if (y === 'U') status = 'conflicted';
        unstaged.push({ path: absolutePath, name, status, oldPath });
      }
    }

    return { staged, unstaged };

  } catch (e) {
    console.error('--- ❌ GIT STATUS ERROR ❌ ---', e);
    throw e;
  }
}

/**
 * Returns true if a rebase is currently in progress in the given repo.
 */
export async function isRebasing(cwd: string): Promise<boolean> {
  try {
    const output   = await run('status', cwd, true);
    const outLower = output.toLowerCase();
    return outLower.includes('rebase in progress') || outLower.includes('currently rebasing');
  } catch {
    return false;
  }
}

/** Aborts the in-progress rebase. Opens the Git output panel. */
export async function abortRebase(cwd: string): Promise<void> {
  await runVisible('rebase --abort', cwd);
}
