// src/core/extensionAPI/registry/commandRegistry.ts
//
// ═══════════════════════════════════════════════════════════════════════════════
// COMMAND REGISTRY — API REFERENCE
// ═══════════════════════════════════════════════════════════════════════════════
//
// The central nervous system of the editor. Every action — keybindings, palette,
// context menus, extensions, Monaco bridge — routes through here.
//
// ── Quick Reference ───────────────────────────────────────────────────────────
//
//   commands.registerCommand(id, handler, meta?)   Register a command
//   commands.executeCommand(id, ...args)            Execute a command
//   commands.hasCommand(id)                         Check if registered
//   commands.getCommand(id)                         Get full descriptor
//   commands.getCommandsForPalette()                Palette-visible commands
//   commands.getAllCommands()                        All registered commands
//   commands.unregisterCommand(id)                  Remove by id
//   commands.setActiveEditor(editor)                Set focused Monaco instance
//   commands.getActiveEditor()                      Get focused Monaco instance
//
// ─────────────────────────────────────────────────────────────────────────────


// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Any function that handles a command invocation.
 * Can be sync or async — `executeCommand` always awaits the return value.
 *
 * @example
 * const handler: CommandHandler = () => console.log('hello');
 * const asyncHandler: CommandHandler = async (filePath: string) => {
 *   await fs.writeFile(filePath, '');
 * };
 */
export type CommandHandler = (...args: any[]) => any;


/**
 * Metadata that describes a command.
 * Commands with a `title` appear in the Command Palette.
 * Commands without `title` are internal — invokable but not listed.
 *
 * @example
 * const meta: CommandMeta = {
 *   id:       'workbench.action.files.save',
 *   title:    'Save File',
 *   category: 'File',
 *   icon:     'save',
 *   shortcut: 'Ctrl+S',   // display-only hint; real binding is in defaultKeybindings.ts
 * };
 */
export interface CommandMeta {
  /**
   * Globally unique dot-separated command identifier.
   * Convention: `<scope>.<domain>.<action>`
   *
   * @example
   * 'workbench.action.files.save'
   * 'editor.action.formatDocument'
   * 'git.commit'
   * 'explorer.newFile'
   */
  id: string;

  /**
   * Human-readable label shown in the Command Palette.
   * Omit to hide the command from the palette (internal/programmatic use only).
   *
   * @example
   * title: 'Save File'
   * title: 'Format Document'
   * title: 'Checkout to...'
   */
  title?: string;

  /**
   * Category prefix displayed before the title in the palette.
   * Results in "Category: Title" format.
   *
   * @example
   * category: 'File'    // → "File: Save File"
   * category: 'Git'     // → "Git: Commit Staged"
   * category: 'Editor'  // → "Editor: Format Document"
   */
  category?: string;

  /**
   * Codicon icon id used in the palette list and menu items.
   *
   * @example
   * icon: 'save'
   * icon: 'git-commit'
   * icon: 'refresh'
   */
  icon?: string;

  /**
   * Keyboard shortcut hint — for display only.
   * The actual binding must be registered in `defaultKeybindings.ts`.
   *
   * @example
   * shortcut: 'Ctrl+S'
   * shortcut: 'Ctrl+Shift+P'
   * shortcut: 'Ctrl+`'
   */
  shortcut?: string;
}


