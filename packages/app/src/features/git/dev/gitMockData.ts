// {
// src/features/git/dev/gitMockData.ts
//
// ─── WEB UI TESTING ONLY ─────────────────────────────────────────────────────
// This file is NEVER imported by gitStore.ts or any production code.
// Use only for isolated component development in browser.
//
// Usage (in a dev-only test harness):
//   import { injectGitMock } from '@/features/git/dev/gitMockData';
//   injectGitMock();  // fills gitStore with fake data
// ─────────────────────────────────────────────────────────────────────────────

import type { GitChangedFile, GitBranch, GitCommit } from '../store/gitStore';

// ─── Mock Datasets ────────────────────────────────────────────────────────────

export const MOCK_UNSTAGED: GitChangedFile[] = [
  { path: '/workspace/src/App.tsx',             name: 'App.tsx',             status: 'modified'  },
  { path: '/workspace/src/main.tsx',             name: 'main.tsx',            status: 'modified'  },
  { path: '/workspace/src/features/NewFeature.ts',name: 'NewFeature.ts',      status: 'untracked' },
  { path: '/workspace/src/components/Button.tsx', name: 'Button.tsx',         status: 'modified'  },
  { path: '/workspace/src/utils/helpers.ts',      name: 'helpers.ts',         status: 'deleted'   },
];

export const MOCK_STAGED: GitChangedFile[] = [
  { path: '/workspace/src/index.css',            name: 'index.css',           status: 'added'     },
  { path: '/workspace/README.md',                name: 'README.md',           status: 'modified'  },
];

export const MOCK_BRANCHES: GitBranch[] = [
  { name: 'main',                isCurrent: false, isRemote: false, upstream: 'origin/main',              ahead: 0, behind: 2 },
  { name: 'feat/git-plugin',     isCurrent: true,  isRemote: false, upstream: 'origin/feat/git-plugin',   ahead: 3, behind: 0 },
  { name: 'fix/navbar-bug',      isCurrent: false, isRemote: false, upstream: undefined,                  ahead: 1, behind: 0 },
  { name: 'origin/main',         isCurrent: false, isRemote: true,  upstream: undefined,                  ahead: 0, behind: 0 },
];

export const MOCK_COMMITS: GitCommit[] = [
  { hash: 'abc123456789', shortHash: 'abc1234', message: 'feat: add git plugin UI',         author: 'Dev',  date: '2 hours ago'  },
  { hash: 'def987654321', shortHash: 'def9876', message: 'fix: explorer badge propagation', author: 'Dev',  date: '5 hours ago'  },
  { hash: 'ghi111222333', shortHash: 'ghi1112', message: 'chore: update dependencies',      author: 'Dev',  date: '1 day ago'    },
  { hash: 'jkl444555666', shortHash: 'jkl4445', message: 'refactor: activityBar dynamic',   author: 'Dev',  date: '2 days ago'   },
];

// ─── Injector ─────────────────────────────────────────────────────────────────

/**
* Fills gitStore with mock data for browser-based UI development.
* Call once from a dev-only entry point — never from production code.
*/
export async function injectGitMock(): Promise<void> {
  // Lazy import so production bundles never pull this in
  const { useGitStore }        = await import('../store/gitStore');
  const { useDecorationStore } = await import('@/features/explorer/store/decorationStore');
  const { GIT_STATUS_META }    = await import('../store/gitStore');

  // Build decoration entries
  const allFiles = [...MOCK_STAGED, ...MOCK_UNSTAGED];
  const decorations: Record<string, { badge: string; color: string; tooltip: string; propagate: boolean }> = {};
  allFiles.forEach(f => {
    const meta = GIT_STATUS_META[f.status];
    decorations[f.path] = { badge: meta.badge, color: meta.color, tooltip: meta.label, propagate: true };
  });

  useGitStore.setState({
    isGitRepo:     true,
    isLoading:     false,
    error:         null,
    stagedFiles:   MOCK_STAGED,
    unstagedFiles: MOCK_UNSTAGED,
    currentBranch: 'feat/git-plugin',
    branches:      MOCK_BRANCHES,
    recentCommits: MOCK_COMMITS,
    commitMessage: '',
  });

  useDecorationStore.getState().setDecorations(decorations);

  console.info('[gitMockData] Mock data injected into gitStore ✓');
}

// }




// // // {
// // src/features/git/dev/gitMockData.ts
// //
// // ─── WEB UI TESTING ONLY ─────────────────────────────────────────────────────
// // This file is NEVER imported by gitStore.ts or any production code.
// // Use only for isolated component development in browser.
// //
// // Usage (in a dev-only test harness):
// //   import { injectGitMock } from '@/features/git/dev/gitMockData';
// //   injectGitMock();  // fills gitStore with fake data
// // ─────────────────────────────────────────────────────────────────────────────

