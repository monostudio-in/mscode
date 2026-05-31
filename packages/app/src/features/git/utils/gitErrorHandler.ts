// src/features/git/utils/gitErrorHandler.ts

import { showGitAuthMenu } from './gitAuthMenu';
import { useNotificationStore } from '@/store/notificationStore';

export const handleGitAuthErrors = (error: any, fallbackTitle: string = 'Git Error') => {
  const errorMsg = error?.message || error?.toString() || '';

  // ── 1. Author Identity Missing (Commit Error) ──
  if (
    errorMsg.includes('user.name') || 
    errorMsg.includes('user.email') || 
    errorMsg.includes('Author identity unknown') ||
    errorMsg.includes('tell me who you are')
  ) {
    showGitAuthMenu(
      'Commit Failed',
      'Git user.name and user.email must be set. Sign in to GitHub to set them automatically.'
    );
    return true; // Error Handled
  }

  // ── 2. Authentication Failed (Push/Pull/Fetch Error) ──
  if (
    errorMsg.includes('Authentication failed') || 
    errorMsg.includes('could not read Username') ||
    errorMsg.includes('Invalid credentials') ||
    errorMsg.includes('401') || 
    errorMsg.includes('403')
  ) {
    showGitAuthMenu(
      'Authentication Required',
      'GitHub Authentication failed. Please sign in or provide a valid PAT.'
    );
    return true; // Error Handled
  }

  // ── 3. Normal Errors (Fallbacks) ──
  useNotificationStore.getState().addNotification({
    type: 'error',
    title: fallbackTitle,
    source: 'Git',
    message: errorMsg
  });
  
  return false; // Not an Auth Error
};