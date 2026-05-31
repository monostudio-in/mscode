// src/core/extensionAPI/modules/commandsModule.ts
//
// VS Code-style command palette integration.
// Extensions register commands that users can invoke from the command palette
// or that other extensions can call programmatically.

import { commands } from '@/core/extensionAPI/registry/commandRegistry';

export const createCommandsModule = (_extId: string) => ({
  /**
   * Register a new command.
   * Returns a disposable — call .dispose() in deactivate() to unregister.
   *
   * @example
   * const disposable = mscode.commands.registerCommand('myExt.helloWorld', () => {
   *   mscode.window.showInformationMessage('Hello World!');
   * });
   */
  registerCommand: (id: string, handler: (...args: any[]) => any) => {
    return commands.registerCommand(id, handler);
  },

  /**
   * Programmatically execute a registered command.
   *
   * @example
   * await mscode.commands.executeCommand('editor.action.formatDocument');
   */
  executeCommand: (id: string, ...args: any[]) => {
    return commands.executeCommand(id, ...args);
  },
});

export type CommandsModule = ReturnType<typeof createCommandsModule>;