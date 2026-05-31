// src/features/git/store/slices/gitStatusSlice.ts

import type { StateCreator }   from 'zustand';
import { useDecorationStore }  from '@/features/explorer/store/decorationStore';
import { useTabStore } from '@/store/tabStore';
import { usePaletteStore }     from '@/store/paletteStore'; 
import { useNotificationStore } from '@/store/notificationStore';
import { useSettingsStore }    from '@/features/settings/store/settingsStore';
import { GitBackend }          from '../../core/GitBackend';
import { getCwd, notifyError, notifySuccess, syncDecorations, assertNative } from '../_helpers';
import type { GitState, StatusSlice, GitRepository } from '../../types';

export const createStatusSlice: StateCreator<GitState, [], [], StatusSlice> = (set, get) => ({
  isGitRepo:          false,
  isLoading:          false,
  error:              null,
  stagedFiles:        [],
  unstagedFiles:      [],
  hasUpstream:        false,
  repositories:       [],
  isRebasing:         false,
  stashes:            [], 
  tags:               [],
  showPartiallyStaged: true, 

 // ── refresh ────────────────────────────────────────────────────────────────
  refresh: async () => {
    const cwd = getCwd(); 
  
    const clearGitState = (errMsg: string | null = null) => {
      set({
        isGitRepo: false, isLoading: false, stagedFiles: [], unstagedFiles: [],
        recentCommits: [], branches: [], tags: [], stashes: [],
        repositories: [], hasUpstream: false, currentBranch: 'main',
        error: errMsg
      });
      useDecorationStore.getState().clearDecorations();
    };

    if (!cwd || !assertNative('refresh')) {
      clearGitState();
      return;
    }

    const settings = useSettingsStore.getState().settings;
    set({ isLoading: true, error: null });

    try {
      await GitBackend.run('rev-parse --is-inside-work-tree', cwd, true);

      const [{ staged, unstaged }, branchName, commits, branches, isRebasing, stashes, tags] = await Promise.all([
        GitBackend.getStatus(cwd),
        GitBackend.getCurrentBranch(cwd),
        GitBackend.getRecentCommits(cwd),
        GitBackend.listBranches(cwd),
        GitBackend.isRebasing(cwd),
        GitBackend.getStashes(cwd), 
        GitBackend.getTags(cwd),
      ]);

      const currentBranchObj = branches.find(b => b.isCurrent);
      const hasUpstream      = currentBranchObj?.upstream !== undefined;
      const repoName = cwd.split('/').pop() || cwd;
      const repositories: GitRepository[] = [{
        id: cwd, name: repoName, path: cwd, branch: branchName || 'main',
        ahead: currentBranchObj?.ahead ?? 0, behind: currentBranchObj?.behind ?? 0,
      }];

      // Setting: Show Partially Staged
      const showPartiallyStaged = settings['git.showPartiallyStaged'] ?? true;
      let finalUnstaged = unstaged;
      
      if (!showPartiallyStaged) {
        const stagedPaths = new Set(staged.map(f => f.path));
        finalUnstaged = unstaged.filter(f => !stagedPaths.has(f.path));
      }

      // Setting: Status Limit Warning
      const limit = settings['git.statusLimit'] ?? 10000;
      const ignoreWarning = settings['git.ignoreLimitWarning'] ?? false;
      const totalChanges = staged.length + finalUnstaged.length;

      if (totalChanges > limit && !ignoreWarning) {
        useNotificationStore.getState().addNotification({
          type: 'warning', title: 'Git Performance', source: 'Git',
          message: `The repository has ${totalChanges} changes, exceeding the limit of ${limit}. Some features may be slow.`,
        });
      }

      set({
        isGitRepo: true, isLoading: false, stagedFiles: staged, unstagedFiles: finalUnstaged,
        currentBranch: branchName || 'main', recentCommits: commits, branches, hasUpstream,
        repositories, isRebasing, stashes, tags, error: null, showPartiallyStaged
      });
      syncDecorations(staged, finalUnstaged);
      
    } catch (e: any) {
      const isNotRepo = e?.message?.includes('not a git') || e?.message?.includes('fatal');
      
      // Apply full cleanup to ensure NO old data leaks to the new folder!
      clearGitState(isNotRepo ? null : (e?.message ?? 'Git error'));
    }
  },

  // ── stageFile / unstageFile / stageAll / unstageAll (Unchanged) ────────────
  stageFile: async (path) => {
    const cwd = getCwd(); if (!cwd || !assertNative('stageFile')) return;
    try { await GitBackend.stage(cwd, path); await get().refresh(); } 
    catch (e: any) { notifyError('Stage Failed', e?.message ?? 'Could not stage file'); }
  },
  unstageFile: async (path) => {
    const cwd = getCwd(); if (!cwd || !assertNative('unstageFile')) return;
    try { await GitBackend.unstage(cwd, path); await get().refresh(); } 
    catch (e: any) { notifyError('Unstage Failed', e?.message ?? 'Could not unstage file'); }
  },
  unstageAll: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('unstageAll')) return;
    try { await GitBackend.unstageAll(cwd); await get().refresh(); } 
    catch (e: any) { notifyError('Unstage All Failed', e?.message ?? 'Could not unstage all files'); }
  },
  stageAll: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('stageAll')) return;
    try { await GitBackend.stageAll(cwd); await get().refresh(); } 
    catch (e: any) { notifyError('Stage All Failed', e?.message ?? 'Could not stage all files'); }
  },

  // ── discardFile ───────────────────────────────────────────────────────────
  discardFile: async (path) => {
    const cwd = getCwd(); if (!cwd || !assertNative('discardFile')) return;
    const settings = useSettingsStore.getState().settings;

    const performDiscard = async () => {
      try { await GitBackend.discard(cwd, path); await get().refresh(); } 
      catch (e: any) { notifyError('Discard Failed', e?.message ?? 'Could not discard changes'); }
    };

    // Setting: Confirm Discard
    if (settings['git.confirmDiscard'] ?? true) {
      const notif = useNotificationStore.getState();
      let nid = notif.addNotification({
        type: 'confirmation', title: 'Discard Changes', source: 'Git',
        message: `Are you sure you want to discard changes in "${path}"?`,
        actions: [
          { label: 'Discard', variant: 'type1', customStyle: { backgroundColor: '#d32f2f', color: '#fff', borderColor: '#d32f2f' }, onClick: () => { notif.removeNotification(nid); performDiscard(); } },
          { label: 'Cancel', variant: 'type2', onClick: () => notif.removeNotification(nid) }
        ]
      });
    } else {
      await performDiscard();
    }
  },

  // ── discardAll ────────────────────────────────────────────────────────────
  discardAll: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('discardAll')) return;
    const settings = useSettingsStore.getState().settings;

    const performDiscardAll = async () => {
      try {
        const { unstagedFiles } = get();
        for (const f of unstagedFiles) await GitBackend.discard(cwd, f.path);
        await get().refresh();
      } catch (e: any) { notifyError('Discard All Failed', e?.message ?? 'Could not discard all changes'); }
    };

    // Setting: Confirm Discard
    if (settings['git.confirmDiscard'] ?? true) {
      const notif = useNotificationStore.getState();
      let nid = notif.addNotification({
        type: 'confirmation', title: 'Discard All Changes', source: 'Git',
        message: 'Are you sure you want to discard ALL changes? This is irreversible!',
        actions: [
          { label: 'Discard All', variant: 'type1', customStyle: { backgroundColor: '#d32f2f', color: '#fff', borderColor: '#d32f2f' }, onClick: () => { notif.removeNotification(nid); performDiscardAll(); } },
          { label: 'Cancel', variant: 'type2', onClick: () => notif.removeNotification(nid) }
        ]
      });
    } else {
      await performDiscardAll();
    }
  },

  // ── Stash ─────────────────────────────────────────────────────────────────
  stash: async (opts) => {
    const cwd = getCwd(); if (!cwd || !assertNative('stash')) return;
    const settings = useSettingsStore.getState().settings;
    
    // Settings: Stash Include Untracked & Use Commit Input
    const includeUntracked = opts?.includeUntracked ?? (settings['git.stashIncludeUntracked'] ?? true);
    const useCommitMsg = settings['git.useCommitInputAsStashMessage'] ?? false;
    
    // Check if we should auto-fill from commit box
    const currentCommitMsg = (get() as any).commitMessage;
    const autoStashMsg = (useCommitMsg && currentCommitMsg) ? currentCommitMsg : '';

    const performStash = async (msg: string) => {
      set({ isLoading: true });
      try { 
        await GitBackend.stash(cwd, msg, includeUntracked, opts?.staged); 
        // Optional: clear commit message if it was consumed
        if (useCommitMsg && msg === currentCommitMsg) {
          (get() as any).setCommitMessage('');
        }
        notifySuccess('Stashed successfully.'); 
        await get().refresh(); 
      } 
      catch (e: any) { set({ isLoading: false }); notifyError('Stash Failed', e?.message); }
    };

    if (autoStashMsg) {
      // Direct stash without prompt if setting is on and message exists
      await performStash(autoStashMsg);
    } else {
      usePaletteStore.getState().openInputBox('Stash message (optional)', async (msg) => {
        await performStash(msg);
      });
    }
  },

  // Apply, Pop, Drop Stashes (Unchanged)
  applyStash: async (latest) => {
    const cwd = getCwd(); if (!cwd || !assertNative('applyStash')) return;
    if (latest) {
      set({ isLoading: true });
      try { await GitBackend.stashApply(cwd); notifySuccess('Applied latest stash.'); await get().refresh(); } 
      catch (e: any) { set({ isLoading: false }); notifyError('Apply Failed', e?.message); }
      return;
    }
    const { stashes } = get();
    usePaletteStore.getState().openQuickPick(
      'Select a stash to apply',
      stashes.map(s => ({ id: s.index.toString(), label: `stash@{${s.index}}`, description: s.description, leftIcon: 'repo' })),
      async (selected) => {
        set({ isLoading: true });
        try { await GitBackend.stashApply(cwd, parseInt(selected.id)); notifySuccess('Applied stash.'); await get().refresh(); } 
        catch (e: any) { set({ isLoading: false }); notifyError('Apply Failed', e?.message); }
      }
    );
  },

  popStash: async (latest) => {
    const cwd = getCwd(); if (!cwd || !assertNative('popStash')) return;
    if (latest) {
      set({ isLoading: true });
      try { await GitBackend.stashPop(cwd); notifySuccess('Popped latest stash.'); await get().refresh(); } 
      catch (e: any) { set({ isLoading: false }); notifyError('Pop Failed', e?.message); }
      return;
    }
    const { stashes } = get();
    usePaletteStore.getState().openQuickPick(
      'Select a stash to pop',
      stashes.map(s => ({ id: s.index.toString(), label: `stash@{${s.index}}`, description: s.description, leftIcon: 'repo' })),
      async (selected) => {
        set({ isLoading: true });
        try { await GitBackend.stashPop(cwd, parseInt(selected.id)); notifySuccess('Popped stash.'); await get().refresh(); } 
        catch (e: any) { set({ isLoading: false }); notifyError('Pop Failed', e?.message); }
      }
    );
  },

  dropStash: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('dropStash')) return;
    const { stashes } = get();
    usePaletteStore.getState().openQuickPick(
      'Select a stash to drop',
      stashes.map(s => ({ id: s.index.toString(), label: `stash@{${s.index}}`, description: s.description, leftIcon: 'trash' })),
      async (selected) => {
        set({ isLoading: true });
        try { await GitBackend.stashDrop(cwd, parseInt(selected.id)); notifySuccess(`Dropped stash@{${selected.id}}.`); await get().refresh(); } 
        catch (e: any) { set({ isLoading: false }); notifyError('Drop Failed', e?.message); }
      }
    );
  },

  dropAllStashes: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('dropAllStashes')) return;
    const notif = useNotificationStore.getState();
    let nid = notif.addNotification({
      type: 'confirmation', title: 'Drop All Stashes', source: 'Git',
      message: 'Are you sure you want to drop all stashes? This action cannot be undone.',
      actions: [
        { label: 'Yes, drop all stashes', variant: 'type1', customStyle: { backgroundColor: '#d32f2f', color: '#fff', borderColor: '#d32f2f' }, onClick: async () => { notif.removeNotification(nid); set({ isLoading: true }); try { await GitBackend.stashClear(cwd); notifySuccess('All stashes cleared.'); await get().refresh(); } catch (e: any) { set({ isLoading: false }); notifyError('Clear Failed', e?.message); } } },
        { label: 'Cancel', variant: 'type2', onClick: () => notif.removeNotification(nid) }
      ]
    });
  },
  viewStash: async (index?: number) => {
    const cwd = getCwd(); if (!cwd || !assertNative('viewStash')) return;
    const { stashes } = get();

    if (!stashes || stashes.length === 0) {
      notifyError('View Stash', 'No stashes available.');
      return;
    }

    // Helper function to show files in a stash
    const showStashFiles = async (stashIndex: number) => {
      set({ isLoading: true });
      try {
        const files = await GitBackend.getStashFiles(cwd, stashIndex);
        set({ isLoading: false });

        if (files.length === 0) {
          notifyError('View Stash', 'No files modified in this stash.');
          return;
        }

        usePaletteStore.getState().openQuickPick(
          `Files modified in stash@{${stashIndex}}`,
          files.map(f => ({ id: f, label: f, leftIcon: 'file' })),
          async (selected) => {
            const filePath = selected.id;
            const fileName = filePath.split('/').pop() || filePath;
            
            set({ isLoading: true });
            try {
              const stashedContent = await GitBackend.getFileContent(cwd, `stash@{${stashIndex}}`, filePath);
              
              useTabStore.getState().addTab({
                id: `diff-stash-${stashIndex}-${filePath}`,
                type: 'diff' as any,
                title: `${fileName} (Stash@{${stashIndex}})`,
                icon: 'git-compare',
                filePath: `${cwd}/${filePath}`,
                diffData: {
                  originalContent: stashedContent,
                  modifiedContent: null, // null -> read data from current file
                  readOnly: true,
                  filePath: `${cwd}/${filePath}`
                }
              } as any); // Type assertion to bypass strict union checks if 'diff' type is dynamic

            } catch (e: any) {
              notifyError('Diff Error', 'Could not load diff for this file.');
            } finally {
              set({ isLoading: false });
            }
          }
        );
      } catch (e: any) {
        set({ isLoading: false });
        notifyError('View Stash', e?.message);
      }
    };

    if (index === undefined) {
      usePaletteStore.getState().openQuickPick(
        'Select a stash to view',
        stashes.map(s => ({ id: s.index.toString(), label: `stash@{${s.index}}: ${s.description}`, leftIcon: 'archive' })),
        (selected) => {
          showStashFiles(parseInt(selected.id));
        }
      );
    } else {
      await showStashFiles(index);
    }
  },
  
});