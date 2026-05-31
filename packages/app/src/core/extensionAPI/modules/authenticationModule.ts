// src/core/extensionAPI/modules/authenticationModule.ts

import { useGithubAuthStore } from '@/store/githubAuthStore';
import { useExtensionStore }  from '@/features/extensions/store/extensionStore'; 
import type { Extension }     from '@/features/extensions/types';

/**
 * Factory function to generate the Authentication API for a specific extension.
 * This module acts as a secure gatekeeper, ensuring extensions cannot silently
 * steal credentials without explicit user consent.
 * * @param extId The unique identifier of the calling extension (e.g., 'publisher.gitlens').
 */
export const createAuthenticationModule = (extId: string) => {
  
  /**
   * Helper function to dynamically retrieve the human-readable name of the extension 
   * from the global extension registry.
   * Falls back to the raw `extId` if the metadata is unavailable.
   */
  const getExtensionName = (): string => {
    const installedExts: Extension[] = useExtensionStore.getState().allExtensions || [];
    const ext = installedExts.find(e => e.id === extId);
    return ext?.name || extId; 
  };

  return {
    /**
     * Requests a GitHub authentication session (Token) for the current user.
     * * **Behavior:**
     * - If the user has already granted access to this extension, it returns the token instantly.
     * - If the user has previously denied access, it returns `null`.
     * - If this is the first time, it suspends execution and prompts the user with a secure dialog:
     * `"Extension [Name] wants to sign in using your GitHub account."`
     * * @returns {Promise<string | null>} The GitHub Personal Access Token (or OAuth token), or `null` if denied/not logged in.
     * * @example
     * ```typescript
     * const token = await mscode.authentication.getSession();
     * * if (token) {
     * // Use the token to fetch private GitHub data
     * const res = await fetch('[https://api.github.com/user/repos](https://api.github.com/user/repos)', {
     * headers: { Authorization: `token ${token}` }
     * });
     * const repos = await res.json();
     * } else {
     * mscode.window.showErrorMessage("GitHub access is required to view Pull Requests.");
     * }
     * ```
     */
    getSession: async (): Promise<string | null> => {
      const extName = getExtensionName();
      return await useGithubAuthStore.getState().requestToken(extId, extName);
    },

    /**
     * Synchronously checks if the extension has already been granted GitHub access.
     * This method is completely silent and will **never** prompt the user.
     * * Useful for checking state during extension activation to toggle UI elements 
     * (e.g., showing a "Sign in" button inside a sidebar view if access is missing).
     * * @returns {boolean} `true` if the user is authenticated globally AND has authorized this extension.
     * * @example
     * ```typescript
     * if (mscode.authentication.hasAccess()) {
     * mscode.menus.registerMenuItem('sidebar/git/actions', { ... });
     * }
     * ```
     */
    hasAccess: (): boolean => {
      const { isAuthenticated, trustedExtensions } = useGithubAuthStore.getState();
      return isAuthenticated && trustedExtensions[extId]?.granted === true;
    },

    /**
     * Retrieves the currently authenticated GitHub user's public profile information.
     * This acts as a convenience method to avoid making a manual `api.github.com/user` fetch.
     * * **Security:** This will return `null` if the extension has not been granted access via `getSession()`,
     * even if the user is logged into the IDE globally.
     * * @returns {Object | null} The user profile object containing `login`, `name`, `email`, and `avatar_url`.
     * * @example
     * ```typescript
     * const user = mscode.authentication.getUser();
     * if (user) {
     * console.log(`Welcome back, ${user.name}! (@${user.login})`);
     * mscode.window.showInformationMessage(`Logged in as ${user.email}`);
     * }
     * ```
     */
    getUser: () => {
      const state = useGithubAuthStore.getState();
      
      // Strict Check: Ensure global auth is active AND this specific extension is trusted
      const accessGranted = state.isAuthenticated && state.trustedExtensions[extId]?.granted === true;
      
      return accessGranted ? state.user : null;
    }
  };
};