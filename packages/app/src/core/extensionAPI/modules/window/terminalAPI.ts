// src/core/extensionAPI/modules/window/terminalAPI.ts

import { useTermisStore } from '@/features/termis/store/termisStore';
import { useTerminalStore } from '@/features/termis/components/terminal/store/terminalStore';
import { terminalProcessRegistry } from '@/features/termis/components/terminal/core/TerminalRegistry';
import { msEvents } from '@/core/extensionAPI/events/EventManager'; 
import type { TerminalInstance } from '@/features/termis/components/terminal/store/terminalStore';
import { ensureTermisTabOpen } from '../termisModule';

/**
 * Wraps an internal state-managed terminal instance into a safe, uniform 
 * public API structure exposed to third-party extension developers.
 * 
 * @param {TerminalInstance} instance - The internal terminal data model from the store.
 */
const wrapTerminal = (instance: TerminalInstance) => ({
  /** The unique identifier assigned to this terminal session. */
  id: instance.id,
  
  /** The human-readable display name of the terminal tab. */
  name: instance.title,

  /**
   * Retrieves the system process identifier (PID) asynchronously.
   * @returns {Promise<number>} Resolves to the process ID, or -1 if unallocated.
   */
  get processId() { return Promise.resolve(instance.pid ?? -1); },

  /**
   * The current exit status metadata if the process has terminated.
   * @returns {Object | undefined} Object containing the exit code, or undefined if still active.
   */
  get exitStatus() {
    const current = useTerminalStore.getState().instances.find(t => t.id === instance.id);
    if (!current || current.status !== 'exited') return undefined;
    return { code: current.exitCode ?? 0 };
  },

  /** The configuration properties utilized to initialize this terminal session. */
  get creationOptions() {
    return { name: instance.title, cwd: instance.workingDir, shell: instance.shell };
  },

  /**
   * Focuses and brings the terminal panel instance into view in the layout.
   * @param {boolean} [_preserveFocus=false] - Optional configuration parameter to retain code editor focus.
   */
  show: (_preserveFocus = false): void => {
    useTerminalStore.getState().setActive(instance.id);
    useTermisStore.getState().setActiveView('terminal');
    ensureTermisTabOpen();
  },

  /** Hides the terminal panel if it is currently focused, switching view hierarchies. */
  hide: (): void => {
    const store = useTerminalStore.getState();
    if (store.activeId !== instance.id) return;
    const other = store.instances.find(t => t.id !== instance.id);
    if (other) store.setActive(other.id);
  },

  /**
   * Evaluates and transmits a string command payload to the underlying shell process instance.
   * Features built-in sequential buffering delays to gracefully support lazy booting processes.
   * 
   * @param {string} text - The raw text command string payload.
   * @param {boolean} [addNewLine=true] - Appends a carriage return (`\r`) execution line-break delimiter when true.
   */
  sendText: (text: string, addNewLine = true): void => {
    const payload = text + (addNewLine ? '\r' : '');
    const proc = terminalProcessRegistry.get(instance.id);
    
    if (proc) {
      // Process is alive and connected; execute instructions immediately
      proc.write(payload);
    } else {
      console.warn(`[TerminalAPI] Terminal ${instance.id} is booting. Buffering command...`);
      
      // Polling strategy loop: query the process registry periodically until target handle is mounted
      const checkInterval = setInterval(() => {
        const readyProc = terminalProcessRegistry.get(instance.id);
        if (readyProc) {
          clearInterval(checkInterval);
          console.log(`[TerminalAPI] Process mounted! Delaying 1200ms for shell ecosystem to stabilize...`);
          // Enforce visual buffer window allowance to yield control to shell boot scripts before processing raw stdin
          setTimeout(() => readyProc.write(payload), 1200);
        }
      }, 50);

      // Fallback Strategy: If the process registry framework drops operations or exceeds 2500ms timeout threshold,
      // force dispatch down into the structural Capacitor Native System layer bridge directly.
      setTimeout(() => {
        if (checkInterval) clearInterval(checkInterval);
        
        if (!terminalProcessRegistry.get(instance.id)) {
          console.log(`[TerminalAPI] Registry timeout! Forcing command via Native Backend...`);
          
          if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
             const { NativeTerminal } = require('@/features/termis/components/terminal/core/TerminalProcess');
             NativeTerminal.write({ id: instance.id, data: payload }).catch(() => {});
          }
        }
      }, 2500);
    }
  },

  /**
   * Requests the underlying stream engine to clear terminal screen buffers.
   * Employs transient buffering intervals if invoked while the system state is spawning.
   */
  clear: (): void => { 
    const proc = terminalProcessRegistry.get(instance.id);
    if (proc) {
       proc.clear();
    } else {
       const checkInterval = setInterval(() => {
        const readyProc = terminalProcessRegistry.get(instance.id);
        if (readyProc) {
          readyProc.clear();
          clearInterval(checkInterval);
        }
      }, 50);
      setTimeout(() => clearInterval(checkInterval), 3000);
    }
  },

  /** Terminates the stream, triggers standard OS signaling cleanup traps, and releases store allocation. */
  dispose: (): void => {
    terminalProcessRegistry.get(instance.id)?.kill();
    useTerminalStore.getState().removeInstance(instance.id);
  },
});

