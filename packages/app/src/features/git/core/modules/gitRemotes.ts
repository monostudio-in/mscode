// src/features/git/core/gitRemotes.ts
//
// All remote operations attempt authenticated requests first.
// On auth error the error is re-thrown so callers can surface it.
// On other errors (e.g. no network, fetch first) we fallback to non-auth
// but if that fails too, we throw the ORIGINAL error to the UI!

import { run, runVisible, getAuthPrefix } from './gitRunner';

/** Returns the list of configured remote names (silent, for polling). */
export async function getRemotes(cwd: string): Promise<string[]> {
  try {
    const out = await run('remote', cwd, true);
    return out.split('\n').map(r => r.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

export async function fetch(cwd: string): Promise<void> {
  await runVisible('fetch', cwd);
}

export async function fetchPrune(cwd: string): Promise<void> {
  await runVisible('fetch --prune', cwd);
}

export async function fetchAll(cwd: string): Promise<void> {
  await runVisible('fetch --all', cwd);
}

export async function pull(cwd: string): Promise<void> {
  try {
    const authPrefix = await getAuthPrefix();
    await runVisible(`${authPrefix} pull`, cwd);
  } catch (e: any) {
    if (e?.message?.includes('Authentication required')) throw e;
    try { await runVisible('pull', cwd); } catch { throw e; }
  }
}

export async function pullRebase(cwd: string): Promise<void> {
  try {
    const authPrefix = await getAuthPrefix();
    await runVisible(`${authPrefix} pull --rebase`, cwd);
  } catch (e: any) {
    if (e?.message?.includes('Authentication required')) throw e;
    try { await runVisible('pull --rebase', cwd); } catch { throw e; }
  }
}

export async function pullFrom(cwd: string, remote: string, branch: string): Promise<void> {
  try {
    const authPrefix = await getAuthPrefix();
    await runVisible(`${authPrefix} pull ${remote} ${branch}`, cwd);
  } catch (e: any) {
    if (e?.message?.includes('Authentication required')) throw e;
    try { await runVisible(`pull ${remote} ${branch}`, cwd); } catch { throw e; }
  }
}

export async function push(cwd: string): Promise<void> {
  try {
    const authPrefix = await getAuthPrefix();
    await runVisible(`${authPrefix} push`, cwd);
  } catch (e: any) {
    if (e?.message?.includes('Authentication required')) throw e;
    try { await runVisible('push', cwd); } catch { throw e; /* Throw Original Error */ }
  }
}

export async function pushTo(cwd: string, remote: string, branch: string): Promise<void> {
  try {
    const authPrefix = await getAuthPrefix();
    await runVisible(`${authPrefix} push ${remote} ${branch}`, cwd);
  } catch (e: any) {
    if (e?.message?.includes('Authentication required')) throw e;
    try { await runVisible(`push ${remote} ${branch}`, cwd); } catch { throw e; }
  }
}

export async function pushSetUpstream(
  cwd: string,
  branch: string,
  remoteName = 'origin'
): Promise<void> {
  try {
    const authPrefix = await getAuthPrefix();
    await runVisible(`${authPrefix} push -u ${remoteName} ${branch}`, cwd);
  } catch (e: any) {
    if (e?.message?.includes('Authentication required')) throw e;
    try { await runVisible(`push -u ${remoteName} ${branch}`, cwd); } catch { throw e; }
  }
}

export async function addRemote(cwd: string, url: string, remoteName = 'origin'): Promise<void> {
  await runVisible(`remote add ${remoteName} "${url}"`, cwd);
}

export async function removeRemote(cwd: string, remoteName: string): Promise<void> {
  await runVisible(`remote remove ${remoteName}`, cwd);
}