/**
 * Returned by `registerCommand`. Call `dispose()` to unregister the command,
 * e.g. when an extension is unloaded or a panel unmounts.
 *
 * @example
 * const disposable = commands.registerCommand('my.command', handler);
 *
 * // Later — clean up:
 * disposable.dispose();
 *
 * // Or collect multiple disposables:
 * const subs: IDisposable[] = [];
 * subs.push(commands.registerCommand('cmd.a', handlerA));
 * subs.push(commands.registerCommand('cmd.b', handlerB));
 * // On teardown:
 * subs.forEach(d => d.dispose());
 */
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

  /**
   * Store a reference to the currently focused Monaco editor instance.
   * Called by `CodeEditor` on mount and on focus events.
   *
   * This reference is used by `executeCommand` to fall through to Monaco
   * native actions (e.g. `editor.action.formatDocument`) before checking
   * the custom command registry.
   *
   * @param editor  Monaco `IStandaloneCodeEditor` instance, or `null` to clear.
   *
   * @example
   * // Inside CodeEditor.tsx on mount:
   * useEffect(() => {
   *   commands.setActiveEditor(editorRef.current);
   *   return () => commands.setActiveEditor(null);
   * }, []);
   *
   * // On focus gained:
   * editor.onDidFocusEditorText(() => {
   *   commands.setActiveEditor(editor);
   * });
   */
  public setActiveEditor(editor: any) {
    if (editor) {
      console.log(`🧠 [CommandRegistry] Active Editor Set to: ${editor.getModel()?.uri?.path}`);
    }
    this.activeMonacoEditor = editor;
  }

  /**
   * Retrieve the currently focused Monaco editor instance.
   * Returns `null` if no editor is active.
   *
   * @returns The active `IStandaloneCodeEditor`, or `null`.
   *
   * @example
   * const editor = commands.getActiveEditor();
   * if (editor) {
   *   const model = editor.getModel();
   *   console.log('Active file:', model?.uri.path);
   * }
   *
   * // Trigger a Monaco action on the active editor:
   * commands.getActiveEditor()?.trigger('api', 'editor.action.formatDocument', null);
   */
  public getActiveEditor() {
    console.log(`🧠 [CommandRegistry] getActiveEditor called! Returning: ${this.activeMonacoEditor?.getModel()?.uri?.path}`);
    return this.activeMonacoEditor;
  }


  // ── registerCommand ─────────────────────────────────────────────────────────

  /**
   * Register a command with an id, handler, and optional palette metadata.
   *
   * ── Overload 1 — New style (preferred) ────────────────────────────────────
   *
   * @param id       Unique command id.
   * @param handler  Function to invoke. Sync or async.
   * @param meta     Optional `{ title, category, icon, shortcut }`.
   *                 Provide `title` to make the command appear in the palette.
   * @returns        `IDisposable` — call `.dispose()` to unregister.
   *
   * @example — palette-visible command
   * commands.registerCommand(
   *   'workbench.action.files.save',
   *   async () => {
   *     const { activeTabId } = useTabStore.getState();
   *     if (!activeTabId) return;
   *     await fs.writeFile(activeTabId, getContent());
   *   },
   *   { title: 'Save File', category: 'File', icon: 'save', shortcut: 'Ctrl+S' }
   * );
   *
   * @example — internal command (hidden from palette)
   * commands.registerCommand(
   *   'internal.focusSidebar',
   *   () => useSidebarStore.getState().focus(),
   *   // no meta → not in palette
   * );
   *
   * @example — command with arguments
   * commands.registerCommand(
   *   'explorer.openFile',
   *   (filePath: string) => useTabStore.getState().addTab({ id: filePath, type: 'code', title: filePath.split('/').pop()! }),
   *   { title: 'Open File', category: 'Explorer', icon: 'file' }
   * );
   * // Invoke with args:
   * await commands.executeCommand('explorer.openFile', '/sdcard/project/index.ts');
   *
   * @example — async with cleanup
   * const disposable = commands.registerCommand(
   *   'git.refresh',
   *   () => useGitStore.getState().refresh(),
   *   { title: 'Refresh', category: 'Git', icon: 'refresh' }
   * );
   * // On extension teardown:
   * disposable.dispose();
   */
  registerCommand(
    id: string,
    handler: CommandHandler,
    meta?: Omit<CommandMeta, 'id'>
  ): IDisposable;

  /**
   * ── Overload 2 — Legacy style ──────────────────────────────────────────────
   *
   * Pass everything as a single object with an `execute` function.
   * Kept for backward compatibility. New code should use overload 1.
   *
   * @param command  Object with `id`, `execute`, and optional `title`, `category`, `icon`, `shortcut`.
   * @returns        `IDisposable`.
   *
   * @example
   * commands.registerCommand({
   *   id:       'ms.editor.format',
   *   title:    'Format Document',
   *   category: 'Editor',
   *   icon:     'paint-board',
   *   execute:  (editor?: any) =>
   *     editor?.trigger('api', 'editor.action.formatDocument', null),
   * });
   */
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

  /**
   * Execute a registered command by id.
   *
   * Resolution order:
   *   1. If the active Monaco editor has a native action matching `id`
   *      (e.g. `editor.action.formatDocument`) → runs the Monaco action directly.
   *   2. Otherwise → looks up the custom command registry and calls the handler.
   *   3. If neither — logs a warning and returns `undefined`.
   *
   * Always returns a `Promise` regardless of whether the handler is sync or async.
   *
   * @param id    Command id.
   * @param args  Optional arguments forwarded to the handler.
   * @returns     `Promise<any>` resolving to the handler's return value.
   *
   * @example — simple invocation
   * await commands.executeCommand('workbench.action.files.save');
   *
   * @example — with arguments
   * await commands.executeCommand('explorer.openFile', '/sdcard/project/main.ts');
   * await commands.executeCommand('git.checkout', 'feature/my-branch');
   *
   * @example — Monaco native action passthrough
   * // 'editor.action.formatDocument' is not registered in the custom registry —
   * // executeCommand detects it as a Monaco native action and delegates to the editor.
   * await commands.executeCommand('editor.action.formatDocument');
   *
   * @example — chaining commands
   * await commands.executeCommand('git.stageAll');
   * await commands.executeCommand('git.commit');
   * await commands.executeCommand('git.push');
   *
   * @example — fire-and-forget (no await needed for non-critical UI commands)
   * commands.executeCommand('workbench.view.explorer');
   * commands.executeCommand('termis.open.terminal');
   */
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

  /**
   * Returns `true` if a command with the given id has been registered.
   * Used by `KeybindingManager` to verify a binding target exists before wiring it.
   *
   * @param id  Command id to check.
   * @returns   `boolean`
   *
   * @example
   * if (commands.hasCommand('git.push')) {
   *   // Safe to bind a keybinding to it
   *   keybindingManager.bind('Ctrl+Shift+G P', 'git.push');
   * }
   *
   * @example — guard before execute
   * if (!commands.hasCommand('lsp.restart')) {
   *   console.warn('LSP restart not available.');
   *   return;
   * }
   * await commands.executeCommand('lsp.restart');
   */
  hasCommand(id: string): boolean {
    return this.commands.has(id);
  }


  // ── getCommand ──────────────────────────────────────────────────────────────

  /**
   * Retrieve the full descriptor (metadata + handler) for a registered command.
   * Returns `undefined` if the command is not registered.
   *
   * @param id  Command id.
   * @returns   `RegisteredCommand | undefined`
   *
   * @example
   * const cmd = commands.getCommand('workbench.action.files.save');
   * if (cmd) {
   *   console.log(cmd.title);    // "Save File"
   *   console.log(cmd.shortcut); // "Ctrl+S"
   *   console.log(cmd.icon);     // "save"
   * }
   *
   * @example — building a custom shortcut display
   * const cmd = commands.getCommand(keybinding.commandId);
   * const label = cmd ? `${cmd.category}: ${cmd.title}` : keybinding.commandId;
   */
  getCommand(id: string): RegisteredCommand | undefined {
    return this.commands.get(id);
  }


  // ── getCommandsForPalette ───────────────────────────────────────────────────

  /**
   * Returns all commands that have a `title` — i.e. those visible in the
   * Command Palette. Commands without a title are excluded.
   *
   * Called by `CommandPalette.tsx` on every keystroke to build the filtered list.
   *
   * @returns  `CommandMeta[]` — id, title, category, icon, shortcut for each.
   *
   * @example
   * const paletteItems = commands.getCommandsForPalette();
   * // [
   * //   { id: 'workbench.action.files.save', title: 'Save File', category: 'File', icon: 'save', shortcut: 'Ctrl+S' },
   * //   { id: 'git.commit',                  title: 'Commit Staged', category: 'Git', icon: 'check' },
   * //   ...
   * // ]
   *
   * @example — building palette list items
   * const items = commands.getCommandsForPalette().map(cmd => ({
   *   id:          cmd.id,
   *   label:       cmd.title!,
   *   description: cmd.category,
   *   leftIcon:    cmd.icon,
   *   shortcut:    cmd.shortcut,
   * }));
   */
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

  /**
   * Returns every registered command including internal ones without a `title`.
   * Use `getCommandsForPalette()` for user-facing lists.
   *
   * @returns  `CommandMeta[]`
   *
   * @example
   * // Debug: print every registered command id
   * commands.getAllCommands().forEach(c => console.log(c.id));
   *
   * @example — keybindings settings view: show all commands including internals
   * const all = commands.getAllCommands();
   * const withBindings = all.map(cmd => ({
   *   ...cmd,
   *   binding: keybindingManager.getBinding(cmd.id) ?? '—',
   * }));
   */
  getAllCommands(): CommandMeta[] {
    return Array.from(this.commands.values());
  }


  // ── unregisterCommand ───────────────────────────────────────────────────────

  /**
   * Remove a command from the registry by id.
   * Prefer the `IDisposable` pattern returned by `registerCommand` — it does
   * exactly this and integrates cleanly with React `useEffect` cleanup.
   *
   * @param id  Command id to remove.
   *
   * @example
   * // Direct removal
   * commands.unregisterCommand('my.extension.action');
   *
   * @example — preferred: disposable pattern
   * useEffect(() => {
   *   const d = commands.registerCommand('editor.myAction', handler);
   *   return () => d.dispose();   // auto-cleanup on unmount
   * }, []);
   */
  unregisterCommand(id: string): void {
    this.commands.delete(id);
  }
}


