// src/features/terminal/core/TerminalProcess.ts

import { Capacitor, registerPlugin } from '@capacitor/core';
import { MockTerminalBackend } from './MockTerminalBackend';

/**
 * Declares the contract for the low-level Capacitor plugin architecture interface layer.
 * Coordinates direct mapping hooks across the asynchronous bridge layer connecting 
 * Javascript configurations to backing operating system binary environments.
 */
interface NativeTerminalPlugin {
  /**
   * Dispatches a initialization directive payload allocating internal processes on target hardware platforms.
   * 
   * @param options Structure defining execution identifiers and environmental variables.
   */
  start(options: { id: string; projectPath?: string; type?: string }): Promise<void>; 

  /**
   * Streams sequence vectors into standard input streams managed by active runtime instances.
   * 
   * @param options Structure allocating targeting contexts alongside standard string characters.
   */
  write(options: { id: string; data: string }): Promise<void>;

  /**
   * Updates standard tracking configurations monitoring internal row and column counts inside target processes.
   * 
   * @param options Target dimensions specifying matrix grid counts.
   */
  resize(options: { id: string; cols: number; rows: number }): Promise<void>;

  /**
   * Forces terminating standard signal codes through target host operational layers.
   * 
   * @param options Unique identifier structure mapping target active resources.
   */
  kill(options: { id: string }): Promise<void>;
  
  /**
   * Inspects initialization constraints verifying physical runtime host operational readiness.
   * 
   * @returns Analytical structure detailing system environment state profiles.
   */
  checkSetup(): Promise<{ isReady: boolean }>;

  /**
   * Compiles, structures, or constructs environment paths during early lifecycle execution phases.
   */
  initSetup(): Promise<void>;

  /**
   * Rewrites internal machine naming domains registered inside host identification parameters.
   * 
   * @param options Structure mapping the designated host destination string.
   */
  setHostname(options: { name: string }): Promise<void>;
  
  /**
   * Spawns a dedicated Language Server Protocol (LSP) daemon engine context inside host system paths.
   * 
   * @param options Subprocess command parameter execution variables.
   * @returns Target connection endpoint configuration tracking values.
   */
  spawnLsp(options: { command: string }): Promise<{ port: number }>;
  
  /**
   * Binds transactional tracking observers to catch asynchronous data packets arriving across operational ports.
   */
  addListener(eventName: 'onData', listenerFunc: (info: { id: string; data: string }) => void): any;
  addListener(eventName: 'onLog', listenerFunc: (info: { message: string }) => void): any;
  addListener(eventName: 'onExit', listenerFunc: (info: { id: string; code: number }) => void): any;
}

/** Exported Capacitor proxy configuration anchoring cross-platform hardware translation hooks. */
export const NativeTerminal = registerPlugin<NativeTerminalPlugin>('NativeTerminal');

/** Discrete action event schemas propagated down asynchronous monitoring loops. */
export type ProcessEvent =
  | { type: 'data';    data: string }
  | { type: 'exit';    code: number }
  | { type: 'error';   message: string }
  | { type: 'ready' };

/** Function callback layout executing on standard operational updates. */
type Listener = (event: ProcessEvent) => void;

/** Settings blueprint shaping operational scopes, directory states, and interface limits. */
export interface ProcessOptions {
  id:         string;
  shell:      string;
  cwd?:       string;
  cols?:      number;
  rows?:      number;
}

/**
 * Universal supervisor instance abstracting operating system differences between native 
 * device environments and modern browser platform contexts. Manages process tracking structures, 
 * data formatting routines, lifecycle states, and input/output routing.
 */
export class TerminalProcess {
  /** Active pool of functional tracking hooks registered against lifecycle operations. */
  private listeners: Set<Listener> = new Set();
  
  /** Internal handle capturing tracking tokens for incoming raw data buffers. */
  private dataListenerRef: any = null;
  
  /** Internal handle capturing tracking tokens for diagnostic backend logging channels. */
  private logListenerRef: any = null;
  
  /** Internal handle capturing tracking tokens for structural session exit state hooks. */
  private exitListenerRef: any = null;
  
  /** Evaluates and updates platform states targeting true hardware vs simulation footprints. */
  private isNative = Capacitor.isNativePlatform();
  
