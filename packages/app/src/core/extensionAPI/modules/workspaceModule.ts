// src/core/extensionAPI/modules/workspaceModule.ts

// Workspace configuration access, state, and history.
import { createConfigurationAPI } from './workspace/configurationAPI';
import { createRecentAPI }        from './workspace/recentAPI';
import { createWorkspaceInfoAPI } from './workspace/workspaceInfoAPI';

export const createWorkspaceModule = (extId: string) => ({
  ...createConfigurationAPI(extId),
  ...createRecentAPI(),   
  ...createWorkspaceInfoAPI(),
});

export type WorkspaceModule = ReturnType<typeof createWorkspaceModule>;