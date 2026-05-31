// src/core/extensionAPI/modules/tasksModule.ts
//
// Background task execution — for extension-defined and user-triggered tasks.
// Git uses GitBackend directly and never goes through this module.

import { taskManager }    from '@/core/extensionAPI/tasks/taskManager';
import { useOutputStore } from '@/features/termis/components/output/store/outputStore';

export const createTasksModule = (extId: string) => ({
  /**
   * Execute a shell command and stream output.
   * `outputChannel: false` → silent (no Output panel, no Tasks panel entry).
   * `outputChannel: string` → mirrored to that channel + listed in Tasks panel.
   */
  execute: (
    cmd:     string,
    cwd:     string,
    onData:  (d: string) => void,
    channel?: string | false,
  ) => taskManager.execute(cmd, cwd, onData, channel ?? false),

  /**
   * Run a command in the background and pipe its output to a named
   * Output Channel (visible in the Termis > Output panel).
   * The task will appear in the Tasks panel.
   *
   * @example
   * mscode.tasks.runInBackground('npm install', {
   *   cwd:           '/sdcard/my-project',
   *   outputChannel: 'npm',
   * });
   */
  runInBackground: (
    command: string,
    options?: { cwd?: string; outputChannel?: string },
  ) => {
    const channel = options?.outputChannel ?? `Task: ${extId}`;

    // Ensure the channel appears in the selector immediately
    useOutputStore.getState().createChannel(channel);

    return taskManager.execute(
      command,
      options?.cwd ?? '/storage/emulated/0',
      () => {},      // onData is a no-op: taskManager mirrors to channel directly
      channel,       // explicit channel → listed in Tasks panel + Output panel
    );
  },
});

export type TasksModule = ReturnType<typeof createTasksModule>;