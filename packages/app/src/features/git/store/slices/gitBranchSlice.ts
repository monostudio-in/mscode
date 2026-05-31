// src/features/git/store/slices/gitBranchSlice.ts

import type { StateCreator }    from 'zustand';
import { usePaletteStore }      from '@/store/paletteStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useSettingsStore }     from '@/features/settings/store/settingsStore';
import { GitBackend }           from '../../core/GitBackend';
import { handleGitAuthErrors }  from '../../utils/gitErrorHandler';
import { getCwd, notifyError, notifySuccess, assertNative } from '../_helpers';
import type { GitState, BranchSlice } from '../../types';

export const createBranchSlice: StateCreator<GitState, [], [], BranchSlice> = (set, get) => ({
  currentBranch: 'main',
  branches:      [],

  // ── checkout ──────────────────────────────────────────────────────────────
  checkout: async (branchName) => {
    const cwd = getCwd();
    if (!cwd || !assertNative('checkout')) return;
    set({ isLoading: true });
    try {
      await GitBackend.checkout(cwd, branchName);
      await get().refresh();
    } catch (e: any) {
      set({ isLoading: false });
      handleGitAuthErrors(e, `Checkout Failed: ${branchName}`);
    }
  },

  // ── openBranchPalette ─────────────────────────────────────────────────────
  openBranchPalette: async () => {
    const { branches, currentBranch, checkout, createBranch, createBranchFrom, publishBranch } = get() as any;
    const settings = useSettingsStore.getState().settings;

    const actionItems: any[] = [
      { id: 'create-branch', label: 'Create new branch', leftIcon: 'plus', onSelect: createBranch },
      { id: 'create-branch-from', label: 'Create new branch from...', leftIcon: 'repo-forked', onSelect: createBranchFrom },
      { id: 'publish-branch', label: 'Publish Branch', description: 'Push branch to GitHub', leftIcon: 'cloud-upload', onSelect: publishBranch },
      { id: 'sep-branches', type: 'separator' }
    ];

    // Setting: Checkout Branch Type Filter
    const checkoutType = settings['git.checkoutType'] ?? 'all';
    let filteredBranches = branches;
    if (checkoutType === 'local') filteredBranches = branches.filter((b: any) => !b.isRemote);
    else if (checkoutType === 'remote') filteredBranches = branches.filter((b: any) => b.isRemote);

    // Setting: Branch Sort Order
    const sortOrder = settings['git.branchSortOrder'] ?? 'committerdate';
    if (sortOrder === 'name') {
      filteredBranches = [...filteredBranches].sort((a: any, b: any) => a.name.localeCompare(b.name));
    }

    const branchItems = filteredBranches.map((b: any) => ({
      id:          b.name,
      label:       b.name,
      description: b.isCurrent ? 'Current Branch' : b.isRemote ? 'Remote Branch' : 'Local Branch',
      leftIcon:    b.isCurrent ? 'check' : 'git-branch',
      focusStyle:  (b.isCurrent ? 'highlight' : 'normal') as 'highlight' | 'normal',
      onSelect:    async () => { if (b.name !== currentBranch) await checkout(b.name); }
    }));

    usePaletteStore.getState().openQuickPick(
      'Select a branch or action',
      [...actionItems, ...branchItems],
      async (selected: any) => {
        if (selected.onSelect) selected.onSelect();
      }
    );
  },

  checkoutViaPalette: async () => get().openBranchPalette(),

  // ── Helper: Format & Validate Branch Name ─────────────────────────────────
  _formatBranchName: (rawName: string): string | null => {
    const settings = useSettingsStore.getState().settings;
    let name = rawName.trim();
    if (!name) return null;

    // Setting: Whitespace Replacement
    const spaceChar = settings['git.branchWhitespaceChar'] ?? '-';
    name = name.replace(/\s+/g, spaceChar);

    // Setting: Branch Prefix
    const prefix = settings['git.branchPrefix'] ?? '';
    if (prefix && !name.startsWith(prefix)) {
      name = prefix + name;
    }

    // Setting: Validation Regex
    const regexStr = settings['git.branchValidationRegex'];
    if (regexStr) {
      try {
        const regex = new RegExp(regexStr);
        if (!regex.test(name)) {
          notifyError('Invalid Branch Name', `Branch name "${name}" does not match the required format: ${regexStr}`);
          return null;
        }
      } catch (e) {
        console.error('Invalid regex in settings:', regexStr);
      }
    }
    return name;
  },

  // ── createBranch ──────────────────────────────────────────────────────────
  createBranch: async () => {
    usePaletteStore.getState().openInputBox(
      'New branch name (creates from current HEAD)',
      async (rawName) => {
        const name = (get() as any)._formatBranchName(rawName);
        if (!name) return;

        const cwd = getCwd();
        if (!cwd || !assertNative('createBranch')) return;
        set({ isLoading: true });
        try {
          await GitBackend.createBranch(cwd, name);
          await get().refresh();
          notifySuccess(`Switched to new branch "${name}".`);
        } catch (e: any) {
          set({ isLoading: false });
          handleGitAuthErrors(e, 'Create Branch Failed');
        }
      }
    );
  },

  // ── createBranchFrom ──────────────────────────────────────────────────────
  createBranchFrom: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('createBranchFrom')) return;
    const { branches } = get();

    usePaletteStore.getState().openQuickPick(
      'Select a branch to create from',
      branches.map(b => ({ id: b.name, label: b.name, leftIcon: 'git-branch' })),
      (selectedBase) => {
        usePaletteStore.getState().openInputBox(`New branch name (base: ${selectedBase.id})`, async (rawName) => {
          const name = (get() as any)._formatBranchName(rawName);
          if (!name) return;

          set({ isLoading: true });
          try { 
            await GitBackend.createBranch(cwd, name, selectedBase.id); 
            await get().refresh(); 
            notifySuccess(`Created and switched to branch "${name}"`);
          } 
          catch (e: any) { 
            set({ isLoading: false }); 
            handleGitAuthErrors(e, 'Create Branch Failed');
          }
        });
      }
    );
  },

  // ── mergeBranch & rebaseBranch ────────────────────────────────
  mergeBranch: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('merge')) return;
    const { branches, currentBranch } = get();
    const otherBranches = branches.filter(b => !b.isCurrent);

    usePaletteStore.getState().openQuickPick(
      `Select a branch to merge into ${currentBranch}`,
      otherBranches.map(b => ({ id: b.name, label: b.name, leftIcon: 'git-merge' })),
      async (selected) => {
        set({ isLoading: true });
        try { 
          await GitBackend.merge(cwd, selected.id); 
          notifySuccess(`Merged ${selected.id} into ${currentBranch}`); 
          await get().refresh(); 
        } 
        catch (e: any) { 
          set({ isLoading: false }); 
          handleGitAuthErrors(e, 'Merge Failed');
        }
      }
    );
  },

  rebaseBranch: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('rebase')) return;
    const { branches, currentBranch } = get();
    const otherBranches = branches.filter(b => !b.isCurrent);

    usePaletteStore.getState().openQuickPick(
      `Select a branch to rebase ${currentBranch} onto`,
      otherBranches.map(b => ({ id: b.name, label: b.name, leftIcon: 'repo-forked' })),
      async (selected) => {
        set({ isLoading: true });
        try { 
          await GitBackend.rebase(cwd, selected.id); 
          notifySuccess(`Rebased ${currentBranch} onto ${selected.id}`); 
          await get().refresh(); 
        } 
        catch (e: any) { 
          set({ isLoading: false }); 
          handleGitAuthErrors(e, 'Rebase Failed');
        }
      }
    );
  },

  renameBranch: async () => {
    const { currentBranch } = get();
    usePaletteStore.getState().openInputBox(
      `Rename "${currentBranch}" to:`,
      async (rawName) => {
        const newName = (get() as any)._formatBranchName(rawName);
        if (!newName || newName === currentBranch) return;

        const cwd = getCwd();
        if (!cwd || !assertNative('renameBranch')) return;
        set({ isLoading: true });
        try {
          await GitBackend.renameBranch(cwd, currentBranch, newName);
          await get().refresh();
        } catch (e: any) {
          set({ isLoading: false });
          handleGitAuthErrors(e, 'Rename Branch Failed'); 
        }
      }
    );
  },

  // ── deleteBranch ──────────────────────────────────────────────────────────
  deleteBranch: async () => {
    const { branches } = get();
    const deletable = branches.filter(b => !b.isCurrent && !b.isRemote);

    if (deletable.length === 0) {
      useNotificationStore.getState().addNotification({ type: 'info', title: 'Git', source: 'Git', message: 'No local branches available to delete.' });
      return;
    }

    usePaletteStore.getState().openQuickPick(
      'Select branch to delete',
      deletable.map(b => ({ id: b.name, label: b.name, description: 'Local Branch', leftIcon: 'git-branch' })),
      async (selected) => {
        const cwd = getCwd(); if (!cwd || !assertNative('deleteBranch')) return;

        const performDelete = async () => {
          try {
            await GitBackend.deleteBranch(cwd, selected.id);
            await get().refresh();
            notifySuccess(`Deleted branch ${selected.id}`);
          } catch (e: any) {
            handleGitAuthErrors(e, 'Delete Branch Failed');
          }
        };

        // Setting: Confirm Branch Delete
        const settings = useSettingsStore.getState().settings;
        if (settings['git.confirmBranchDelete'] ?? true) {
          const notif = useNotificationStore.getState();
          let nid = notif.addNotification({
            type: 'confirmation', title: 'Delete Branch', source: 'Git',
            message: `Delete local branch "${selected.id}"? This cannot be undone.`,
            actions: [
              { label: 'Delete', variant: 'type1', customStyle: { backgroundColor: '#d32f2f', color: '#fff', borderColor: '#d32f2f' }, onClick: () => { notif.removeNotification(nid); performDelete(); } },
              { label: 'Cancel', variant: 'type2', onClick: () => notif.removeNotification(nid) },
            ],
          });
        } else {
          await performDelete();
        }
      }
    );
  },

  // ── deleteRemoteBranch ────────────────────────────────────────────────────
  deleteRemoteBranch: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('deleteRemoteBranch')) return;
    const remoteBranches = get().branches.filter(b => b.isRemote);

    if (!remoteBranches.length) { notifyError('Delete Remote Branch', 'No remote branches found.'); return; }

    usePaletteStore.getState().openQuickPick(
      'Select a remote branch to delete',
      remoteBranches.map(b => ({ id: b.name, label: b.name, leftIcon: 'cloud' })),
      async (selected) => {
        const parts = selected.id.split('/'); 
        if (parts.length < 2) return;
        const remote = parts[0];
        const branchName = parts.slice(1).join('/');

        const performDelete = async () => {
          set({ isLoading: true });
          try { 
            await GitBackend.deleteRemoteBranch(cwd, remote, branchName); 
            notifySuccess(`Deleted remote branch ${selected.id}`); 
            await get().refresh(); 
          } catch (e: any) { 
            set({ isLoading: false }); 
            handleGitAuthErrors(e, 'Delete Remote Branch Failed');
          }
        };

        // Setting: Confirm Branch Delete
        const settings = useSettingsStore.getState().settings;
        if (settings['git.confirmBranchDelete'] ?? true) {
          const notif = useNotificationStore.getState();
          let nid = notif.addNotification({
            type: 'confirmation', title: 'Delete Remote Branch', source: 'Git',
            message: `Delete remote branch "${selected.id}" from GitHub? This cannot be undone.`,
            actions: [
              { label: 'Delete', variant: 'type1', customStyle: { backgroundColor: '#d32f2f', color: '#fff', borderColor: '#d32f2f' }, onClick: () => { notif.removeNotification(nid); performDelete(); } },
              { label: 'Cancel', variant: 'type2', onClick: () => notif.removeNotification(nid) }
            ]
          });
        } else {
          await performDelete();
        }
      }
    );
  },
});