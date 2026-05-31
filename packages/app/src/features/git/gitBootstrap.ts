// src/features/git/gitBootstrap.ts

import { Capacitor } from '@capacitor/core';
import { useActivityBarStore } from '@/store/activityBarStore';
import { useMenuStore } from '@/store/menuStore';
import { useNotificationStore } from '@/store/notificationStore';
import { usePaletteStore } from '@/store/paletteStore';
import { commands } from '@/core/extensionAPI/registry/commandRegistry';
import { useGitStore } from './store/gitStore';
import { useGithubAuthStore } from '@/store/githubAuthStore';
import { useExplorerStore } from '@/features/explorer/store/exploreStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { bootstrapGitPanel } from './GitSkeleton';
import { gitAccess } from './gitAccess'; 


let autoFetchInterval: any = null;

export function bootstrapGit() {
    bootstrapGitPanel();

    commands.registerCommand('git.refresh', () => useGitStore.getState().refresh(), { title: 'Refresh', category: 'Git', icon: 'refresh' });
    commands.registerCommand('git.stageAll', () => useGitStore.getState().stageAll(), { title: 'Stage All Changes', category: 'Git', icon: 'add' });

    commands.registerCommand('git.commit', async () => {
        const { stagedFiles, commitMessage, stageAll, commit } = useGitStore.getState();
        const settings = useSettingsStore.getState().settings;
        const notif = useNotificationStore.getState();

        if (!commitMessage.trim()) {
            notif.addNotification({ type: 'error', title: 'Git', source: 'Git', message: 'Commit message is empty.' });
            return;
        }

        if (!stagedFiles.length) {
            const enableSmartCommit = settings['git.enableSmartCommit'] ?? false;
            if (enableSmartCommit) await stageAll();
            else {
                notif.addNotification({ type: 'error', title: 'Git', source: 'Git', message: 'No staged changes. Enable Smart Commit in settings to auto-stage.' });
                return;
            }
        }

        // Git Feature Requests Access before committing (Optional but good practice)
        const token = await useGithubAuthStore.getState().requestToken('mscode.git', 'MSCode Source Control');
        if (token) commit();
        else notif.addNotification({ type: 'warning', title: 'Git', source: 'Git', message: 'GitHub access required to commit.' });

    }, { title: 'Commit', category: 'Git', icon: 'check' });

    commands.registerCommand('git.checkout', () => useGitStore.getState().openBranchPalette(), { title: 'Checkout to...', category: 'Git', icon: 'git-branch' });
    commands.registerCommand('git.pull', () => useGitStore.getState().pull(), { title: 'Pull', category: 'Git', icon: 'arrow-down' });
    commands.registerCommand('git.push', () => useGitStore.getState().push(), { title: 'Push', category: 'Git', icon: 'arrow-up' });
    commands.registerCommand('git.fetch', () => useGitStore.getState().fetch(), { title: 'Fetch', category: 'Git', icon: 'sync' });
    commands.registerCommand('git.clone', () => useGitStore.getState().cloneRepo(), { title: 'Clone Repository...', category: 'Git', icon: 'repo-clone' });
    commands.registerCommand('git.init', () => useGitStore.getState().initRepo(), { title: 'Initialize Repository', category: 'Git', icon: 'repo' });
    commands.registerCommand('git.showOutput', () => { commands.executeCommand('workbench.action.output.toggleOutput'); }, { title: 'Show Git Output', category: 'Git', icon: 'output' });

    commands.registerCommand('github.signIn', () => _signInFlow(), { title: 'Sign In to GitHub', category: 'GitHub', icon: 'github' });
    commands.registerCommand('github.signOut', () => _signOutFlow(), { title: 'Sign Out of GitHub', category: 'GitHub', icon: 'sign-out' });

    useMenuStore.getState().registerMenuItem('sidebar/explorer/title/context', {
        id: 'git.openPanel', label: 'Source Control', icon: 'git-branch',
        onClick: () => useActivityBarStore.getState().topItems.find(i => i.id === 'git')?.onClick?.(),
    });

    useGithubAuthStore.getState().initAuth();

    useExplorerStore.subscribe((state, prev) => {
        if (state.workspacePath !== prev.workspacePath) setTimeout(() => useGitStore.getState().refresh(), 300);
    });

    setTimeout(() => useGitStore.getState().refresh(), 800);

    const setupAutoFetch = () => {
        const settings = useSettingsStore.getState().settings;
        const autofetch = settings['git.autofetch'] ?? false;
        const period = settings['git.autofetchPeriod'] ?? 180;

        if (autoFetchInterval) clearInterval(autoFetchInterval);

        if (autofetch) {
            autoFetchInterval = setInterval(() => {
                const state = useGitStore.getState();
                if (state.isGitRepo && !state.isLoading && settings['git.enabled']) {
                    state.fetch();
                }
            }, period * 1000);
        }
    };

    setupAutoFetch();
    useSettingsStore.subscribe((state, prevState) => {
        if (state.settings['git.autofetch'] !== prevState.settings['git.autofetch'] || state.settings['git.autofetchPeriod'] !== prevState.settings['git.autofetchPeriod']) {
            setupAutoFetch();
        }
    });
}