  /** Fallback testing sandbox module deployed automatically during standard web simulation routines. */
  private mockBackend: MockTerminalBackend | null = null;
  
  /** Tracking value reflecting host system level process identifiers. */
  public pid: number = 0;
  
  /** Trace tag tracking unique configuration references. */
  public readonly id: string;
  
  /** System settings configuration references matching this execution space. */
  private options: ProcessOptions;

  /**
   * Instantiates an atomic terminal routing entity tracking specific structural layouts.
   * 
   * @param options Operational settings defining boundaries and workspace targets.
   */
  constructor(options: ProcessOptions) {
    this.id = options.id; 
    this.options = options;
  }

  /**
   * Launches the targeted execution interface. For native devices, handles binding to low-level PTY streams and normalizing newline characters.
   * For web browsers, sets up a simulated processing environment.
   */
  public async start(): Promise<void> {
    try {
      if (this.isNative) {
        // Registers standard diagnostics tracking loops across underlying system subsystems
        this.logListenerRef = await NativeTerminal.addListener('onLog', (info) => {
          console.log('%c[JAVA Backend]', 'background: #222; color: #00ffcc; padding: 2px 5px; border-radius: 2px;', info.message);
        });

        // Registers standard terminal streams, transforming single linefeeds into standard carriage return arrays
        this.dataListenerRef = await NativeTerminal.addListener('onData', (info) => {
          if (info.id !== this.id) return; 
          const formattedData = info.data.replace(/\r?\n/g, '\r\n');
          this.emit({ type: 'data', data: formattedData });
        });

        // Registers framework exit hooks processing lifecycle termination states
        this.exitListenerRef = await NativeTerminal.addListener('onExit', (info) => {
          if (info.id !== this.id) return;
          this.emit({ type: 'exit', code: info.code });
        });

        // Instructs native framework platforms to allocate corresponding operational contexts
        await NativeTerminal.start({ 
          id: this.id, 
          projectPath: this.options.cwd 
        });
        
        this.emit({ type: 'ready' });

      } else {
        // Allocates localized simulation pipelines for web engine environments
        this.mockBackend = new MockTerminalBackend(this.options.cwd, (data) => {
          this.emit({ type: 'data', data });
        });
        
        this.emit({ type: 'ready' });
        this.mockBackend.start();
      }
    } catch (err: any) {
      this.emit({ type: 'error', message: err.message || 'Failed to start terminal' });
    }
  }

  /**
   * Dispatches data sequences down operational streams toward running process contexts.
   * 
   * @param data Content sequences bound for active execution shells.
   */
  public async write(data: string): Promise<void> {
    if (this.isNative) {
      await NativeTerminal.write({ id: this.id, data });
    } else {
      this.mockBackend?.write(data);
    }
  }

  /**
   * Updates display boundaries within standard configuration containers and instructs 
   * hardware channels to re-map core layout properties accordingly.
   * 
   * @param cols Horizontal matrix limits tracking bounds configuration sizes.
   * @param rows Vertical matrix limits tracking bounds configuration sizes.
   */
  public resize(cols: number, rows: number): void { 
    if (this.options) {
      this.options.cols = cols;
      this.options.rows = rows;
    }
    if (this.isNative) {
      NativeTerminal.resize({ id: this.id, cols, rows }).catch((err: any) => {
        console.error('[TerminalProcess] Failed to resize PTY:', err);
      });
    }
  }

  /**
   * Terminates active interface processes and tears down operational system tracking hooks.
   */
  public kill(): void {
    if (this.isNative) {
      NativeTerminal.kill({ id: this.id }).catch(() => {});
      if (this.dataListenerRef) this.dataListenerRef.remove();
      if (this.logListenerRef) this.logListenerRef.remove();
      if (this.exitListenerRef) this.exitListenerRef.remove();
    } else {
      this.emit({ type: 'exit', code: 0 });
    }
  }

  /**
   * Attaches structural listener callbacks to standard processing updates.
   * 
   * @param listener Target logic handling framework operational updates.
   * @returns Unsubscribe handle function to safely decouple from live data updates.
   */
  public on(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Broadcasts target event configurations across active listeners.
   * 
   * @param event Payload targeting registered operational tracking handles.
   */
  private emit(event: ProcessEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}
