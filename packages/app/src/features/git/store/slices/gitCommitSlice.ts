// src/features/git/store/slices/gitCommitSlice.ts

import type { StateCreator }    from 'zustand';
import { useNotificationStore } from '@/store/notificationStore';
import { useSettingsStore }     from '@/features/settings/store/settingsStore';
import { gitAccess }            from '../../gitAccess'; 

import { GitBackend }           from '../../core/GitBackend';
import { handleGitAuthErrors }  from '../../utils/gitErrorHandler';
import { getCwd, notifyError, assertNative } from '../_helpers';
import type { GitState, CommitSlice } from '../../types';

export const createCommitSlice: StateCreator<GitState, [], [], CommitSlice> = (set, get) => ({
  recentCommits: [],

  // ── Helper to execute Post-Commit Commands ─────────────────────────────────
  _executePostCommit: async () => {
    const settings = useSettingsStore.getState().settings;
    const postCommand = settings['git.postCommitCommand'] ?? 'none';
    if (postCommand === 'push') {
      await get().push();
    } else if (postCommand === 'sync') {
      await get().sync();
    }
  },

  // ── Helper to Validate Git Identity ────────────────────────────────────────
  _validateUserConfig: async (cwd: string): Promise<boolean> => {
    const settings = useSettingsStore.getState().settings;
    if (settings['git.requireGitUserConfig']) {
        
      // global git auth check
      const isAuth = gitAccess.isGloballyAuthenticated();
      
      if (!isAuth) {
        try {
          // Attempt to check if local config exists (assuming backend supports it)
          const name = await (GitBackend as any).getConfig?.(cwd, 'user.name');
          const email = await (GitBackend as any).getConfig?.(cwd, 'user.email');
          if (!name || !email) throw new Error();
        } catch (e) {
          // Trigger the smart menu instead of generic error
          handleGitAuthErrors(new Error('user.name missing'), 'Commit Failed');
          return false;
        }
      }
    }
    return true;
  },

  // ── commit ────────────────────────────────────────────────────────────────
  commit: async (opts) => {
    const cwd = getCwd();
    const { commitMessage, stagedFiles, unstagedFiles } = get();
    if (!cwd || !assertNative('commit')) return;

    if (!commitMessage.trim()) {
      notifyError('Commit Failed', 'Commit message cannot be empty.');
      return;
    }

    if (!(await get()._validateUserConfig(cwd))) return;

    // Handle "Commit All" logic
    if (opts?.all) {
      if (stagedFiles.length === 0 && unstagedFiles.length === 0) {
        notifyError('Commit Failed', 'No changes to commit.');
        return;
      }
      set({ isLoading: true });
      try { await GitBackend.stageAll(cwd); } catch(e) {}
    } else if (stagedFiles.length === 0) {
      notifyError('Commit Failed', 'No staged changes to commit.');
      return;
    }

    set({ isLoading: true });
    try {
      await GitBackend.commit(cwd, commitMessage, { signoff: opts?.signoff });
      set({ commitMessage: '' });
      useNotificationStore.getState().addNotification({
        type: 'success', title: 'Git', source: 'Git',
        message: 'Committed successfully.',
      });
      await get().refresh();
      await get()._executePostCommit(); // Auto Post-Commit Execution
    } catch (e: any) {
      set({ isLoading: false });
      handleGitAuthErrors(e, 'Commit Failed');
    }
  },

  // ── commitAmend ───────────────────────────────────────────────────────────
  commitAmend: async (opts) => {
    const cwd = getCwd();
    const { commitMessage, stagedFiles, unstagedFiles, recentCommits } = get();
    if (!cwd || !assertNative('commitAmend')) return;
    if(unstagedFiles) {}; // dummy usage to prevent warning

    if (recentCommits.length === 0) {
      notifyError('Amend Failed', 'No commits to amend.');
      return;
    }

    if (!(await get()._validateUserConfig(cwd))) return;

    if (opts?.all) {
      set({ isLoading: true });
      try { await GitBackend.stageAll(cwd); } catch(e) {}
    } else if (stagedFiles.length === 0 && !commitMessage.trim()) {
      notifyError('Amend Failed', 'No staged changes or new message to amend.');
      return;
    }

    set({ isLoading: true });
    try {
      await GitBackend.commitAmend(cwd, commitMessage, { signoff: opts?.signoff });
      set({ commitMessage: '' });
      useNotificationStore.getState().addNotification({
        type: 'success', title: 'Git', source: 'Git',
        message: 'Commit amended successfully.',
      });
      await get().refresh();
      await get()._executePostCommit();
    } catch (e: any) {
      set({ isLoading: false });
      handleGitAuthErrors(e, 'Amend Failed');
    }
  },

  // ── commitAndPush ─────────────────────────────────────────────────────────
  commitAndPush: async () => {
    const { commit, push, stagedFiles, commitMessage } = get();
    if (!commitMessage.trim()) { notifyError('Commit Failed', 'Commit message cannot be empty.'); return; }
    if (!stagedFiles.length)   { notifyError('Commit Failed', 'No staged changes to commit.'); return; }
    await commit();
    if (!get().commitMessage) await push();
  },

  // ── commitAndSync ─────────────────────────────────────────────────────────
  commitAndSync: async () => {
    const { commit, sync, stagedFiles, commitMessage } = get();
    if (!commitMessage.trim()) { notifyError('Commit Failed', 'Commit message cannot be empty.'); return; }
    if (!stagedFiles.length)   { notifyError('Commit Failed', 'No staged changes to commit.'); return; }
    await commit();
    if (!get().commitMessage) {
      await sync();
    }
  },

  // ── undoLastCommit ────────────────────────────────────────────────────────
  undoLastCommit: async () => {
    const cwd = getCwd();
    if (!cwd || !assertNative('undoLastCommit')) return;

    const { recentCommits } = get();
    if (recentCommits.length === 0) {
      notifyError('Undo Failed', 'No commits to undo.');
      return;
    }

    const notif = useNotificationStore.getState();
    let nid = '';
    nid = notif.addNotification({
      type: 'confirmation', title: 'Undo Last Commit', source: 'Git',
      message: `Move "${recentCommits[0]?.message}" back to staged changes? (soft reset — changes are kept)`,
      actions: [
        {
          label: 'Undo Commit', variant: 'type1',
          onClick: async () => {
            notif.removeNotification(nid);
            set({ isLoading: true });
            try {
              await GitBackend.undoLastCommit(cwd);
              await get().refresh();
            } catch (e: any) {
              set({ isLoading: false });
              notifyError('Undo Failed', e?.message ?? 'Could not undo last commit');
            }
          },
        },
        { label: 'Cancel', variant: 'type2', onClick: () => notif.removeNotification(nid) },
      ],
    });
  },
  
  // ── abortRebase ───────────────────────────────────────────────────────────
  abortRebase: async () => {
    const cwd = getCwd();
    if (!cwd || !assertNative('abortRebase')) return;
    set({ isLoading: true });
    try {
      await GitBackend.abortRebase(cwd);
      useNotificationStore.getState().addNotification({
        type: 'success', title: 'Git', source: 'Git',
        message: 'Rebase aborted successfully.',
      });
      await get().refresh();
    } catch (e: any) {
      set({ isLoading: false });
      notifyError('Abort Failed', e?.message ?? 'Could not abort rebase');
    }
  },
  
});