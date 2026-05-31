// src/features/git/utils/gitAuthMenu.ts

import { useNotificationStore } from '@/store/notificationStore';
import { usePaletteStore }      from '@/store/paletteStore';
import { commands }             from '@/core/extensionAPI/registry/commandRegistry'; 
import { useGithubAuthStore }   from '@/store/githubAuthStore';
import { gitAccess }            from '../gitAccess';

/**
 * Displays the interactive GitHub authentication palette interface.
 * Evaluates active global session and permission structures to dynamically prompt 
 * the user with appropriate action workflows (PAT, OAuth, or Troubleshooting).
 * * @param {string} title Fallback warning notification header title.
 * @param {string} message Fallback warning notification description body.
 */
export const showGitAuthMenu = async (title: string, message: string) => {
  const isGloballyAuth = gitAccess.isGloballyAuthenticated();
  const hasGitAccess = gitAccess.isGranted();
  
  // Direct store validation checking for a valid runtime access token instance
  const hasRealToken = !!useGithubAuthStore.getState().token; 
  
  const notif = useNotificationStore.getState();

  // CASE 1: Globally authenticated but explicit application access permission is missing
  if (isGloballyAuth && !hasGitAccess) {
    const token = await gitAccess.requestToken();
    if (token) {
      notif.addNotification({ type: 'success', title: 'Access Granted', source: 'Git Auth', message: 'Access granted! You can now retry your previous action.' });
    } else if (!useGithubAuthStore.getState().token) {
      // Permission flow resolved successfully but browser configuration context failed to pass a token
      notif.addNotification({ type: 'error', title: 'Token Missing', source: 'Git Auth', message: 'Access granted, but GitHub did not provide a token. Please use PAT.' });
    }
    return;
  }

  // CASE 2: Globally authenticated and verified access permission, yet actual token remains empty
  if (isGloballyAuth && hasGitAccess && !hasRealToken) {
    notif.addNotification({
      type: 'error',
      title: 'GitHub Token Missing',
      source: 'Git Auth',
      message: 'Your browser login did not provide a valid access token. Please select "Connect GitHub using PAT".'
    });
  } else if (!isGloballyAuth) {
    notif.addNotification({ type: 'warning', title: title, source: 'Git Auth', message: message });
  }

  const options: any[] = [
    {
      id: 'auth-github-pat',
      label: 'Connect GitHub using PAT (Recommended)',
      description: 'Use a Personal Access Token (Fixes missing token issues)',
      leftIcon: 'key',
      onSelect: () => {
        commands.executeCommand('github.signIn');
      }
    },
    {
      id: 'auth-github-oauth',
      label: isGloballyAuth ? 'Re-authenticate with Browser' : 'Sign In with GitHub (Browser)',
      description: 'May not provide tokens on some Android devices',
      leftIcon: 'github',
      onSelect: () => {
        useGithubAuthStore.getState().signInWithGitHub();
      }
    },
    {
      id: 'auth-github-help',
      label: 'How to create a PAT?',
      description: 'Open GitHub settings in browser',
      leftIcon: 'question',
      onSelect: () => {
        window.open('https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens', '_blank');
      }
    }
  ];

  setTimeout(() => {
    usePaletteStore.getState().openQuickPick(
      isGloballyAuth && !hasRealToken ? 'Token Missing! Please use PAT...' : 'Authentication required for GitHub...',
      options,
      (selected) => {
        if (selected.onSelect) selected.onSelect();
      }
    );
  }, 50);
};
