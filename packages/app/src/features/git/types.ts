// src/features/git/types.ts
// ─── All shared types for the git feature ─────────────────────────────────────

/**
 * Represents the standard Git status classifications for tracked and untracked files
 * within the workspace subsystem.
 */
export type GitFileStatus =
  | 'modified'
  | 'untracked'
  | 'added'
  | 'deleted'
  | 'renamed'
  | 'conflicted';

/**
 * Interface contract tracking metadata for individual changed files in a repository.
 */
export interface GitChangedFile {
  /** Workspace relative canonical path to the file. */
  path:     string;
  /** Individual baseline filename including its file extension. */
  name:     string;
  /** Current active Git modification tree state mapping. */
  status:   GitFileStatus;
  /** Populated only during rename states to track historical layout targets. */
  oldPath?: string;
}

/**
 * Represents metadata payload for a specific Git branch instance.
 */
export interface GitBranch {
  /** Plain-text name designation of the branch tracking pointer. */
  name:      string;
  /** Sentinel flag confirming if the branch resides exclusively on the upstream server. */
  isRemote:  boolean;
  /** True if this is the active checked-out branch in the current HEAD reference. */
  isCurrent: boolean;
  /** Named tracking target identifier assigned to this branch on remote clusters. */
  upstream?: string;
  /** Count of localized commits waiting to be pushed upstream. */
  ahead:     number;
  /** Count of remote server commits waiting to be synchronized locally. */
  behind:    number;
}

/**
 * Interface mapping individual revision details in the Git log registry sequence.
 */
export interface GitCommit {
  /** Complete 40-character hexadecimal representation string of the commit hash. */
  hash:      string;
  /** Condensed short hash identifier representation (typically first 7 characters). */
  shortHash: string;
  /** Plain text explanation description written by the committer. */
  message:   string;
  /** Named metadata context identifying the commit owner. */
  author:    string;
  /** Fully formatted ISO timestamp marking the exact completion pass window. */
  date:      string;
}

/**
 * Profile model encapsulating stashed modifications saved inside the local cache stack.
 */
export interface GitStash {
  /** Sequential placement index locator evaluating the stack trace coordinate. */
  index: number;
  /** Plain descriptive label tracking user annotations or branch references on stash actions. */
  description: string;
}

/**
 * Tracks root metadata profiles for active submodules or multi-root Git repository targets.
 */
export interface GitRepository {
  /** Absolute hash token or internal routing signature key. */
  id:     string;
  /** Individual readable workspace naming context assigned to the target folder. */
  name:   string;
  /** Absolute operating system physical folder pathway routing target. */
  path:   string;
  /** Text pointer showing the current checking branch state on the layout. */
  branch: string;
  /** Outgoing local tracking node offset index metric. */
  ahead:  number;
  /** Incoming remote server revision synchronization lag evaluation matrix. */
  behind: number;
}

/** Specifies available rendering sorting criteria paradigms inside the Changes panel views. */
export type GitSortMode = 'discovery' | 'name' | 'path' | 'status';

/**
 * Structural definition schema for the visual decorations mapping specific Git modification states.
 */
export interface GitStatusMetadata {
  /** Singular alphanumeric character representing the modification type shorthand (e.g. 'M', 'A'). */
  badge: string;
  /** Hexadecimal or variable-bound CSS design token color code for typographic painting. */
  color: string;
  /** Human-readable text string naming the precise modification state. */
  label: string;
  /** Standard CSS text-decoration parameters applied onto the rendering view line frames. */
  decoration: 'normal' | 'line-through';
  /** Typographic rendering styles applied dynamically onto font layout rendering pipelines. */
  style: 'normal' | 'italic';
}

// ─── Visual Metadata Configuration Map ──────────────────────────────────────────

/**
 * Global Metadata Dictionary map binding Git status metrics safely with responsive CSS design tokens.
 * Used consistently across file explorer graphs, tabs, and staging lists to render uniform code contexts.
 */