// import type { GitChangedFile, GitBranch, GitCommit, GitRepository } from '../store/gitStore';

// // ─── Mock Datasets ────────────────────────────────────────────────────────────

// export const MOCK_UNSTAGED: GitChangedFile[] = [
//   { path: '/workspace/src/App.tsx',             name: 'App.tsx',             status: 'modified'  },
//   { path: '/workspace/src/main.tsx',             name: 'main.tsx',            status: 'modified'  },
//   { path: '/workspace/src/features/NewFeature.ts',name: 'NewFeature.ts',      status: 'untracked' },
//   { path: '/workspace/src/components/Button.tsx', name: 'Button.tsx',         status: 'modified'  },
//   { path: '/workspace/src/utils/helpers.ts',      name: 'helpers.ts',         status: 'deleted'   },
// ];

// export const MOCK_STAGED: GitChangedFile[] = [
//   { path: '/workspace/src/index.css',            name: 'index.css',           status: 'added'     },
//   { path: '/workspace/README.md',                name: 'README.md',           status: 'modified'  },
// ];

// export const MOCK_BRANCHES: GitBranch[] = [
//   { name: 'main',                isCurrent: true,  isRemote: false, upstream: 'origin/main',              ahead: 0, behind: 0 },
//   { name: 'feat/git-plugin',     isCurrent: false, isRemote: false, upstream: 'origin/feat/git-plugin',   ahead: 3, behind: 0 },
//   { name: 'fix/navbar-bug',      isCurrent: false, isRemote: false, upstream: undefined,                  ahead: 1, behind: 0 },
//   { name: 'origin/main',         isCurrent: false, isRemote: true,  upstream: undefined,                  ahead: 0, behind: 0 },
// ];

// export const MOCK_COMMITS: GitCommit[] = [
//   { hash: 'abc123456789', shortHash: 'abc1234', message: 'feat: add git plugin UI',         author: 'Dev',  date: '2 hours ago'  },
//   { hash: 'def987654321', shortHash: 'def9876', message: 'fix: explorer badge propagation', author: 'Dev',  date: '5 hours ago'  },
//   { hash: 'ghi111222333', shortHash: 'ghi1112', message: 'chore: update dependencies',      author: 'Dev',  date: '1 day ago'    },
//   { hash: 'jkl444555666', shortHash: 'jkl4445', message: 'refactor: activityBar dynamic',   author: 'Dev',  date: '2 days ago'   },
// ];

// export const MOCK_REPOSITORIES: GitRepository[] = [
//   {
//     id: '/workspace',
//     name: 'workspace',
//     path: '/workspace',
//     branch: 'main',
//     shortHash: 'abc1234',
//     ahead: 0,
//     behind: 0,
//   }
// ];

// // ─── Injector ─────────────────────────────────────────────────────────────────

// /**
// * Fills gitStore with mock data for browser-based UI development.
// * Call once from a dev-only entry point — never from production code.
// */
// export async function injectGitMock(): Promise<void> {
//   // Lazy import so production bundles never pull this in
//   const { useGitStore }        = await import('../store/gitStore');
//   const { useDecorationStore } = await import('@/features/explorer/store/decorationStore');
//   const { GIT_STATUS_META }    = await import('../store/gitStore');

//   // Build decoration entries
//   const allFiles = [...MOCK_STAGED, ...MOCK_UNSTAGED];
//   const decorations: Record<string, { badge: string; color: string; tooltip: string; propagate: boolean }> = {};
//   allFiles.forEach(f => {
//     const meta = GIT_STATUS_META[f.status];
//     decorations[f.path] = { badge: meta.badge, color: meta.color, tooltip: meta.label, propagate: true };
//   });

//   useGitStore.setState({
//     isGitRepo:        true,
//     isLoading:        false,
//     error:            null,
//     repositories:     MOCK_REPOSITORIES, // missing repository state added here
//     stagedFiles:      MOCK_STAGED,
//     unstagedFiles:    MOCK_UNSTAGED,
//     currentBranch:    'main',
//     branches:         MOCK_BRANCHES,
//     recentCommits:    MOCK_COMMITS,
//     commitMessage:    'fix: update layout components', // pre-filled to active the commit action
//     showRepositories: true,
//     showChanges:      true,
//     sortMode:         'discovery',
//   });

//   useDecorationStore.getState().setDecorations(decorations);

//   console.info('[gitMockData] Mock data injected into gitStore ✓');
// }
// // // } 