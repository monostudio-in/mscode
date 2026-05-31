// src/features/git/gitAccess.ts

import { useGithubAuthStore } from '@/store/githubAuthStore';

// Built-in Mono Studio Git extension registry identifiers
const GIT_EXT_ID = 'mscode.git';
const GIT_EXT_NAME = 'MSCode : Source Control';

/**
 * ─── Centralized Access Manager for Git ─────────────────────────────────────
 * Treats the built-in Git feature as a standard extension that must request
 * explicit security clearance and session state from the global Gatekeeper.
 */
export const gitAccess = {
  
  /**
   * Requests the GitHub access token. If application permissions are missing,
   * it prompts the user to review and grant extension access permissions.
   * @returns {Promise<string | null>} The active access token string, or null if denied.
   */
  requestToken: async (): Promise<string | null> => {
    return await useGithubAuthStore.getState().requestToken(GIT_EXT_ID, GIT_EXT_NAME);
  },

  /**
   * Checks if the user has explicitly granted permissions to this Git extension.
   * Performs a silent state check without triggering visual UI prompts.
   * @returns {boolean} True if authenticated and access is explicitly granted.
   */
  isGranted: (): boolean => {
    const { isAuthenticated, trustedExtensions } = useGithubAuthStore.getState();
    return isAuthenticated && trustedExtensions[GIT_EXT_ID]?.granted === true;
  },

  /**
   * Verifies if a global GitHub session is currently authenticated.
   * Used primarily for managing local fallback configurations.
   * @returns {boolean} True if globally authenticated.
   */
  isGloballyAuthenticated: (): boolean => {
    return useGithubAuthStore.getState().isAuthenticated;
  },

  /**
   * Retrieves the authenticated GitHub user profile metadata,
   * strictly filtering out data payloads if extension authorization is missing.
   * @returns {any | null} User account details payload, or null if unauthorized.
   */
  getUser: () => {
    const state = useGithubAuthStore.getState();
    return gitAccess.isGranted() ? state.user : null;
  }
};
