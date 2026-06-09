// src/core/extensionAPI/modules/window/toastAPI.ts

import { useToastStore } from '@/store/toastStore';

export const createToastAPI = (extId: string) => {
  
  const showToast = (message: string, options: any = {}, defaultType: any = 'info') => {
    const store = useToastStore.getState();

    const id = store._add(message, {
      type: options.type || defaultType,
      position: options.position || 'bottom-center',
      duration: options.duration !== undefined ? options.duration : 3000,
      description: options.description,
      icon: options.icon,
      action: options.action,
      // In DOM - "toast-from-code-runner"
      className: options.className ? `${options.className} from-${extId}` : `from-${extId}`,
      style: options.style,
    });

    return {
      id,
      dismiss: () => useToastStore.getState().remove(id)
    };
  };

  return {
    toast: {
      show: (message: string, options?: any) => showToast(message, options, 'default'),
      success: (message: string, options?: any) => showToast(message, options, 'success'),
      error: (message: string, options?: any) => showToast(message, options, 'error'),
      warning: (message: string, options?: any) => showToast(message, options, 'warning'),
      info: (message: string, options?: any) => showToast(message, options, 'info'),
      loading: (message: string, options?: any) => showToast(message, { ...options, duration: 0, icon: options?.icon || 'loading' }, 'default'),
      dismiss: (id: string) => useToastStore.getState().remove(id),
    }
  };
};