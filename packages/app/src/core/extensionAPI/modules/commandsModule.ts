// src/core/extensionAPI/modules/commandsModule.ts

import { commands } from '@/core/extensionAPI/registry/commandRegistry';
import type { CommandMeta, CommandHandler } from '@/core/extensionAPI/registry/commandRegistry';

export const createCommandsModule = (_extId: string) => ({
  /**
   * Register a new command.
   * Supports both simple ID/Handler syntax and full Metadata object syntax.
   */
  registerCommand: (
    idOrCommand: string | (CommandMeta & { execute: CommandHandler }),
    handler?: CommandHandler,
    meta?: Omit<CommandMeta, 'id'>
  ) => {
    if (typeof idOrCommand === 'string') {
      return commands.registerCommand(idOrCommand, handler!, meta);
    } else {
      return commands.registerCommand(idOrCommand);
    }
  },

  /**
   * Programmatically execute a registered command or a native Monaco action.
   */
  executeCommand: <T = any>(id: string, ...args: any[]): Promise<T> => {
    return commands.executeCommand(id, ...args);
  },
});

export type CommandsModule = ReturnType<typeof createCommandsModule>;