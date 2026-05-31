// src/features/git/core/gitStaging.ts

import { runVisible, getRelativePath } from './gitRunner';

/** Stages a single file. */
export async function stage(cwd: string, path: string): Promise<void> {
  await runVisible(`add "${getRelativePath(cwd, path)}"`, cwd);
}

/** Stages all changes in the working tree. */
export async function stageAll(cwd: string): Promise<void> {
  await runVisible('add .', cwd);
}

/**
 * Unstages a single file.
 * Falls back to `rm --cached` on brand-new repos without a HEAD commit yet.
 */
export async function unstage(cwd: string, path: string): Promise<void> {
  const rel = getRelativePath(cwd, path);
  try {
    await runVisible(`reset HEAD -- "${rel}"`, cwd);
  } catch (e: any) {
    if (
      e?.message?.includes("ambiguous argument 'HEAD'") ||
      e?.message?.includes('unknown revision')
    ) {
      try { await runVisible(`rm --cached -- "${rel}"`, cwd); } catch { /* ignore */ }
    } else {
      throw e;
    }
  }
}

/**
 * Unstages all staged changes.
 * Falls back to `rm --cached -r .` on repos without a HEAD commit yet.
 */
export async function unstageAll(cwd: string): Promise<void> {
  try {
    await runVisible('reset HEAD', cwd);
  } catch (e: any) {
    if (
      e?.message?.includes("ambiguous argument 'HEAD'") ||
      e?.message?.includes('unknown revision')
    ) {
      try { await runVisible('rm --cached -r .', cwd); } catch { /* ignore */ }
    } else {
      throw e;
    }
  }
}

/**
 * Discards all working-tree changes for a single file.
 * For untracked files, falls back to `git clean`.
 */
export async function discard(cwd: string, path: string): Promise<void> {
  const rel = getRelativePath(cwd, path);
  try {
    await runVisible(`checkout -- "${rel}"`, cwd);
  } catch (e: any) {
    if (e?.message?.includes('did not match any file')) {
      await runVisible(`clean -f -- "${rel}"`, cwd);
    } else {
      throw e;
    }
  }
}
