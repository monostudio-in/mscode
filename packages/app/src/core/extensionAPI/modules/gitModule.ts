// src/core/extensionAPI/modules/gitModule.ts

import { useGitStore } from '@/features/git/store/gitStore';
import type { GitSortMode } from '@/features/git/types';

export const createGitModule = (_extId: string) => ({
  
  // ─── STATE (Getters) ────────────────────────────────────────────────
  get isGitRepo(): boolean { return useGitStore.getState().isGitRepo; },
  get currentBranch(): string { return useGitStore.getState().currentBranch; },
  get branches(): any[] { return useGitStore.getState().branches; },
  get recentCommits(): any[] { return useGitStore.getState().recentCommits; },
  get stagedFiles(): any[] { return useGitStore.getState().stagedFiles; },
  get unstagedFiles(): any[] { return useGitStore.getState().unstagedFiles; },
  get repositories(): any[] { return useGitStore.getState().repositories; },
  get stashes(): any[] { return useGitStore.getState().stashes; },
  get tags(): any[] { return useGitStore.getState().tags; },
  get error(): string | null { return useGitStore.getState().error; },
  get isRebasing(): boolean { return useGitStore.getState().isRebasing; },
  get hasUpstream(): boolean { return useGitStore.getState().hasUpstream; },
  get showPartiallyStaged(): boolean { return useGitStore.getState().showPartiallyStaged; },

  // ─── UI STATE (Getters) ─────────────────────────────────────────────
  get commitMessage(): string { return useGitStore.getState().commitMessage; },
  get showRepositories(): boolean { return useGitStore.getState().showRepositories; },
  get showChanges(): boolean { return useGitStore.getState().showChanges; },
  get sortMode(): GitSortMode { return useGitStore.getState().sortMode; },

  // ─── REPO OPERATIONS ────────────────────────────────────────────────
  repo: {
    init: async () => useGitStore.getState().initRepo(),
    clone: async () => useGitStore.getState().cloneRepo(),
  },

  // ─── STATUS & FILE OPERATIONS ───────────────────────────────────────
  status: {
    refresh: async () => useGitStore.getState().refresh(),
    stageFile: async (path: string) => useGitStore.getState().stageFile(path),
    unstageFile: async (path: string) => useGitStore.getState().unstageFile(path),
    stageAll: async () => useGitStore.getState().stageAll(),
    unstageAll: async () => useGitStore.getState().unstageAll(),
    discardFile: async (path: string) => useGitStore.getState().discardFile(path),
    discardAll: async () => useGitStore.getState().discardAll(),
  },

  // ─── STASH OPERATIONS ───────────────────────────────────────────────
  stash: {
    stash: async (opts?: { includeUntracked?: boolean; staged?: boolean }) => useGitStore.getState().stash(opts),
    applyStash: async (latest?: boolean) => useGitStore.getState().applyStash(latest),
    popStash: async (latest?: boolean) => useGitStore.getState().popStash(latest),
    dropStash: async () => useGitStore.getState().dropStash(),
    dropAllStashes: async () => useGitStore.getState().dropAllStashes(),
    viewStash: async (index?: number) => useGitStore.getState().viewStash(index),
  },

  // ─── TAG OPERATIONS ─────────────────────────────────────────────────
  tag: {
    create: async () => useGitStore.getState().createTag(),
    deleteTag: async () => useGitStore.getState().deleteTag(),
    pushAll: async () => useGitStore.getState().pushTags(),
  },

  // ─── BRANCH ACTIONS ─────────────────────────────────────────────────
  branch: {
    checkout: async (branchName: string) => useGitStore.getState().checkout(branchName),
    createBranch: async () => useGitStore.getState().createBranch(),
    createBranchFrom: async () => useGitStore.getState().createBranchFrom(),
    mergeBranch: async () => useGitStore.getState().mergeBranch(),
    rebaseBranch: async () => useGitStore.getState().rebaseBranch(),
    renameBranch: async () => useGitStore.getState().renameBranch(),
    deleteBranch: async () => useGitStore.getState().deleteBranch(),
    deleteRemoteBranch: async () => useGitStore.getState().deleteRemoteBranch(),
    publishBranch: async () => useGitStore.getState().publishBranch(),
  },

  // ─── COMMIT ACTIONS ─────────────────────────────────────────────────
  commit: {
    commit: async (opts?: { all?: boolean; signoff?: boolean }) => useGitStore.getState().commit(opts),
    commitAmend: async (opts?: { all?: boolean; signoff?: boolean }) => useGitStore.getState().commitAmend(opts),
    commitAndPush: async () => useGitStore.getState().commitAndPush(),
    commitAndSync: async () => useGitStore.getState().commitAndSync(),
    undoLastCommit: async () => useGitStore.getState().undoLastCommit(),
    abortRebase: async () => useGitStore.getState().abortRebase(),
  },

  // ─── REMOTE ACTIONS ─────────────────────────────────────────────────
  remote: {
    sync: async () => useGitStore.getState().sync(),
    fetch: async () => useGitStore.getState().fetch(),
    fetchPrune: async () => useGitStore.getState().fetchPrune(),
    fetchAll: async () => useGitStore.getState().fetchAll(),
    pull: async () => useGitStore.getState().pull(),
    pullRebase: async () => useGitStore.getState().pullRebase(),
    pullFrom: async () => useGitStore.getState().pullFrom(),
    push: async () => useGitStore.getState().push(),
    pushTo: async () => useGitStore.getState().pushTo(),
    addRemote: async () => useGitStore.getState().addRemote(),
    removeRemote: async () => useGitStore.getState().removeRemote(),
  },

  // ─── UI CONTROLS & PALETTE ACTIONS ──────────────────────────────────
  ui: {
    openBranchPalette: async () => useGitStore.getState().openBranchPalette(),
    setCommitMessage: (msg: string) => useGitStore.getState().setCommitMessage(msg),
    toggleRepositories: () => useGitStore.getState().toggleRepositories(),
    toggleChanges: () => useGitStore.getState().toggleChanges(),
    setSortMode: (mode: GitSortMode) => useGitStore.getState().setSortMode(mode),
  }
});

export type GitModule = ReturnType<typeof createGitModule>;