// src/features/extensions/extensionsBootstrap.ts

import { sidebarRegistry } from '@/core/extensionAPI/registry/sidebarRegistry';
import { useExtensionStore } from './store/extensionStore';
import { useFilePickerStore } from '@/store/filePickerStore';
import { MarketplaceSection } from './components/MarketplaceSection';
import { InstalledSection } from './components/InstalledSection';
import { ExtensionSearchWrapper } from './components/ExtensionSearchWrapper';
import { useThemeStore } from '@/core/theme/store/themeStore';
import './ExtensionsPanel.css';

export function bootstrapExtensions() {
  sidebarRegistry.registerPanel({
    activityBarId: 'extensions',
    
    header: {
      title: 'Extensions',
      maxOverflow: 0,
      actions: [
        {
          id: 'refresh-ext', 
          icon: 'refresh', 
          label: 'Check for Updates', 
          order:0,
          onClick: () => useExtensionStore.getState().fetchMarketplace(0, true) 
        },
        { type: 'separator', id: 'sep-1' },
        {
          id: 'install-local',
          label: 'Install from msxt/zip',
          icon: 'folder', 
          order:2,
          onClick: async () => {
            const selectedPath = await useFilePickerStore.getState().showPicker({
              mode: 'file', title: 'Select MS Code Extension', buttonText: 'Install', filters: [{ label: 'Extension Packages', extensions: ['msxt', 'zip'] }]
            });
            if (selectedPath) {
              if (!selectedPath.toLowerCase().endsWith('.msxt')) alert('Invalid file type!');
              else await useExtensionStore.getState().installLocalExtension(selectedPath);
            }
          }
        },
        { type: 'separator', id: 'sep-2' , order: 4},
        {
          id: 'link-local',
          label: 'Link Local Extension',
          icon: 'vm-connect',
          order: 3,
          onClick: async () => {
            const selectedPath = await useFilePickerStore.getState().showPicker({
              mode: 'folder', 
              title: 'Select Extension Folder', 
              buttonText: 'Link' , 
              requiredFiles: ['manifest.json', 'manifest.jsonc']
            });
            if (selectedPath) {
              await useExtensionStore.getState().linkLocalExtension(selectedPath);
            }
          }
        },
        {
          id: 'manage-extensions',
          label: 'Manage',
          order:1,
          icon: 'symbol-property',
          children: [
            { id: 'enable-all', label: 'Enable All Extensions', onClick: () => console.log('Enabled all') },
            { id: 'disable-all', label: 'Disable All Extensions', onClick: () => console.log('Disabled all') }
          ]
        },
        {
          id: 'refresh-ext-local', 
          icon: 'refresh', 
          label: 'Reload Linked Extensions', 
          order: 4,
          onClick: async () => {
            useThemeStore.getState().sync(); 
            console.log('Linked extensions and themes reloaded!');
          } 
        }
      ],
    },
    
    sections: [
      {
        id: 'ext-search',
        title: '', // Title = ""  =>  Behave as block 
        content: ExtensionSearchWrapper,
        hidden: false,
        defaultExpanded: true,
      },
      {
        id: 'ext-marketplace',
        title: 'EXTENSIONS STORE',
        content: MarketplaceSection,
        fillHeight: true,
        scrollX: false,
        sticky: true,
        stickyTop: 0,
        stickyZIndex: 40,
        defaultHeight: 400,
        defaultExpanded: false,
        actions: [
          { id: 'sort-popular', icon: 'sort-precedence', label: 'Sort by Popularity' }
        ]
      },
      {
        id: 'ext-installed',
        title: 'INSTALLED',
        content: InstalledSection,
        defaultExpanded: true,
        defaultHeight: 100,
        minHeight: 80,
      },
    ],
  });
}