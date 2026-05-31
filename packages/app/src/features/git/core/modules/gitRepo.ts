// src/features/git/core/gitRepo.ts
//
// Repository lifecycle operations.
// Handles the /sdcard → separate-git-dir workaround required on Android:
// git cannot store the .git folder inside /storage/emulated/0 due to
// filesystem restrictions, so we redirect it to an internal path.


// src/features/git/core/modules/gitRepo.ts

import { taskManager } from '@/core/extensionAPI/tasks/taskManager';
import { run, runVisible } from './gitRunner';

// MSCode root directory
const LINUX_BASE_DIR = '/root/.mscode_git_repos';

async function mkdirGitRepos(): Promise<void> {
  await new Promise<void>(res => {
    taskManager
      .execute(`mkdir -p "${LINUX_BASE_DIR}"`, '/', () => {})
      .result.then(() => res()).catch(() => res());
  });
}

export async function init(cwd: string, defaultBranch = 'main'): Promise<void> {
  const normalized = cwd.replace('/storage/emulated/0', '/sdcard');

  if (normalized.startsWith('/sdcard')) {
    await mkdirGitRepos();
    const uniqueHash = `repo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const internalGitDir = `${LINUX_BASE_DIR}/${uniqueHash}`;
    
    await runVisible(`init -b ${defaultBranch} --separate-git-dir="${internalGitDir}"`, cwd);
  } else {
    await runVisible(`init -b ${defaultBranch}`, cwd);
  }

  await run('config core.fileMode false', cwd, true);
  await run('config core.symlinks false', cwd, true);
  await run('config core.ignorecase true', cwd, true);
}

export async function clone(url: string, parentDir: string): Promise<void> {
  let targetName = url.split('/').pop()?.replace('.git', '') || 'repo';
  const normalizedParent = parentDir.replace('/storage/emulated/0', '/sdcard');

  if (normalizedParent.startsWith('/sdcard')) {
    await mkdirGitRepos();
    const uniqueHash = `repo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const internalGitDir = `${LINUX_BASE_DIR}/${uniqueHash}`;
    
    await runVisible(`clone --separate-git-dir="${internalGitDir}" "${url}" "${targetName}"`, parentDir);
  } else {
    await runVisible(`clone "${url}"`, parentDir);
  }

  const repoCwd = `${parentDir}/${targetName}`;
  await run('config core.fileMode false',  repoCwd, true);
  await run('config core.symlinks false',  repoCwd, true);
  await run('config core.ignorecase true', repoCwd, true);
}

export async function createGithubRepo(name: string, isPrivate: boolean, token: string): Promise<string> {
  const res = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      Authorization:  `token ${token}`,
      Accept:         'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, private: isPrivate, auto_init: false }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to create GitHub repository');
  }

  const data = await res.json();
  return data.clone_url;
}