export const GIT_STATUS_META: Record<GitFileStatus, GitStatusMetadata> = {
  modified:   { badge: 'M', color: '#e2c08d', label: 'Modified' , decoration : 'normal' , style : 'normal'},
  untracked:  { badge: 'U', color: '#73c991', label: 'Untracked' , decoration : 'normal' , style : 'normal'},
  added:      { badge: 'A', color: '#73c991', label: 'Added' , decoration : 'normal' , style : 'normal'},
  deleted:    { badge: 'D', color: '#f44747', label: 'Deleted' , decoration : 'line-through' , style : 'normal'},
  renamed:    { badge: 'R', color: '#4fc1ff', label: 'Renamed', decoration : 'normal' , style : 'normal'},
  conflicted: { badge: 'C', color: '#e06c75', label: 'Conflicted', decoration : 'normal' , style : 'italic'},
};

// ─── Slice State Machine Interfaces ─────────────────────────────────────────

export interface UISlice {
  commitMessage:    string;
  showRepositories: boolean;
  showChanges:      boolean;
  sortMode:         GitSortMode;

  setCommitMessage:   (msg: string) => void;
  toggleRepositories: () => void;
  toggleChanges:      () => void;
  setSortMode:        (mode: GitSortMode) => void;
}

export interface StatusSlice {
  isGitRepo:     boolean;
  isLoading:     boolean;
  isRebasing:    boolean;
  error:         string | null;
  stagedFiles:   GitChangedFile[];
  unstagedFiles: GitChangedFile[];
  hasUpstream:   boolean;
  repositories:  GitRepository[];
  stashes:       GitStash[];
  tags:          string[];
  showPartiallyStaged: boolean; 
  
  refresh:      () => Promise<void>;
  
  stageFile:    (path: string) => Promise<void>;
  unstageFile:  (path: string) => Promise<void>;
  stageAll:     () => Promise<void>;
  unstageAll:   () => Promise<void>;
  discardFile:  (path: string) => Promise<void>;
  discardAll:   () => Promise<void>;
  
  stash:          (opts?: { includeUntracked?: boolean; staged?: boolean }) => Promise<void>;
  applyStash:     (latest?: boolean) => Promise<void>;
  popStash:       (latest?: boolean) => Promise<void>;
  dropStash:      () => Promise<void>;
  dropAllStashes: () => Promise<void>;
  viewStash:      (index?: number) => Promise<void>;
}

export interface BranchSlice {
  currentBranch: string;
  branches:      GitBranch[];

  checkout:          (branch: string) => Promise<void>;
  openBranchPalette: () => Promise<void>;
  checkoutViaPalette:() => Promise<void>; 
  
  mergeBranch:        () => Promise<void>;
  rebaseBranch:       () => Promise<void>;
  createBranch:       () => Promise<void>;
  createBranchFrom:   () => Promise<void>;
  renameBranch:       () => Promise<void>;
  deleteBranch:       () => Promise<void>;
  deleteRemoteBranch: () => Promise<void>;
}

export interface CommitSlice {
  recentCommits: GitCommit[];

  _executePostCommit:  () => Promise<void>;
  _validateUserConfig: (cwd: string) => Promise<boolean>;

  commit:         (opts?: { all?: boolean; signoff?: boolean }) => Promise<void>;
  commitAmend:    (opts?: { all?: boolean; signoff?: boolean }) => Promise<void>;
  
  commitAndPush:  () => Promise<void>;
  commitAndSync:  () => Promise<void>;
  undoLastCommit: () => Promise<void>;
  
  abortRebase:    () => Promise<void>;
}

export interface RemoteSlice {
  fetch:       () => Promise<void>;
  fetchPrune:  () => Promise<void>;
  fetchAll:    () => Promise<void>;
  pull:        () => Promise<void>;
  pullRebase:  () => Promise<void>;
  pullFrom:    () => Promise<void>;
  push:        () => Promise<void>;
  pushTo:      () => Promise<void>;
  sync:        () => Promise<void>;
  addRemote:    () => Promise<void>;
  removeRemote: () => Promise<void>;
}

export interface RepoSlice {
  initRepo:      () => Promise<void>;
  cloneRepo:     () => Promise<void>;
  publishBranch: () => Promise<void>;
  
  createTag:     () => Promise<void>;
  deleteTag:     () => Promise<void>;
  pushTags:      () => Promise<void>;
}

/** Combined macro-type pipeline packaging all functional sub-slices cleanly inside a singular state object map. */
export type GitState =
  UISlice     &
  StatusSlice &
  BranchSlice &
  CommitSlice &
  RemoteSlice &
  RepoSlice;