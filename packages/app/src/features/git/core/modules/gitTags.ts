// src/features/git/core/gitTags.ts

import { run, runVisible, getAuthPrefix } from './gitRunner';

/** Returns all tag names in the repo (silent, for polling). */
export async function getTags(cwd: string): Promise<string[]> {
  try {
    const out = await run('tag', cwd, true);
    return out.split('\n').map(t => t.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Creates a new tag.
 * If `message` is provided, creates an annotated tag; otherwise creates a lightweight tag.
 */
export async function createTag(cwd: string, name: string, message?: string): Promise<void> {
  if (message?.trim()) {
    await runVisible(`tag -a "${name}" -m "${message.replace(/"/g, '\\"')}"`, cwd);
  } else {
    await runVisible(`tag "${name}"`, cwd);
  }
}

/** Deletes a local tag. */
export async function deleteTag(cwd: string, name: string): Promise<void> {
  await runVisible(`tag -d "${name}"`, cwd);
}

/** Pushes all local tags to the remote, using OAuth auth when available. */
export async function pushTags(cwd: string): Promise<void> {
  try {
    const authPrefix = await getAuthPrefix();
    await runVisible(`${authPrefix} push --tags`, cwd);
  } catch (e: any) {
    if (e?.message?.includes('Authentication required')) throw e;
    await runVisible('push --tags', cwd);
  }
}
