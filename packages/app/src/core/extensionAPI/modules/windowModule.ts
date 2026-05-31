// src/core/extensionAPI/modules/windowModule.ts
import { createEditorAPI }       from './window/editorAPI';
import { createOutputAPI }       from './window/outputAPI';
import { createTerminalAPI }     from './window/terminalAPI';
import { createNotificationAPI } from './window/notificationAPI';
import { createFilePickerAPI }   from './window/filePickerAPI';
import { createModalAPI }        from './window/modalAPI';
import { createQuickPickAPI }    from './window/quickPickAPI';
import { createStatusBarAPI }   from './window/statusBarAPI';
import { createActivityBarAPI } from './window/activityBarAPI';
import { createTabAPI }          from './window/tabAPI';
import { fileDecorationsAPI }  from './window/fileDecorationsAPI';
import { createSidebarAPI }      from './window/sidebarAPI';

import { useTreeViewRegistry } from '../registry/treeViewRegistry';
import type { TreeDataProvider } from '../registry/treeViewRegistry';

export const createWindowModule = (extId: string) => {
  const apis = [
    createEditorAPI(),
    createOutputAPI(),
    createTerminalAPI(),
    createNotificationAPI(extId),
    createFilePickerAPI(),
    createModalAPI(),
    createQuickPickAPI(),
    createStatusBarAPI(extId),
    createActivityBarAPI(extId),
    createTabAPI(),
    createSidebarAPI(),
  
    {
      fileDecorations: fileDecorationsAPI,
      createTreeView: (
        viewId: string,
        options: { title: string; treeDataProvider: TreeDataProvider }
      ) => {
        useTreeViewRegistry.getState().register({
          viewId,
          title:    options.title,
          provider: options.treeDataProvider,
        });

        return {
          dispose: () => useTreeViewRegistry.getState().unregister(viewId),
        };
      }
    }
  ];

  const combined = {};
  apis.forEach(api => {
    // Instead of  Spread (...) -> I'm Using defineProperties
    // So that like 'get terminals()''s getter won't destroy
    Object.defineProperties(combined, Object.getOwnPropertyDescriptors(api));
  });

  return combined as any;
};

export type WindowModule = ReturnType<typeof createWindowModule>;