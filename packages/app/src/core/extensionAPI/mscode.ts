// src/core/extensionAPI/mscode.ts

import { createLspModule }       from './modules/lspModule';
import { createCommandsModule }  from './modules/commandsModule';
import { createWorkspaceModule } from './modules/workspaceModule';
import { createTasksModule }     from './modules/tasksModule';
import { createTermisModule }    from './modules/termisModule';
import { createWindowModule }    from './modules/windowModule';
import { createLanguagesModule } from './modules/languagesModule';
import { createMenusModule }     from './modules/menusModule';
import { createSearchModule }    from './modules/searchModule';
import { createThemesModule }    from './modules/themesModule';
import { createUIModule }        from './modules/uiModule';
import { createAuthenticationModule } from './modules/authenticationModule';
import { createExtensionsModule }     from './modules/extensionsModule';
import { createGitModule } from './modules/gitModule';
import { createFilesystemModule } from './modules/filesystemModule';
import { createAppModule } from './modules/appModule';


export interface Disposable {
    dispose(): any;
}

export interface ExtensionContext {
    /**
     * An array to which disposables can be added. When this extension is deactivated,
     * the disposables will be disposed of automatically.
     */
    subscriptions: Disposable[];
    
    /**
     * The unique identifier of the extension.
     */
    extensionId: string;
    
    /**
     * The absolute path of the extension's directory.
     */
    extensionPath: string;
    
    extension: {
        id: string;
        extensionPath: string;
        manifestJSON: any;
        isActive: boolean;
    };
}

export const createMSCodeAPI = (extId: string) => ({
  
  app: createAppModule(extId),
  
  /**
   * LSP server registration.
   * Register language servers so the editor can provide
   * completions, hover, diagnostics, etc. for your language.
   */
  lsp: createLspModule(extId),

  /**
   * Command palette integration.
   * Register & execute commands; users can invoke them via the palette.
   */
  commands: createCommandsModule(extId),
  
  /**
   * Workspace configuration.
   * Read user settings and contribute your extension's setting schema.
   */
  workspace: createWorkspaceModule(extId),

  /**
   * Background task execution.
   * Run shell commands and stream output to the Output panel.
   */
  tasks: createTasksModule(extId),

  /**
   * Termis panel control.
   * Open/close the terminal panel and switch between terminal, output,
   * and problems views.
   */
  termis: createTermisModule(extId),
  
  /**
   * Window UI.
   * Notifications, output channels, terminal creation and management.
   */
  window: createWindowModule(extId),
  
  /**
   * Themes
   */
  themes: createThemesModule(extId) ,

  /**
   * Language feature contributions.
   * Snippets (and future: formatters, code-lens providers, etc.)
   */
  languages: createLanguagesModule(extId),

  /**
   * Dynamic menu contributions.
   * Add context menu items, toolbar buttons, etc.
   */
  menus: createMenusModule(extId),

  /**
   * Search & Replace API.
   *
   * HIGH-LEVEL (UI-integrated):
   *   findInFiles / replaceInFiles / getResults / clearResults
   *   → Results appear in the Search Panel sidebar.
   *
   * LOW-LEVEL (silent / background):
   *   search()
   *   → Calls the native engine directly; Search Panel is untouched.
   *   → Ideal for "find all references", rename preview, analysis tools.
   *
   * @example
   * // Show results in sidebar
   * const files = await mscode.search.findInFiles({ query: 'TODO', includes: ['*.ts'] });
   *
   * // Silent background search
   * const refs = await mscode.search.search({ query: 'myFunction', useRegex: false });
   */
  search: createSearchModule(extId),
  
  /**
   * Native UI Toolkit
   * Exposes MS Code's core React components (Collapsible, Button, Icon, etc.)
   * so extensions can render seamlessly integrated custom views.
   */
  ui: createUIModule(extId),
  
  /**
   * Authentication API
   * Allows extensions to securely request GitHub access tokens.
   * Prompts the user for permission if not already granted.
   */
  authentication: createAuthenticationModule(extId),
  
  
  git: createGitModule(extId),
  
  /**
   * Extensions ecosystem API.
   * Query installed extensions, check active states, or programmatically 
   * route users to the marketplace.
   */
  extensions: createExtensionsModule(extId),
  
  fs: createFilesystemModule(extId)
  
});

export type MSCodeAPI = ReturnType<typeof createMSCodeAPI>;