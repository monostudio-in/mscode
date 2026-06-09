// src/features/git/store/gitStore.ts
// ─── Combines all slices into a single Zustand store ──────────────────────────

import { create } from 'zustand';

// ── Slice creators ────────────────────────────────────────────────────────────
import { createUISlice }     from './slices/gitUISlice';
import { createStatusSlice } from './slices/gitStatusSlice';
import { createBranchSlice } from './slices/gitBranchSlice';
import { createCommitSlice } from './slices/gitCommitSlice';
import { createRemoteSlice } from './slices/gitRemoteSlice';
import { createRepoSlice }   from './slices/gitRepoSlice';
import { Capacitor }            from '@capacitor/core';
import { injectGitMock } from '@/features/git/dev/gitMockData';
import { useExplorerStore } from '@/features/explorer/store/exploreStore';
import { msEvents } from '@/core/extensionAPI/events/EventManager';

// ── Public re-exports (so existing imports don't break) ───────────────────────
export type {
  GitFileStatus,
  GitChangedFile,
  GitBranch,
  GitCommit,
  GitRepository,
  GitSortMode,
  GitState,
} from '../types';

export { GIT_STATUS_META } from '../types';

// ─── Mock Data ────────────────────────────────────────────────────────────────
  if (!Capacitor.isNativePlatform()) {
     injectGitMock();  // fills gitStore with fake data
  }

// ─── Store ────────────────────────────────────────────────────────────────────

import type { GitState } from '../types';

export const useGitStore = create<GitState>()((...args) => ({
  ...createUISlice(...args),
  ...createStatusSlice(...args),
  ...createBranchSlice(...args),
  ...createCommitSlice(...args),
  ...createRemoteSlice(...args),
  ...createRepoSlice(...args),
}));

useExplorerStore.subscribe((state, prevState) => {
  if (state.workspacePath !== prevState.workspacePath) {
    useGitStore.getState().refresh();
  }
});

useGitStore.subscribe((state, prevState) => {
  if (
    state.stagedFiles !== prevState.stagedFiles ||
    state.unstagedFiles !== prevState.unstagedFiles ||
    state.currentBranch !== prevState.currentBranch ||
    state.stashes !== prevState.stashes ||
    state.isLoading !== prevState.isLoading
  ) {
    msEvents.emit('onDidChangeGitState');
  }
});