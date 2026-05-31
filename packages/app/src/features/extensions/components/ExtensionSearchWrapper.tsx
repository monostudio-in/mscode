// src/features/extensions/components/ExtensionSearchWrapper.tsx

import React, { useEffect } from 'react';
import { useExtensionStore } from '../store/extensionStore';
import { ExtensionSearch } from './ExtensionSearch';
// import { useFilePickerStore } from '@/store/filePickerStore';

export const ExtensionSearchWrapper: React.FC = () => {
  const { filter, setFilter, initExtensions } = useExtensionStore();

  useEffect(() => {
    initExtensions();
  }, [initExtensions]);

  // Removed : because Handle the custom event from the *header action*
  // useEffect(() => {
  //   const handleMoreMenu = (ev: Event) => {
  //     const customEvent = ev as CustomEvent;
  //     const mouseEvent = customEvent.detail.e as MouseEvent;
  //     mouseEvent.stopPropagation();
      
  //     const rect = (mouseEvent.currentTarget as HTMLElement).getBoundingClientRect();
  //     const menuItems: MenuItem[] = [
  //       {
  //         id: 'install-local',
  //         label: 'Install .msxt from local...',
  //         icon: 'folder', 
  //         onClick: async () => {
  //           const selectedPath = await useFilePickerStore.getState().showPicker({
  //             mode: 'file', title: 'Select MS Code Extension', buttonText: 'Install', filters: ['.msxt']
  //           });
  //           if (selectedPath) {
  //             if (!selectedPath.toLowerCase().endsWith('.msxt')) alert('Invalid file type!');
  //             else await installLocalExtension(selectedPath);
  //           }
  //         }
  //       },
  //       { type: 'separator', id: 'sep1' },
  //       { id: 'enable-all', label: 'Enable All Extensions', onClick: () => console.log('TODO: Enable all') },
  //       { id: 'disable-all', label: 'Disable All Extensions', onClick: () => console.log('TODO: Disable all') }
  //     ];
  //     openMenu('extensions-more-menu', rect.left - 180, rect.bottom + 8, menuItems);
  //   };

  //   document.addEventListener('ms-open-ext-menu', handleMoreMenu);
  //   return () => document.removeEventListener('ms-open-ext-menu', handleMoreMenu);
  // }, [openMenu, installLocalExtension]);

  return <ExtensionSearch filter={filter} setFilter={setFilter} />;
};
