// src/features/explorer/Explorer.tsx

import React from 'react';
import { useActivityBarStore }  from '@/store/activityBarStore';
import { sidebarRegistry }      from '@/core/extensionAPI/registry/sidebarRegistry';
import { commands }             from '@/core/extensionAPI/registry/commandRegistry';
import { useExplorerStore }     from '@/features/explorer/store/exploreStore';
import { contextKeyService }    from '@/core/keybindings/contextKeyService';
import { useTreeViewRegistry }  from '@/core/extensionAPI/registry/treeViewRegistry';

import { FileTree }             from './components/FileTree/FileTree';
import { SymbolsPanel }         from './components/Symbols/SymbolsPanel';
import { GenericTreeView }      from './components/GenericTreeView/GenericTreeView';

export function bootstrapExplorer() {
  
  const { registerItem } = useActivityBarStore.getState();
  
  registerItem({
    id: 'explorer', 
    icon: 'files', 
    label: 'Explorer',
    priority: 10, 
    position: 'top',
    openSidebarContent: true,
  });

  sidebarRegistry.registerPanel({
    activityBarId: 'explorer',
    
    // ─── Main Explorer Header ───
    header: {
      title: 'Explorer',
      maxOverflow: 0, 
      actions: [
        {
          id: 'explorer-views-container',
          label: 'Views', // Label exists, so external extensions can target it!
          flat: 1,        // it flattens itself 
          // children: [
          //   {
          //     id: 'show-explorer-settings',
          //     icon: 'settings', 
          //     label: 'Show Explorer Settings', 
          //     onClick: () => console.log('Explorer Settings Clicked!'),
          //     order: 2 // Pushed below the togglers
          //   },
          // ],
          views: [
            {
              id: 'toggle-explorer-sections',
              packIn: null, // Flat option
              order: 0,     // Toggler options go to the top
              children: [
                {
                  id: 'files',
                  label: 'Files',
                  disabled: true, // Forcefully disabled/faded
                },
                {
                  id: 'symbols',
                  label: 'My Outline', // Enhanced name override
                },
                {
                  id: 'timeline',
                  // keep: false, // Timeline toggler hidden completely
                },
                { type: 'separator', id: 'explorer-toggler-sep-1', order: 1 } 
              ]
            }
          ]
        }
      ],
    },

    // ─── Individual Sections ───
    sections: [
    // File Tree 
      {
        id: 'files',
        title: 'Files',
        content: FileTree,
        fillHeight: true,
        defaultHeight:300,
        scrollX: true,
        sticky: true,
        stickyTop: 0,
        stickyZIndex: 40,
        defaultExpanded: true,
        maxOverflow: 4, 
        actions: [
          {
            id:      'explorer-new-file',
            label:   'New File...',
            icon:    'new-file',
            when:    'workspacePath != null',
            onClick: () => commands.executeCommand('explorer.newFile'),
          },
          {
            id:      'explorer-new-folder',
            label:   'New Folder...',
            icon:    'new-folder',
            when:    'workspacePath != null',
            onClick: () => commands.executeCommand('explorer.newFolder'),
          },
          {
            id:      'explorer-refresh',
            label:   'Refresh Explorer',
            icon:    'refresh',
            when:    'workspacePath != null',
            onClick: () => commands.executeCommand('workbench.files.action.refreshFilesExplorer'),
          },
          {
            id:      'explorer-collapse-all',
            label:   'Collapse All',
            icon:    'collapse-all',
            when:    'workspacePath != null',
            onClick: () => commands.executeCommand('explorer.collapseAll'),
          },
          { type: 'separator', id: 'files-sep' },
          {
            id:      'files-open-folder',
            label:   'Open Folder...',
            onClick: () => commands.executeCommand('workbench.action.files.openFolder'),
          },
          {
            id:      'files-close-folder',
            label:   'Close Folder',
            when:    'workspacePath != null',
            onClick: () => commands.executeCommand('workbench.action.closeFolder'),
          }
        ]
      },
    
    // Outlines 
      {
        id: 'symbols',
        title: 'Outline',
        content: SymbolsPanel,
        defaultExpanded: false,
        defaultHeight: 280,
        minHeight: 50,
        actions: [
          { id: 'symbols-refresh', icon: 'refresh', label: 'Refresh Symbols' }
        ],
      },
      
    // Timeline 
      {
        id: 'timeline',
        title: 'Timeline',
        content: () => React.createElement(
          'div', 
          { style: { padding: '10px 20px', color: 'var(--ms-text-faded)', fontSize: '12px' } }, 
          'No timeline info.'
        ),
        defaultExpanded: false,
        defaultHeight: 80,
        minHeight: 50,
      },
    ],
  });

  useExplorerStore.subscribe((state, prevState) => {
    if (state.workspacePath !== prevState.workspacePath) {
      contextKeyService.setContext('workspacePath', state.workspacePath);
    }
  });
  contextKeyService.setContext('workspacePath', useExplorerStore.getState().workspacePath);

  useTreeViewRegistry.subscribe((state, prevState) => {
    const addedViews = state.views.filter(v => !prevState.views.some(pv => pv.viewId === v.viewId));
    const removedViews = prevState.views.filter(pv => !state.views.some(v => v.viewId === pv.viewId));

    addedViews.forEach(view => {
      sidebarRegistry.addSection('files', {
        id: view.viewId,
        title: view.title,
        content: () => <GenericTreeView provider={view.provider} />,
        defaultExpanded: true,
        defaultHeight: 250,
      });
    });

    removedViews.forEach(view => {
      sidebarRegistry.removeSection('files', view.viewId);
    });
  });
}