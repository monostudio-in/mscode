// src/core/keybindings/keybindingManager.ts

import { contextKeyService } from './contextKeyService';
import { commands } from '../extensionAPI/registry/commandRegistry';

/**
 * Structural definition matching keybinding tracking configurations.
 */
export interface Keybinding {
  /** The compound key macro configuration descriptor sequence (e.g., "ctrl+k ctrl+s"). */
  key: string;
  /** The targeted target framework identity pointer to be processed upon activation. */
  command: string;
  /** Dynamic context criterion matching system status requirements before executing actions. */
  when?: string;
  /** Supplemental contextual payload arguments dispatched directly into command executions. */
  args?: any;
}

/**
 * KeybindingManager Subsystem Engine
 * Orchestrates keyboard macro inputs, multi-key sequence combinations (Chords), 
 * user profile definition layers, and interceptive DOM environment keyboard interactions.
 */
class KeybindingManager {
  /** Master execution priority sequence tracking underlying shortcuts and user modifications */
  private keybindings: Keybinding[] = [];
  
  // ── STATE MACHINE SECTOR ──
  /** Tracks the initial root prefix token when evaluating multi-stroke shortcuts */
  private activeChordPrefix: string | null = null;
  /** Active timeout callback tracking handle evaluating structural multi-key intervals */
  private chordTimeoutId: any = null;
  /** Sequential delay limit (3000ms) enforced prior to dropping multi-stroke chains */
  private readonly CHORD_TIMEOUT_MS = 3000;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Binds global macro listeners directly into document view lifecycles.
   * Leverages DOM event capturing stages to intercept triggers before third-party elements can disrupt workflows.
   */
  public initialize(): void {
    window.addEventListener('keydown', this.handleKeyDown, { capture: true });
  }

  /**
   * Resets internal tracking variables and unmounts event registration frameworks cleanly.
   */
  public dispose(): void {
    window.removeEventListener('keydown', this.handleKeyDown, { capture: true });
    this.clearChordState();
  }

  /**
   * Compiles baseline defaults alongside personalized shortcut configuration trees.
   * Appends overrides at trailing locations to assign native lookup priority advantages.
   * 
   * @param defaultBindings Default shortcut settings built directly into application layers.
   * @param userOverrides Custom configurations adjusted by client preference changes.
   */
  public loadKeybindings(defaultBindings: Keybinding[], userOverrides: Keybinding[]): void {
    this.keybindings = [...defaultBindings, ...userOverrides].map(kb => ({
      ...kb,
      key: this.normalizeKeyCombo(kb.key)
    }));
  }

  /**
   * Captures raw input strokes, evaluates sequence variations against focus properties, 
   * and blocks operational defaults to safely divert instruction signals.
   */
  private handleKeyDown(e: KeyboardEvent): void {
    // Structural Guard: Ignore lone meta keystrokes to ensure modifier key combinations register properly
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

    const pressedCombo = this.getEventString(e);
    if (!pressedCombo) return;

    const wasInChordMode = !!this.activeChordPrefix; 
    const sequenceToTest = this.activeChordPrefix 
      ? `${this.activeChordPrefix} ${pressedCombo}` 
      : pressedCombo;

    let matchFound = false;

    // Evaluate configurations backwards (Right-to-Left) to process highest priority overrides first
    for (let i = this.keybindings.length - 1; i >= 0; i--) {
      const kb = this.keybindings[i];

      // Validate context states against system evaluation engines
      if (kb.when && !contextKeyService.evaluate(kb.when)) continue;

      // Exact Sequence Matches: Terminate tracking frames and trigger target processes
      if (kb.key === sequenceToTest) {
        e.preventDefault();
        e.stopPropagation();
        
        commands.executeCommand(kb.command, kb.args);
        this.clearChordState();
        matchFound = true;
        break;
      }

      // Initial Chord Sequences: Transition core state controllers into standby mode
      if (!this.activeChordPrefix && kb.key.startsWith(`${pressedCombo} `)) {
        e.preventDefault();
        e.stopPropagation();
        
        this.enterChordState(pressedCombo);
        matchFound = true;
        break;
      }
    }

    // ── INTERCEPTIVE CHORD SWALLOW ENGINE ──
    // Blocks unmapped secondary keystrokes within active chord frameworks to 
    // prevent underlying context instances (e.g., Monaco Editor) from triggering default behaviors.
    if (wasInChordMode && !matchFound) {
      e.preventDefault();
      e.stopPropagation();
      console.warn(`[Keybinding] The key combination (${sequenceToTest}) does not map to an active command.`);
      this.clearChordState();
    }
  }

