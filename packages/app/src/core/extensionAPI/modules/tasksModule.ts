// src/core/extensionAPI/modules/tasksModule.ts

import { taskManager } from '@/core/extensionAPI/tasks/taskManager';
import { useOutputStore } from '@/features/termis/components/output/store/outputStore';
import { useExplorerStore } from '@/features/explorer/store/exploreStore';

export const createTasksModule = (extId: string) => ({
  
  execute: (
    cmd: string,
    cwd: string,
    onData: (d: string) => void,
    channel?: string | false
  ) => {
    const { result, kill } = taskManager.execute(cmd, cwd, onData, channel ?? false);
    return { command: cmd, result, terminate: kill };
  },

  runInBackground: (
    command: string,
    options?: { cwd?: string; outputChannel?: string }
  ) => {
    const channel = options?.outputChannel ?? `Task: ${extId}`;

    useOutputStore.getState().createChannel(channel);

    // Dynamic fallback to actual Workspace Root
    const fallbackCwd = useExplorerStore.getState().workspacePath || '/';

    const { result, kill } = taskManager.execute(
      command,
      options?.cwd ?? fallbackCwd,
      () => {}, 
      channel
    );

    // Return standard TaskExecution object
    return { command, result, terminate: kill };
  },
});

export type TasksModule = ReturnType<typeof createTasksModule>;