// ─── Global singleton ─────────────────────────────────────────────────────────

/**
 * The global `commands` singleton — import this everywhere.
 *
 * @example
 * import { commands } from '@/core/extensionAPI/registry/commandRegistry';
 *
 * // Register
 * commands.registerCommand('my.action', () => doSomething(), { title: 'My Action', category: 'My Ext' });
 *
 * // Execute
 * await commands.executeCommand('my.action');
 *
 * // Execute with args
 * await commands.executeCommand('explorer.openFile', '/sdcard/project/index.ts');
 */
export const commands = new CommandRegistry();


// ─── Naming Convention ────────────────────────────────────────────────────────
//
//  Scope            Prefix                     Examples
//  ───────────────  ─────────────────────────  ──────────────────────────────────────
//  Workbench        workbench.action.*          workbench.action.files.save
//                   workbench.view.*            workbench.view.explorer
//  Editor           editor.action.*             editor.action.formatDocument
//  Explorer         explorer.*                  explorer.newFile, explorer.collapseAll
//  Git              git.*                       git.commit, git.push, git.checkout
//  GitHub           github.*                    github.signIn, github.signOut
//  Terminal/Termis  termis.*                    termis.open.terminal, termis.open.output
//  Extensions       <extId>.*                   prettier.format, eslint.fixAll
//  LSP              lsp.*                       lsp.restart, lsp.showReferences
//  Settings         workbench.action.open*      workbench.action.openSettings
//
// ─── Reserved Prefixes ────────────────────────────────────────────────────────
//
//  DO NOT use `ms.*` for new commands — reserved for legacy Monaco bridge stubs.
//  DO NOT use numeric or uppercase characters in ids — use kebab-case segments.
//
// ─── Common Command IDs ───────────────────────────────────────────────────────
//
//  ID                                           Registered by
//  ──────────────────────────────────────────   ────────────────────────────────
//  workbench.action.files.save                  CodeEditor
//  workbench.action.files.openFolder            actionsRegistration
//  workbench.action.closeFolder                 actionsRegistration
//  workbench.action.openSettings                actionsRegistration
//  workbench.action.showCommands                actionsRegistration
//  editor.action.formatDocument                 Monaco native (passthrough)
//  editor.action.quickFix                       Monaco native (passthrough)
//  explorer.newFile                             bootstrapExplorer
//  explorer.newFolder                           bootstrapExplorer
//  explorer.collapseAll                         bootstrapExplorer
//  workbench.files.action.refreshFilesExplorer  bootstrapExplorer
//  git.refresh                                  bootstrapGit
//  git.commit                                   bootstrapGit
//  git.push                                     bootstrapGit
//  git.pull                                     bootstrapGit
//  git.fetch                                    bootstrapGit
//  git.checkout                                 bootstrapGit
//  git.clone                                    bootstrapGit
//  git.init                                     bootstrapGit
//  git.showOutput                               bootstrapGit
//  github.signIn                                bootstrapGit
//  github.signOut                               bootstrapGit
//  termis.open.terminal                         TermisPanel
//  termis.open.output                           TermisPanel