  /** Shifts active tracking loops over into chained execution monitoring steps */
  private enterChordState(prefix: string): void {
    this.activeChordPrefix = prefix;
    console.log(`[Keybinding] Multi-stroke chord sequence sequence initialized: ${prefix}`);
    
    if (this.chordTimeoutId) clearTimeout(this.chordTimeoutId);
    
    this.chordTimeoutId = setTimeout(() => {
      this.clearChordState();
      console.log(`[Keybinding] Chord execution timing out on sequence: ${prefix}`);
    }, this.CHORD_TIMEOUT_MS);
  }

  /** Clears chained memory flags and terminates outstanding scheduling hooks */
  private clearChordState(): void {
    this.activeChordPrefix = null;
    if (this.chordTimeoutId) {
      clearTimeout(this.chordTimeoutId);
      this.chordTimeoutId = null;
    }
  }

  /**
   * Sanitizes random layout formatting styles into standardized framework strings.
   * Re-orders modifier parameters symmetrically: ctrl + cmd + alt + shift + targetKey.
   */
  private normalizeKeyCombo(combo: string): string {
    return combo.toLowerCase().split(' ').map(part => {
      const keys = part.split('+');
      const modifiers = { ctrl: false, shift: false, alt: false, cmd: false };
      let mainKey = '';

      keys.forEach(k => {
        if (k === 'ctrl') modifiers.ctrl = true;
        else if (k === 'shift') modifiers.shift = true;
        else if (k === 'alt') modifiers.alt = true;
        else if (k === 'cmd' || k === 'meta') modifiers.cmd = true;
        else mainKey = k;
      });

      const result = [];
      if (modifiers.ctrl) result.push('ctrl');
      if (modifiers.cmd) result.push('cmd');
      if (modifiers.alt) result.push('alt');
      if (modifiers.shift) result.push('shift');
      if (mainKey) result.push(mainKey);
      
      return result.join('+');
    }).join(' ');
  }

  /** Extracts atomic token descriptions directly out of active DOM event elements */
  private getEventString(e: KeyboardEvent): string {
    const result = [];
    if (e.ctrlKey) result.push('ctrl');
    if (e.metaKey) result.push('cmd');
    if (e.altKey) result.push('alt');
    if (e.shiftKey) result.push('shift');

    let key = e.key.toLowerCase();
    
    if (key === ' ') key = 'space';
    else if (key === '+') key = 'plus';
    
    if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
      result.push(key);
    }

    return result.join('+');
  }
  
  /** Registers a standalone dynamic macro configuration directly into hot operational stacks */
  public addDynamicBinding(binding: Keybinding): void {
    const normalizedTarget = this.normalizeKeyCombo(binding.key);
    const exists = this.keybindings.some(
      kb => kb.key === normalizedTarget && kb.command === binding.command
    );

    if (!exists) {
      this.keybindings.unshift({
        ...binding,
        key: normalizedTarget
      });
    }
  }
  
  /**
   * Looks up high-priority active shortcuts assigned against localized execution markers.
   * Returns a parsed display label, or null if no valid configuration matches.
   * 
   * @param commandId Specific unique workspace process token string.
   */
  public getShortcutLabel(commandId: string): string | null {
    for (let i = this.keybindings.length - 1; i >= 0; i--) {
      if (this.keybindings[i].command === commandId) {
        return this.formatKeyForDisplay(this.keybindings[i].key);
      }
    }
    return null;
  }

  /** Reformats base configuration strings into clean, user-facing presentation tokens */
  private formatKeyForDisplay(key: string): string {
    return key.split(' ').map(chord => 
      chord.split('+').map(k => {
        if (k === 'cmd') return 'Cmd';
        if (k === 'up') return '↑';
        if (k === 'down') return '↓';
        return k.charAt(0).toUpperCase() + k.slice(1);
      }).join('+')
    ).join(' ');
  }
}

/**
 * Shared central singleton engine processing keyboard events, key chords, and shortcut mappings.
 */
export const keybindingManager = new KeybindingManager();