function _signInFlow() {
    if (!Capacitor.isNativePlatform()) {
        useNotificationStore.getState().addNotification({ type: 'info', title: 'GitHub Sign In', source: 'GitHub Auth', message: 'Auth is available on Android only.' });
        return;
    }
    
    const isGloballyAuth = gitAccess.isGloballyAuthenticated();
    const isGranted = gitAccess.isGranted();

    // If logged in globally but Git is denied, just ask for Permission!
    if (isGloballyAuth && !isGranted) {
        gitAccess.requestToken().then(token => {
            if (token) {
                useNotificationStore.getState().addNotification({ type: 'success', title: 'GitHub Auth', source: 'Git', message: 'Source control access granted.' });
            }
        });
        return; // Stop here, no need to show palette
    } 

    // If already logged in and granted, tell the user, but let them switch accounts if they want.
    if (isGloballyAuth && isGranted) {
        useNotificationStore.getState().addNotification({ type: 'info', title: 'GitHub Auth', source: 'Git', message: 'You are already signed in to GitHub.' });
    }

    usePaletteStore.getState().openQuickPick(
        isGloballyAuth ? 'Select an action:' : 'Select how you want to sign in to GitHub',
        [
            {
                id: 'oauth',
                label: isGloballyAuth ? 'Sign In with a different account' : 'Sign In with GitHub (Browser)',
                description: 'Recommended for seamless experience',
                leftIcon: 'github'
            },
            {
                id: 'pat',
                label: 'Sign In using Personal Access Token (PAT)',
                description: 'Manually enter a token and email',
                leftIcon: 'key'
            }
        ],
        (selected) => {
            if (selected.id === 'oauth') {
                useGithubAuthStore.getState().signInWithGitHub();
            } else if (selected.id === 'pat') {
                _signInWithPATFlow();
            }
        }
    );
}

function _signInWithPATFlow() {
    const openInput = usePaletteStore.getState().openInputBox;

    openInput('GitHub Username  (e.g. octocat)', (username) => {
        if (!username.trim()) return;
        openInput(`Email for "${username.trim()}"  — used for git commits`, (email) => {
            if (!email.trim()) return;
            if (!email.includes('@')) {
                useNotificationStore.getState().addNotification({ type: 'error', title: 'GitHub Auth', source: 'GitHub Auth', message: `Invalid email address.` });
                return;
            }
            openInput(`GitHub Personal Access Token  (needs "repo" scope)`, async (token) => {
                if (!token.trim()) return;
                const notif = useNotificationStore.getState();
                const loadingId = notif.addNotification({ type: 'loading', title: 'GitHub Auth', source: 'GitHub Auth', message: `Validating token for "${username.trim()}"…` });

                try {
                    const success = await useGithubAuthStore.getState().loginWithPAT(token.trim(), email.trim());
                    notif.removeNotification(loadingId);
                    if (success) {
                        useGitStore.getState().refresh();
                        notif.addNotification({ type: 'success', title: 'GitHub Auth', source: 'GitHub Auth', message: 'Successfully signed in using PAT.' });
                    }
                } catch (e: any) {
                    notif.removeNotification(loadingId);
                    notif.addNotification({ type: 'error', title: 'GitHub Auth', source: 'GitHub Auth', message: e?.message ?? 'Unexpected error.' });
                }
            });
        });
    });
}


// ─── Safe Sign-Out Flow ───────────────────────────────────────────────────

function _signOutFlow() {
    const { user, logout } = useGithubAuthStore.getState();
    const notif = useNotificationStore.getState();

    if (!user) {
        notif.addNotification({ type: 'info', title: 'GitHub Auth', source: 'GitHub Auth', message: 'No active GitHub session.' });
        return;
    }

    // Type username to confirm
    usePaletteStore.getState().openInputBox(
        `Type "${user.login}" to confirm sign out`,
        async (inputVal) => {
            if (inputVal.trim() === user.login) {
                await logout();
                notif.addNotification({ type: 'success', title: 'Signed Out', source: 'GitHub Auth', message: 'Successfully signed out of GitHub.' });
                useGitStore.getState().refresh();
            } else {
                notif.addNotification({ type: 'error', title: 'Sign Out Failed', source: 'GitHub Auth', message: 'Username did not match. Action cancelled.' });
            }
        }
    );
}