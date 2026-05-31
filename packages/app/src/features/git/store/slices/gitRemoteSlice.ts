// src/features/git/store/slices/gitRemoteSlice.ts

import type { StateCreator }    from 'zustand';
import { useNotificationStore } from '@/store/notificationStore';
import { useSettingsStore }     from '@/features/settings/store/settingsStore';
import { usePaletteStore, type QuickPickItem } from '@/store/paletteStore';
import { GitBackend }           from '../../core/GitBackend';
import { gitAccess }            from '../../gitAccess';
import { showGitAuthMenu }      from '../../utils/gitAuthMenu';
import { getCwd, notifyError, notifySuccess, assertNative } from '../_helpers';
import type { GitState, RemoteSlice } from '../../types';

export const createRemoteSlice: StateCreator<GitState, [], [], RemoteSlice> = (set, get) => ({

  // ── Sync ──────────────────────────────────────────────────────────────────
  sync: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('sync')) return;
    const settings = useSettingsStore.getState().settings;

    const performSync = async () => {
      set({ isLoading: true });
      try {
        if (settings['git.rebaseWhenSync']) {
          await GitBackend.pullRebase(cwd);
        } else {
          await GitBackend.pull(cwd);
        }
        await GitBackend.push(cwd);
        notifySuccess('Sync complete.');
        await get().refresh();
      } catch (e: any) {
        set({ isLoading: false });
        notifyError('Sync Failed', e?.message ?? 'Could not sync with remote');
      }
    };

    if (settings['git.confirmSync'] ?? true) {
      const notif = useNotificationStore.getState();
      let nid = notif.addNotification({
        type: 'confirmation', title: 'Sync Changes', source: 'Git',
        message: 'This will push and pull commits to and from the remote branch. Are you sure?',
        actions: [
          { label: 'Sync', variant: 'type1', onClick: () => { notif.removeNotification(nid); performSync(); } },
          { label: 'Cancel', variant: 'type2', onClick: () => notif.removeNotification(nid) }
        ]
      });
    } else {
      await performSync();
    }
  },

  // ── Fetch Variants ────────────────────────────────────────────────────────
  fetch: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('fetch')) return;
    const settings = useSettingsStore.getState().settings;
    
    set({ isLoading: true });
    try { 
      if (settings['git.pruneOnFetch']) {
        await GitBackend.fetchPrune(cwd); 
      } else {
        await GitBackend.fetch(cwd); 
      }
      notifySuccess('Fetch complete.'); 
      await get().refresh(); 
    } 
    catch (e: any) { set({ isLoading: false }); notifyError('Fetch Failed', e?.message); }
  },

  fetchPrune: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('fetchPrune')) return;
    set({ isLoading: true });
    try { await GitBackend.fetchPrune(cwd); notifySuccess('Fetch (Prune) complete.'); await get().refresh(); } 
    catch (e: any) { set({ isLoading: false }); notifyError('Fetch Failed', e?.message); }
  },

  fetchAll: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('fetchAll')) return;
    set({ isLoading: true });
    try { await GitBackend.fetchAll(cwd); notifySuccess('Fetch All complete.'); await get().refresh(); } 
    catch (e: any) { set({ isLoading: false }); notifyError('Fetch Failed', e?.message); }
  },

  // ── Pull Variants ─────────────────────────────────────────────────────────
  pull: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('pull')) return;
    const settings = useSettingsStore.getState().settings;

    set({ isLoading: true });
    try { 
      if (settings['git.fetchOnPull']) {
        await GitBackend.fetch(cwd);
      }
      await GitBackend.pull(cwd); 
      notifySuccess('Pull complete.'); 
      await get().refresh(); 
    } 
    catch (e: any) { set({ isLoading: false }); notifyError('Pull Failed', e?.message); }
  },

  pullRebase: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('pullRebase')) return;
    set({ isLoading: true });
    try { await GitBackend.pullRebase(cwd); notifySuccess('Pull (Rebase) complete.'); await get().refresh(); } 
    catch (e: any) { set({ isLoading: false }); notifyError('Pull Failed', e?.message); }
  },

  pullFrom: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('pullFrom')) return;
    const remotes = await GitBackend.getRemotes(cwd);
    if (!remotes.length) { notifyError('Pull', 'No remotes configured.'); return; }

    usePaletteStore.getState().openQuickPick(
      'Pick a remote to pull the branch from',
      remotes.map(r => ({ id: r, label: r, leftIcon: 'repo' })),
      (remote) => {
        usePaletteStore.getState().openInputBox(`Branch to pull from ${remote.id} (e.g. main)`, async (branch) => {
          if (!branch.trim()) return;
          set({ isLoading: true });
          try { await GitBackend.pullFrom(cwd, remote.id, branch.trim()); notifySuccess('Pull complete.'); await get().refresh(); } 
          catch (e: any) { set({ isLoading: false }); notifyError('Pull Failed', e?.message); }
        });
      }
    );
  },

  // ── Push Variants ─────────────────────────────────────────────────────────
  push: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('push')) return;
    const settings = useSettingsStore.getState().settings;

    set({ isLoading: true });
    try { 
      if (settings['git.pullBeforePush']) {
        await GitBackend.pull(cwd);
      }
      await GitBackend.push(cwd); 
      notifySuccess('Push complete.'); 
      await get().refresh(); 
    } 
    catch (e: any) { set({ isLoading: false }); notifyError('Push Failed', e?.message); }
  },

  pushTo: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('pushTo')) return;
    const remotes = await GitBackend.getRemotes(cwd);
    if (!remotes.length) { notifyError('Push', 'No remotes configured.'); return; }

    usePaletteStore.getState().openQuickPick(
      'Pick a remote to push the branch to',
      remotes.map(r => ({ id: r, label: r, leftIcon: 'repo' })),
      (remote) => {
        usePaletteStore.getState().openInputBox(`Branch to push to ${remote.id} (e.g. main)`, async (branch) => {
          if (!branch.trim()) return;
          set({ isLoading: true });
          try { await GitBackend.pushTo(cwd, remote.id, branch.trim()); notifySuccess('Push complete.'); await get().refresh(); } 
          catch (e: any) { set({ isLoading: false }); notifyError('Push Failed', e?.message); }
        });
      }
    );
  },
  
  // ── Add Remote ────────────────────────────────────────────────────────────
  /**
   * Adds a new Git remote to the repository.
   * Leverages the native Dynamic Command Palette to suggest GitHub repositories
   * or accepts a manually provided remote URL.
   */
  addRemote: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('addRemote')) return;
    
    // Helper for the core remote adding execution
    const performAddRemote = (url: string) => {
      if (!url.trim()) return;
      usePaletteStore.getState().openInputBox(
        'Provide a remote name (e.g. origin, upstream)',
        async (name) => {
          const finalName = name.trim() || 'origin';
          set({ isLoading: true });
          try { 
            await GitBackend.addRemote(cwd, url.trim(), finalName); 
            notifySuccess(`Remote "${finalName}" added.`); 
            await get().refresh(); 
          } 
          catch (e: any) { set({ isLoading: false }); notifyError('Add Remote Failed', e?.message); }
        }
      );
    };

    // 1. Check GitHub Auth for Auto-Suggestions
    let token: string | null = null;
    if (gitAccess.isGloballyAuthenticated()) {
      token = await gitAccess.requestToken();
    }

    set({ isLoading: true });
    let repos: any[] = [];
    if (token) {
      try {
        const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) repos = await res.json();
      } catch (e) {
        console.warn("Failed to fetch GitHub repos for adding remote.", e);
      }
    }
    set({ isLoading: false });

    // 2. Build Initial Static Options Array
    const initialOptions: QuickPickItem[] = [];
    if (!token) {
      const isGloballyAuth = gitAccess.isGloballyAuthenticated();
      initialOptions.push({ 
        id: 'auth', 
        label: isGloballyAuth ? 'Grant Source Control Access' : 'Sign in to GitHub', 
        description: 'Connect GitHub to see and add your repositories as a remote', 
        leftIcon: isGloballyAuth ? 'shield' : 'github' 
      });
    } else {
      repos.forEach(r => {
        initialOptions.push({
          id: r.clone_url,
          label: r.full_name,
          description: r.private ? 'Private Repository' : 'Public Repository',
          leftIcon: r.private ? 'lock' : 'repo',
          data: { url: r.clone_url }
        });
      });
    }

    initialOptions.push({ 
      id: 'custom-url-static', 
      label: 'Add remote from custom URL...', 
      description: 'Type a repository URL manually', 
      leftIcon: 'link' 
    });

    // 3. Open Dynamic QuickPick Palette
    const palette = usePaletteStore.getState();
    palette.openQuickPick(
      'Enter Remote URL to add...',
      
      // Dynamic Generator Function
      (query: string) => {
        const q = query.trim();
        if (q.length > 0) {
          const isStrictUrl = q.startsWith('http') || q.startsWith('git@') || q.includes('://') || q.startsWith('github.com');
          const dynamicItem: QuickPickItem = {
            id: 'custom-url-dynamic', label: 'Add remote URL', description: q, leftIcon: 'link', data: { url: q }
          };
          if (isStrictUrl) return [dynamicItem];
          return [dynamicItem, ...initialOptions];
        }
        return initialOptions;
      },
      
      // On Select Handler
      (selected) => {
        if (selected.id === 'auth') {
          showGitAuthMenu('Add Remote', 'Please sign in or grant access to view your repositories.');
        } else if (selected.id === 'custom-url-static') {
          palette.openInputBox('Provide a remote URL (e.g. https://github.com/...)', performAddRemote);
        } else {
          performAddRemote(selected.data?.url || selected.id);
        }
      }
    );
  },

  // ── Remove Remote ─────────────────────────────────────────────────────────
  removeRemote: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('removeRemote')) return;
    const remotes = await GitBackend.getRemotes(cwd);
    
    if (!remotes.length) { notifyError('Remove Remote', 'No remotes configured.'); return; }

    usePaletteStore.getState().openQuickPick(
      'Select a remote to remove',
      remotes.map(r => ({ id: r, label: r, leftIcon: 'repo' })),
      async (remote) => {
        set({ isLoading: true });
        try { 
          await GitBackend.removeRemote(cwd, remote.id); 
          notifySuccess(`Remote "${remote.id}" removed.`); 
          await get().refresh(); 
        } 
        catch (e: any) { set({ isLoading: false }); notifyError('Remove Remote Failed', e?.message); }
      }
    );
  }
  
});