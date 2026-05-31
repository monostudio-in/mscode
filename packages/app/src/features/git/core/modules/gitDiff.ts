// src/features/git/core/gitDiff.ts

import { run, getRelativePath } from './gitRunner';

/**
 * Returns the content of a file at a specific git ref.
 *
 * @param ref
 *   - `'INDEX'`  → the staged version (`:path` in git show)
 *   - `'HEAD'`   → the last committed version (`HEAD:path`)
 *   - any string → an arbitrary ref, e.g. `stash@{0}` or a commit hash
 *
 * Returns an empty string for newly added files that don't exist in the ref yet.
 */
export async function getFileContent(
  cwd: string,
  ref: 'HEAD' | 'INDEX' | string,
  path: string
): Promise<string> {
  try {
    const rel = getRelativePath(cwd, path);

    let target: string;
    if      (ref === 'INDEX') target = `:${rel}`;
    else if (ref === 'HEAD')  target = `HEAD:${rel}`;
    else                      target = `${ref}:${rel}`; // e.g. stash@{0}:src/main.ts

    return await run(`show "${target}"`, cwd, true);
  } catch (e: any) {
    // New files don't exist in old refs — return empty string instead of throwing
    if (e?.message?.includes('exists on disk, but not in')) return '';
    if (e?.message?.includes('does not exist in'))          return '';
    throw e;
  }
}
