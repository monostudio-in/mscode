// src/core/extensionAPI/modules/workspaceModule.ts

// Workspace configuration access, state, and history.
import { createConfigurationAPI } from './workspace/configurationAPI';
import { createRecentAPI }        from './workspace/recentAPI';
import { createWorkspaceAPI } from './workspace/workspaceAPI';

export const createWorkspaceModule = (extId: string) => ({
  ...createConfigurationAPI(extId),
  ...createRecentAPI(),   
  ...createWorkspaceAPI(),
});

export type WorkspaceModule = ReturnType<typeof createWorkspaceModule>;