export type WrappedTerminal = ReturnType<typeof wrapTerminal>;

/**
 * Factory function creating the structural ecosystem layout Terminal window management API.
 */
export const createTerminalAPI = () => ({
  /** 
   * Array of all existing terminals registered in the environment.
   * @returns {WrappedTerminal[]} Fully wrapped active terminal API components.
   */
  get terminals(): WrappedTerminal[] {
    const instances = useTerminalStore.getState().instances;
    console.log('🔍 [TerminalAPI] get terminals() called. Raw Instances:', instances.map(i => ({ id: i.id, title: i.title })));
    return instances.map(wrapTerminal);
  },

  /** 
   * The currently focused active terminal element.
   * @returns {WrappedTerminal | undefined} The active interface wrapper, or undefined if hidden.
   */
  get activeTerminal(): WrappedTerminal | undefined {
    const { activeId, instances } = useTerminalStore.getState();
    if (!activeId) return undefined;
    const inst = instances.find(t => t.id === activeId);
    return inst ? wrapTerminal(inst) : undefined;
  },

  /**
   * Spawns a discrete, configurable terminal workspace execution layer instance window.
   * 
   * @param {string | Object} [options] - Pass a simple title string layout name or configuration properties directly.
   * @param {string} [options.name] - The visual display label mapping header title.
   * @param {string} [options.cwd] - The target absolute working directory file path workspace root directory.
   * @param {string} [options.shell] - Overriding path specification targeting alternative binary shells.
   * @param {boolean} [options.show=true] - Dictates whether layout viewports instantly focus-shift elements into place.
   * @returns {WrappedTerminal} The public descriptor interface structure handles matching instance hooks.
   */
  createTerminal: (options?: string | { name?: string; cwd?: string; shell?: string; show?: boolean }): WrappedTerminal => {
    console.log('🔍 [TerminalAPI] createTerminal() called with options:', options);

    const store = useTerminalStore.getState();
    const name  = typeof options === 'string' ? options : (options?.name ?? 'Terminal');
    const cwd   = typeof options === 'object' ? options?.cwd : undefined;
    const shell = typeof options === 'object' ? options?.shell : undefined;
    const show  = typeof options === 'object' ? (options?.show ?? true) : true;

    const id   = store.createInstance({ title: name, shell: shell as any, workingDir: cwd });
    const inst = useTerminalStore.getState().instances.find(t => t.id === id)!;

    console.log(`🔍 [TerminalAPI] Successfully created terminal [${name}] with ID:`, id);

    if (show) {
      useTermisStore.getState().setActiveView('terminal');
      ensureTermisTabOpen();
    }
    return wrapTerminal(inst);
  },

  // ────────────────────────────────────────────────────────
  // EVENT LIFECYCLE SUBSCRIPTIONS
  // ────────────────────────────────────────────────────────

  /** Fires an event callback handler whenever a new terminal tab container gets created. */
  onDidOpenTerminal: (handler: (terminal: WrappedTerminal) => void) => {
    return { dispose: msEvents.on('onDidOpenTerminal', (inst: TerminalInstance) => handler(wrapTerminal(inst))) };
  },

  /** Fires an event callback handler tracing historical instance context structures right as closures execute. */
  onDidCloseTerminal: (handler: (terminal: { id: string; exitCode?: number }) => void) => {
    return { dispose: msEvents.on('onDidCloseTerminal', handler) };
  },

  /** Fires an event callback notification updating execution parameters when an index changes panel viewport assignments. */
  onDidChangeActiveTerminal: (handler: (terminal: WrappedTerminal | undefined) => void) => {
    return { dispose: msEvents.on('onDidChangeActiveTerminal', (inst?: TerminalInstance) => handler(inst ? wrapTerminal(inst) : undefined)) };
  }
});
