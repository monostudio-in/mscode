// src/features/git/core/gitCommits.ts

import { run, runVisible } from './gitRunner';
import type { GitCommit }  from '../../types';

/** Creates a new commit with the given message. Supports --signoff. */
export async function commit(
  cwd: string,
  message: string,
  opts: { signoff?: boolean } = {}
): Promise<void> {
  const sFlag = opts.signoff ? '-s ' : '';
  await runVisible(`commit ${sFlag}-m "${message.replace(/"/g, '\\"')}"`, cwd);
}

/**
 * Amends the most recent commit.
 * If `message` is provided, replaces the commit message; otherwise uses --no-edit.
 */
export async function commitAmend(
  cwd: string,
  message?: string,
  opts: { signoff?: boolean } = {}
): Promise<void> {
  const sFlag = opts.signoff ? '-s ' : '';
  if (message?.trim()) {
    await runVisible(`commit --amend ${sFlag}-m "${message.replace(/"/g, '\\"')}"`, cwd);
  } else {
    await runVisible(`commit --amend ${sFlag}--no-edit`, cwd);
  }
}

/** Soft-resets to HEAD~1, leaving all changes staged. */
export async function undoLastCommit(cwd: string): Promise<void> {
  await runVisible('reset --soft HEAD~1', cwd);
}

/**
 * Returns the 20 most recent commits as structured objects (silent polling).
 * Format: hash | shortHash | subject | author | relative date
 */
export async function getRecentCommits(cwd: string): Promise<GitCommit[]> {
  try {
    const output = await run('log -n 20 --pretty=format:"%H|%h|%s|%an|%cr"', cwd, true);
    if (!output) return [];
    return output.split('\n').map(line => {
      const [hash, shortHash, message, author, date] = line.split('|');
      return { hash, shortHash, message, author, date };
    });
  } catch {
    return [];
  }
}
