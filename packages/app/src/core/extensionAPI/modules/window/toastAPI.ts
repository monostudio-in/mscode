// src/core/extensionAPI/modules/window/toastAPI.ts

import { useToastStore } from '@/store/toastStore';

export const createToastAPI = (extId: string) => {
  const store = useToastStore.getState();

  const showToast = (message: string, options: any = {}, defaultType = 'info') => {
    
    const id = store._add(message, {
      type: options.type || defaultType,
      description: options.description,
      position: options.position || 'bottom-center',
      icon: options.icon,
      duration: options.duration !== undefined ? options.duration : 3000,
      action: options.action,
      className: options.className,
      style: options.style,
    });

    // Return a controller object so developers can programmatically dismiss it
    return {
      id,
      dismiss: () => store.remove(id)
    };
  };

  return {
    toast: {
      /** Show a generic toast */
      show: (message: string, options?: any) => showToast(message, options, 'info'),
      
      /** Show a success toast */
      success: (message: string, options?: any) => showToast(message, options, 'success'),
      
      /** Show an error toast */
      error: (message: string, options?: any) => showToast(message, options, 'error'),
      
      /** Show a warning toast */
      warning: (message: string, options?: any) => showToast(message, options, 'warning'),
      
      /** Show an info toast */
      info: (message: string, options?: any) => showToast(message, options, 'info'),
      
      /** Show a loading toast (usually permanent until dismissed) */
      loading: (message: string, options?: any) => showToast(message, { duration: 0, ...options }, 'default'),
      
      /** Dismiss a specific toast by ID */
      dismiss: (id: string) => store.remove(id),
    }
  };
};