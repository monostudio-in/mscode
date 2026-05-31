// src/features/git/core/GitBackend.ts
//
// ─── PUBLIC SURFACE — UNCHANGED ───────────────────────────────────────────────
//
// This file is the only thing external callers import.
// Every call site that previously did `GitBackend.getStatus(cwd)` continues
// to work identically — no refactoring required anywhere else in the codebase.
//
// Internally the logic is now split into focused single-responsibility modules:
//
//   gitLogger.ts   — output channel helpers
//   gitRunner.ts   — git binary runner + installation check + auth prefix
//   gitStatus.ts   — status parsing, rebase detection
//   gitBranches.ts — branch listing and branch operations
//   gitStaging.ts  — stage / unstage / discard
//   gitCommits.ts  — commit, amend, undo, log
//   gitRemotes.ts  — fetch / pull / push / remote management
//   gitRepo.ts     — init, clone, GitHub API
//   gitStash.ts    — stash operations
//   gitTags.ts     — tag operations
//   gitDiff.ts     — file content retrieval for diff views

import { run }                                                    from './modules/gitRunner';
import { getStatus, isRebasing, abortRebase }                     from './modules/gitStatus';
import { getCurrentBranch, listBranches, checkout, createBranch,
         deleteBranch, deleteRemoteBranch, renameBranch,
         merge, rebase }                                          from './modules/gitBranches';
import { stage, stageAll, unstage, unstageAll, discard }          from './modules/gitStaging';
import { commit, commitAmend, undoLastCommit, getRecentCommits }  from './modules/gitCommits';
import { getRemotes, fetch, fetchPrune, fetchAll, pull, pullRebase,
         pullFrom, push, pushTo, pushSetUpstream,
         addRemote, removeRemote }                                from './modules/gitRemotes';
import { init, clone, createGithubRepo }                          from './modules/gitRepo';
import { getStashes, getStashFiles, stash, stashApply,
         stashPop, stashDrop, stashClear }                        from './modules/gitStash';
import { getTags, createTag, deleteTag, pushTags }                from './modules/gitTags';
import { getFileContent }                                         from './modules/gitDiff';

// ─── Assembled API ─────────────────────────────────────────────────────────────

export const GitBackend = {
  // Core runner (was public static in the original class)
  run,

  // Status & rebase
  getStatus,
  isRebasing,
  abortRebase,

  // Branches
  getCurrentBranch,
  listBranches,
  checkout,
  createBranch,
  deleteBranch,
  deleteRemoteBranch,
  renameBranch,
  merge,
  rebase,

  // Staging
  stage,
  stageAll,
  unstage,
  unstageAll,
  discard,

  // Commits
  commit,
  commitAmend,
  undoLastCommit,
  getRecentCommits,

  // Remote operations
  getRemotes,
  fetch,
  fetchPrune,
  fetchAll,
  pull,
  pullRebase,
  pullFrom,
  push,
  pushTo,
  pushSetUpstream,
  addRemote,
  removeRemote,

  // Repository lifecycle
  init,
  clone,
  createGithubRepo,

  // Stash
  getStashes,
  getStashFiles,
  stash,
  stashApply,
  stashPop,
  stashDrop,
  stashClear,

  // Tags
  getTags,
  createTag,
  deleteTag,
  pushTags,

  // Diff
  getFileContent,
} as const;

// can do: import type { GitBackendType } from './GitBackend'
export type GitBackendType = typeof GitBackend;
