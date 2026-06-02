// src/core/extensionAPI/registry/commandRegistry.ts

// ─── Types ────────────────────────────────────────────────────────────────────

export type CommandHandler = (...args: any[]) => any;


export interface CommandMeta {
  id: string;

  title?: string;

  category?: string;

  icon?: string;

  shortcut?: string;
}


export interface IDisposable {
  dispose(): void;
}

interface RegisteredCommand extends CommandMeta {
  handler: CommandHandler;
}


// ─── CommandRegistry class ────────────────────────────────────────────────────

class CommandRegistry {
  
  private commands = new Map<string, RegisteredCommand>();
  
  // Global active editor tracker for falling back to Monaco native actions
  private activeMonacoEditor: any = null;

  // ── Active Monaco editor ────────────────────────────────────────────────────

  public setActiveEditor(editor: any) {
    if (editor) {
      // console.log(`[CommandRegistry] Active Editor Set to: ${editor.getModel()?.uri?.path}`);
    }
    this.activeMonacoEditor = editor;
  }

  public getActiveEditor() {
    // console.log(` [CommandRegistry] getActiveEditor called! Returning: ${this.activeMonacoEditor?.getModel()?.uri?.path}`);
    return this.activeMonacoEditor;
  }


  // ── registerCommand ─────────────────────────────────────────────────────────

  registerCommand(
    id: string,
    handler: CommandHandler,
    meta?: Omit<CommandMeta, 'id'>
  ): IDisposable;

  registerCommand(command: CommandMeta & { execute: CommandHandler }): IDisposable;

  // Implementation signature (not part of public API docs)
  registerCommand(
    idOrCommand: string | (CommandMeta & { execute: CommandHandler }),
    handler?: CommandHandler,
    meta?: Omit<CommandMeta, 'id'>
  ): IDisposable {
    let id: string;
    let fn: CommandHandler;
    let m: Omit<CommandMeta, 'id'> | undefined;

    if (typeof idOrCommand === 'string') {
      // New-style: registerCommand(id, handler, meta?)
      id = idOrCommand;
      fn = handler!;
      m  = meta;
    } else {
      // Legacy-style: registerCommand({ id, title, execute, ... })
      const { execute, ...rest } = idOrCommand;
      id = rest.id;
      fn = execute;
      m  = {
        title:    rest.title,
        category: rest.category,
        icon:     rest.icon,
        shortcut: rest.shortcut,
      };
    }

    if (this.commands.has(id)) {
      // Silent overwrite — Monaco bridge registers many commands; warn only in dev
      if (import.meta.env.DEV) {
        // console.warn(`[CommandRegistry] Overwriting command: ${id}`);
      }
    }

    this.commands.set(id, { id, handler: fn, ...m });

    // Return a disposable so the caller can clean up on extension unload
    return { dispose: () => this.commands.delete(id) };
  }


  // ── executeCommand ──────────────────────────────────────────────────────────

  async executeCommand(id: string, ...args: any[]): Promise<any> {
    
    // CLOSURE TRAP BYPASS
    const targetEditor = (args[0] && typeof args[0].getAction === 'function') ? args[0] : this.activeMonacoEditor;
    
    // 1. First checking is this monaco native actions or not  (like: actions.find)
    // -> If this is native monaco actions : then remove old command and run directly with editor 
    if (targetEditor) {
      const action = targetEditor.getAction(id);
      if (action) {
        targetEditor.focus();
        return await Promise.resolve(action.run()); 
      }
    }

    // 2. If non monaco commands like : workbench.action...
    const cmd = this.commands.get(id);
    if (cmd) {
      return await Promise.resolve(cmd.handler(...args));
    }

    console.warn(`[CommandRegistry] Command not found: '${id}'`);
  }


  // ── hasCommand ──────────────────────────────────────────────────────────────
  hasCommand(id: string): boolean {
    return this.commands.has(id);
  }


  // ── getCommand ──────────────────────────────────────────────────────────────

  getCommand(id: string): RegisteredCommand | undefined {
    return this.commands.get(id);
  }


  // ── getCommandsForPalette ───────────────────────────────────────────────────

  getCommandsForPalette(): CommandMeta[] {
    const list: CommandMeta[] = [];
    this.commands.forEach(cmd => {
      if (cmd.title) {
        list.push({
          id:       cmd.id,
          title:    cmd.title,
          category: cmd.category,
          icon:     cmd.icon,
          shortcut: cmd.shortcut,
        });
      }
    });
    return list;
  }


  // ── getAllCommands ──────────────────────────────────────────────────────────

  getAllCommands(): CommandMeta[] {
    return Array.from(this.commands.values());
  }


  // ── unregisterCommand ───────────────────────────────────────────────────────

  unregisterCommand(id: string): void {
    this.commands.delete(id);
  }
}


// ─── Global singleton ─────────────────────────────────────────────────────────
export const commands = new CommandRegistry();