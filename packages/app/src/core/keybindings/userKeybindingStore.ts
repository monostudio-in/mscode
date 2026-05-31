// src/core/keybindings/userKeybindingStore.ts

import { loadUserKeybindingsText, saveUserKeybindingsText } from '../services/storageService';
import { keybindingManager, type Keybinding } from './keybindingManager';
import { defaultKeybindings } from './defaultKeybindings';

/**
 * Strips both single-line (//) and multi-line (/* *\/) comment markers out of raw text streams.
 * Allows configuration assets to be safely specified using human-readable JSONC formats.
 * 
 * @param text Raw content string read from underlying persistence layers.
 */
const parseJSONC = (text: string): Keybinding[] => {
  try {
    const cleanText = text.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
    return JSON.parse(cleanText);
  } catch (e) {
    console.error('[KeybindingStore] Failed to parse keybindings.json. Falling back to empty layout []', e);
    return [];
  }
};

/**
 * UserKeybindingStore Subsystem Engine
 * Manages user-defined custom key macro adjustments and serialization pipelines.
 * Synchronizes file modifications dynamically back into running environment engines.
 */
class UserKeybindingStore {
  /** Internal context cache tracking processed user key configuration records */
  private userKeybindings: Keybinding[] = [];
  /** Unparsed string payload mirroring the exact status of files on disk slots */
  private rawText: string = '[]';

  /**
   * Initializes state by fetching stored shortcut profiles from peripheral storage.
   * Creates a structured stub file if no existing definitions are discovered.
   */
  public async initialize(): Promise<void> {
    const text = await loadUserKeybindingsText();
    
    if (text) {
      this.rawText = text;
      this.userKeybindings = parseJSONC(text);
    } else {
      // Establish an annotated file blueprint on fresh deployments
      this.rawText = '[\n  // Place your key bindings in this file to override the defaults\n]';
      await saveUserKeybindingsText(this.rawText);
    }

    this.syncToManager();
    console.log('[KeybindingStore] User keybindings loaded and synchronized successfully.');
  }

  public getUserKeybindings(): Keybinding[] {
    return this.userKeybindings;
  }

  public getRawText(): string {
    return this.rawText;
  }

  /**
   * Re-evaluates configurations and persists changes following manual text adjustments.
   * Instantly refreshes runtime managers without requiring application recycling.
   * 
   * @param text Validated JSON/JSONC structural text configuration string.
   */
  public async saveRawText(text: string): Promise<void> {
    this.rawText = text;
    this.userKeybindings = parseJSONC(text);
    
    await saveUserKeybindingsText(text);
    this.syncToManager();
  }

  /**
   * Chains framework default parameters alongside localized personalization matrices, 
   * re-seeding active shortcut execution hierarchies.
   */
  private syncToManager(): void {
    keybindingManager.loadKeybindings(defaultKeybindings, this.userKeybindings);
  }
  
  /**
   * Updates or appends a specific shortcut configuration directly from higher-level visual menus.
   * Generates formatted string outputs preserving document layout spacing structures.
   * 
   * @param commandId Target framework destination identity mapping target processes.
   * @param newKey Standardized chord macro shortcut definition sequence.
   * @param when Conditional execution criteria statement rule context.
   */
  public async updateKeybinding(commandId: string, newKey: string, when?: string): Promise<void> {
    const currentBindings = [...this.userKeybindings];
    const existingIndex = currentBindings.findIndex(kb => kb.command === commandId);

    if (existingIndex >= 0) {
      currentBindings[existingIndex] = { ...currentBindings[existingIndex], key: newKey, when };
    } else {
      currentBindings.push({ command: commandId, key: newKey, when });
    }

    // Compile pretty-printed file entries mapping to canonical JSON specifications
    const jsonString = `[\n  // User custom keybindings\n` + 
      currentBindings.map(kb => `  ${JSON.stringify(kb)}`).join(',\n') + 
    `\n]`;

    await this.saveRawText(jsonString);
  }
}

/**
 * Shared central singleton engine managing user preference file streams and 
 * macro overriding persistence layers.
 */
export const userKeybindingStore = new UserKeybindingStore();
