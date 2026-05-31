// src/features/git/store/slices/gitRepoSlice.ts

import type { StateCreator }    from 'zustand';
import { useNotificationStore } from '@/store/notificationStore';
import { usePaletteStore }      from '@/store/paletteStore';
import type { QuickPickItem }   from '@/store/paletteStore';
import { useFilePickerStore }   from '@/store/filePickerStore';
import { useExplorerStore }     from '@/features/explorer/store/exploreStore';
import { useSettingsStore }     from '@/features/settings/store/settingsStore';
import { GitBackend }           from '../../core/GitBackend';
import { gitAccess }            from '../../gitAccess'; 
import { showGitAuthMenu }      from '../../utils/gitAuthMenu';
import { handleGitAuthErrors }  from '../../utils/gitErrorHandler';
import { getCwd, notifyError, assertNative } from '../_helpers';
import type { GitState, RepoSlice } from '../../types';

export const createRepoSlice: StateCreator<GitState, [], [], RepoSlice> = (set, get) => ({

  /**
   * Initializes a new Git repository in the current workspace directory.
   * Automatically sets the default branch name based on user settings.
   */
  initRepo: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('initRepo')) return;
    const settings = useSettingsStore.getState().settings;
    const defaultBranch = settings['git.defaultBranchName'] ?? 'main';

    set({ isLoading: true });
    try {
      await (GitBackend as any).init(cwd, defaultBranch);
      useNotificationStore.getState().addNotification({ type: 'success', title: 'Git', source: 'Git', message: `Repository initialized with branch "${defaultBranch}".` });
      await get().refresh();
    } catch (e: any) {
      set({ isLoading: false }); handleGitAuthErrors(e, 'Init Failed');
    }
  },

  /**
   * Clones a remote repository to the local filesystem.
   * Utilizes the dynamic Command Palette to show GitHub repositories directly,
   * or accepts a manually typed URL.
   */
  cloneRepo: async () => {
    if (!assertNative('cloneRepo')) return;

    // Helper to execute the actual clone command
    const performClone = async (url: string) => {
      if (!url.trim()) return;
      const parentDir = await useFilePickerStore.getState().showPicker({ mode: 'folder', title: 'Select Destination Folder', buttonText: 'Clone Here' });
      if (!parentDir) return; 

      set({ isLoading: true });
      const notif = useNotificationStore.getState();
      const loadingId = notif.addNotification({ type: 'loading', title: 'Git', source: 'Git', message: `Cloning ${url.trim()}…` });

      try {
        await GitBackend.clone(url.trim(), parentDir);
        notif.removeNotification(loadingId);
        set({ isLoading: false });

        let targetName = url.split('/').pop() || 'repo';
        if (targetName.endsWith('.git')) targetName = targetName.slice(0, -4);
        const finalPath = `${parentDir}/${targetName}`.replace(/\/+/g, '/');

        notif.addNotification({ type: 'success', title: 'Git', source: 'Git', message: `Repository cloned into ${targetName}.` });
        useExplorerStore.getState().setWorkspace(targetName, finalPath);
      } catch (e: any) {
        notif.removeNotification(loadingId); set({ isLoading: false }); handleGitAuthErrors(e, 'Clone Failed');
      }
    };

    // 1. Authenticate and fetch repos
    let token: string | null = null;
    if (gitAccess.isGloballyAuthenticated()) token = await gitAccess.requestToken();

    set({ isLoading: true });
    let repos: any[] = [];
    if (token) {
      try {
        const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) repos = await res.json();
      } catch (e) {}
    }
    set({ isLoading: false });

    // 2. Build initial static options
    const initialOptions: QuickPickItem[] = [];
    if (!token) {
      const isGloballyAuth = gitAccess.isGloballyAuthenticated();
      initialOptions.push({ 
        id: 'auth', label: isGloballyAuth ? 'Grant Source Control Access' : 'Sign in to GitHub', 
        description: 'Connect GitHub to see and clone your repositories directly', leftIcon: isGloballyAuth ? 'shield' : 'github' 
      });
    } else {
      repos.forEach(r => {
        initialOptions.push({
          id: r.clone_url, label: r.full_name, description: r.private ? 'Private Repository' : 'Public Repository',
          leftIcon: r.private ? 'lock' : 'repo', data: { url: r.clone_url }
        });
      });
    }

    initialOptions.push({ id: 'custom-url-static', label: 'Clone from custom URL...', description: 'Type a URL to clone a repository', leftIcon: 'link' });

    // 3. Open dynamic QuickPick
    const palette = usePaletteStore.getState();
    palette.openQuickPick(
      'Enter Remote URL to clone...',
      
      // Dynamic Generator Function
      (query: string) => {
        const q = query.trim();
        if (q.length > 0) {
          const isStrictUrl = q.startsWith('http') || q.startsWith('git@') || q.includes('://') || q.startsWith('github.com');
          const dynamicItem: QuickPickItem = {
            id: 'custom-url-dynamic', label: 'Clone from URL', description: q, leftIcon: 'link', data: { url: q }
          };
          if (isStrictUrl) return [dynamicItem];
          return [dynamicItem, ...initialOptions];
        }
        return initialOptions;
      },
      
      // On Select Handler
      (selected) => {
        if (selected.id === 'auth') {
          showGitAuthMenu('Clone Repository', 'Please sign in or grant access to view your repositories.');
        } else if (selected.id === 'custom-url-static') {
          palette.openInputBox('Enter Remote URL to clone...', performClone);
        } else {
          performClone(selected.data?.url || selected.id);
        }
      }
    );
  },

  /**
   * Publishes the current local branch to a remote.
   * If no remote is configured, it prompts the user to create a new GitHub repository 
   * or link to an existing empty one.
   */
  publishBranch: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('publishBranch')) return;
    const { currentBranch } = get();
    const notif = useNotificationStore.getState();

    // Check if remote already exists
    let hasRemote = false;
    try { hasRemote = (await GitBackend.run('remote', cwd)).trim().length > 0; } catch {}

    if (hasRemote) {
      set({ isLoading: true });
      try {
        await GitBackend.pushSetUpstream(cwd, currentBranch);
        notif.addNotification({ type: 'success', title: 'Git', source: 'Git', message: `Branch "${currentBranch}" published.` });
        await get().refresh();
      } catch (e: any) { set({ isLoading: false }); handleGitAuthErrors(e, 'Publish Failed'); }
      return;
    }

    // Authenticate and fetch existing user repos
    let token: string | null = null;
    if (gitAccess.isGloballyAuthenticated()) token = await gitAccess.requestToken();

    set({ isLoading: true });
    let existingRepos: any[] = [];
    if (token) {
      try {
        const res = await fetch('https://api.github.com/user/repos?sort=pushed&per_page=50', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) existingRepos = await res.json();
      } catch (e) {}
    }
    set({ isLoading: false });

    const repoName = cwd.split('/').pop() || 'my-project';
    const initialOptions: QuickPickItem[] = [];

    // Build initial static options
    if (!token) {
      const isGloballyAuth = gitAccess.isGloballyAuthenticated();
      initialOptions.push({ 
        id: 'auth', label: isGloballyAuth ? 'Grant Source Control Access' : 'Sign in to GitHub', 
        description: 'Publish directly to your GitHub account', leftIcon: isGloballyAuth ? 'shield' : 'github' 
      });
    } else {
      initialOptions.push({ id: 'create-private', label: `Publish to GitHub privately`, description: `Create a new private repository`, leftIcon: 'lock', data: { isNew: true, isPrivate: true } });
      initialOptions.push({ id: 'create-public', label: `Publish to GitHub publicly`, description: `Create a new public repository`, leftIcon: 'globe', data: { isNew: true, isPrivate: false } });
      existingRepos.forEach(r => {
        initialOptions.push({ id: r.clone_url, label: `Push to existing: ${r.full_name}`, description: r.private ? 'Private' : 'Public', leftIcon: 'repo', data: { isNew: false, url: r.clone_url } });
      });
    }

    initialOptions.push({ id: 'custom-url-static', label: 'Enter remote URL manually...', description: 'Click to type a URL (e.g. https://github.com/...)', leftIcon: 'link' });

    // Open dynamic QuickPick
    const palette = usePaletteStore.getState();
    palette.openQuickPick(
      'Enter Remote URL to publish to...',
      
      // Dynamic Generator Function
      (query: string) => {
        const q = query.trim();
        if (q.length > 0) {
          const isStrictUrl = q.startsWith('http') || q.startsWith('git@') || q.includes('://') || q.startsWith('github.com');
          const dynamicItem: QuickPickItem = {
            id: 'custom-url-dynamic', label: 'Publish to URL', description: q, leftIcon: 'link', data: { url: q }
          };
          if (isStrictUrl) return [dynamicItem];
          return [dynamicItem, ...initialOptions];
        }
        return initialOptions;
      },

      // On Select Handler
      async (selected) => {
        if (selected.id === 'auth') {
          showGitAuthMenu('Publish Branch', 'Please sign in or grant access to publish to GitHub.');
          return;
        }

        if (selected.id === 'custom-url-static') {
          palette.openInputBox('Enter Remote URL to publish to...', async (url) => {
            if (!url.trim()) return;
            set({ isLoading: true });
            try {
              await GitBackend.addRemote(cwd, url.trim());
              await GitBackend.pushSetUpstream(cwd, currentBranch);
              notif.addNotification({ type: 'success', title: 'Git', source: 'Git', message: `Branch "${currentBranch}" published.` });
              await get().refresh();
            } catch (e: any) { set({ isLoading: false }); handleGitAuthErrors(e, 'Publish Failed'); }
          });
          return;
        }
        
        // Handle Dynamic URL or GitHub API Creation
        set({ isLoading: true });
        const isDynamicUrl = selected.id === 'custom-url-dynamic';
        const loadingId = notif.addNotification({ type: 'loading', title: 'Git', source: 'Git', message: selected.data?.isNew ? `Creating repository "${repoName}"…` : `Adding remote and pushing…` });

        try {
          if (isDynamicUrl) {
            await GitBackend.addRemote(cwd, selected.data.url);
          } else if (selected.data?.isNew) {
            const cloneUrl = await GitBackend.createGithubRepo(repoName, selected.data.isPrivate, token!);
            await GitBackend.addRemote(cwd, cloneUrl);
          } else {
            await GitBackend.addRemote(cwd, selected.data.url);
          }
          await GitBackend.pushSetUpstream(cwd, currentBranch);
          notif.removeNotification(loadingId);
          notif.addNotification({ type: 'success', title: 'Git', source: 'Git', message: `Successfully published branch "${currentBranch}".` });
          await get().refresh();
        } catch (e: any) {
          notif.removeNotification(loadingId); set({ isLoading: false }); handleGitAuthErrors(e, 'Publish Failed');
        }
      }
    );
  },
  
  /**
   * Creates a new Git tag locally. Prompts the user for a tag name and an optional message.
   */
  createTag: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('createTag')) return;
    usePaletteStore.getState().openInputBox('Tag name (e.g. v1.0.0)', (name) => {
      if (!name.trim()) return;
      usePaletteStore.getState().openInputBox('Message (optional). Leave empty for a lightweight tag.', async (msg) => {
        set({ isLoading: true });
        try { 
          await GitBackend.createTag(cwd, name.trim(), msg); 
          useNotificationStore.getState().addNotification({ type: 'success', title: 'Git', source: 'Git', message: `Tag "${name.trim()}" created.` });
          await get().refresh(); 
        } catch (e: any) { set({ isLoading: false }); handleGitAuthErrors(e, 'Create Tag Failed'); }
      });
    });
  },

  /**
   * Deletes a local Git tag by name via a QuickPick selection.
   */
  deleteTag: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('deleteTag')) return;
    const { tags } = get() as any; 
    if (!tags || !tags.length) { notifyError('Delete Tag', 'No local tags found.'); return; }

    usePaletteStore.getState().openQuickPick(
      'Select a tag to delete', tags.map((t: string) => ({ id: t, label: t, leftIcon: 'tag' })),
      async (selected) => {
        set({ isLoading: true });
        try { 
          await GitBackend.deleteTag(cwd, selected.id); 
          useNotificationStore.getState().addNotification({ type: 'success', title: 'Git', source: 'Git', message: `Tag "${selected.id}" deleted.` });
          await get().refresh(); 
        } catch (e: any) { set({ isLoading: false }); handleGitAuthErrors(e, 'Delete Tag Failed'); }
      }
    );
  },

  /**
   * Pushes all local tags to the configured remote repository.
   */
  pushTags: async () => {
    const cwd = getCwd(); if (!cwd || !assertNative('pushTags')) return;
    set({ isLoading: true });
    try { 
      await GitBackend.pushTags(cwd); 
      useNotificationStore.getState().addNotification({ type: 'success', title: 'Git', source: 'Git', message: 'Tags pushed to remote successfully.' });
      await get().refresh(); 
    } catch (e: any) { set({ isLoading: false }); handleGitAuthErrors(e, 'Push Tags Failed'); }
  },
});