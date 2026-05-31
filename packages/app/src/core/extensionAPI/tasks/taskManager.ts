// src/core/extensionAPI/tasks/taskManager.ts

import { Capacitor, registerPlugin } from '@capacitor/core';

/**
 * Native bridge interface contract communicating directly with the platform's custom Capacitor shell execution layer.
 */
interface INativeTerminalPlugin {
  /**
   * Spawns an asynchronous background process or terminal worker thread on the mobile filesystem.
   * @param options Target execution arguments mapping setup variables.
   */
  streamBackgroundExecute(options: { sessionId: string; command: string; cwd: string }): Promise<void>;
  
  /**
   * Dispatches an immediate hard kill signal targeting a specific active system shell process thread.
   * @param options Execution token identifying the task allocation layer to discard.
   */
  killBackgroundProcess(options: { sessionId: string }): Promise<void>;
  
  /**
   * Registers a low-level native bridge data listener intercepting OS-level terminal event emission loops.
   * @param eventName Identifier string of the platform event hook (e.g., `'onBackgroundData'`, `'onBackgroundExit'`).
   * @param listenerFunc Event payload callback intercepting telemetry logs downstream.
   */
  addListener(eventName: string, listenerFunc: (data: any) => void): Promise<any>;
}

/**
 * Hydrated proxy instance representing the underlying objective native bridge terminal plugin layer.
 */
const NativeTerminal = registerPlugin<any>('NativeTerminal') as INativeTerminalPlugin;

// ─── TaskRecord ───────────────────────────────────────────────────────────────

/**
 * Data blueprint logging execution states and runtime lifecycle metrics for user-visible background commands.
 */
export interface TaskRecord {
  /** Unique verification signature generated per-execution loop block. */
  sessionId: string;
  
  /** The full shell execution text string dispatched to the runtime context layer. */
  command:   string;
  
  /** Fully qualified structural fallback filepath target hosting the worker context block. */
  cwd:       string;
  
  /** * Targeted Output Channel namespace string. 
   * An empty string (`''`) indicates a silent system task hidden completely from the UI panel canvas.
   */
  channel:   string;
  
  /** High-resolution UNIX epoc timestamp timestamp mapping execution initialization checkpoints. */
  startedAt: number;
  
  /** Current evaluation status tracking lifecycle updates. */
  status:    'running' | 'done' | 'failed' | 'killed';
  
  /** Numerical feedback termination value emitted by the host shell on compilation or thread destruction cycles. */
  exitCode?: number;
}

// ─── TaskManager ──────────────────────────────────────────────────────────────

/**
 * Core Core Platform Architecture Engine: Shell Task Management Subsystem.
 * Orchestrates native background workers, tracks active session trees, bridges Capacitor streams,
 * and handles localized state bindings for the Tasks Panel view rendering layers.
 */
class TaskManager {
  /** Map cache binding stream tokens directly to listener interceptor proxies. */
  private handlers     = new Map<string, (data: string) => void>();
  
  /** Map cache mapping transaction tokens straight to exit code execution hooks. */
  private exitHandlers = new Map<string, (code: number) => void>();
  
  /** Structural state sentinel locking redundant listener initialization passes. */
  private listenerSetup = false;

  /** Internal reactive log tracking active user-visible process streams. */
  private _tasks: TaskRecord[] = [];
  
  /** Active listener cluster hooks subscribed to telemetry and state updates. */
  private _listeners: Array<(tasks: TaskRecord[]) => void> = [];

  // ── Native bridge listeners ────────────────────────────────────────────────

  /**
   * Sets up native listener entry gates bridging runtime Capacitor event arrays into unified web application store chains.
   * Enforces rigorous guard checks to block compilation on non-native simulated desktops.
   */
  private ensureListeners(): void {
    if (this.listenerSetup || !Capacitor.isNativePlatform()) return;
    this.listenerSetup = true;

    NativeTerminal.addListener('onBackgroundData', (info: { sessionId: string; data: string }) => {
      this.handlers.get(info.sessionId)?.(info.data);
    });

    NativeTerminal.addListener('onBackgroundExit', (info: { sessionId: string; exitCode: number }) => {
      this.exitHandlers.get(info.sessionId)?.(info.exitCode);
      this.handlers.delete(info.sessionId);
      this.exitHandlers.delete(info.sessionId);
    });
  }

  /** Broadcasts structural mutation updates downstream to active UI listeners. */
  private notify() {
    this._listeners.forEach(fn => fn([...this._tasks]));
  }

  /**
   * Applies atomic property overrides to a target tracked task item within the active stack.
   * @param sessionId Targets the specific process session context.
   * @param patch A dictionary block container mapping parameters to update.
   */
  private updateTask(sessionId: string, patch: Partial<TaskRecord>) {
    const idx = this._tasks.findIndex(t => t.sessionId === sessionId);
    if (idx !== -1) {
      this._tasks[idx] = { ...this._tasks[idx], ...patch };
      this.notify();
    }
  }

  // ── Public subscription (TasksPanel uses this) ─────────────────────────────

  /**
   * Registers a high-level visual observer callback loop to pipe state updates directly into UI rendering trees.
   * Useful inside sub-views like the TasksPanel layout interface.
   * @param fn Callback sequence executing on every mutation frame allocation.
   * @returns Cleanup teardown function closure to clear registrations safely.
   */
  subscribe(fn: (tasks: TaskRecord[]) => void): () => void {
    this._listeners.push(fn);
    fn([...this._tasks]);
    return () => { this._listeners = this._listeners.filter(l => l !== fn); };
  }

  /**
   * Extracts an isolated deep-copy block of all visible operations currently registered in system workflows.
   */
  getTasks(): TaskRecord[] { return [...this._tasks]; }

  // ── Execute ───────────────────────────────────────────────────────────────
  
  /**
   * Spawns, tracks, and streams a shell process execution worker block using conditional native bridging rules.
   * * @param cmd Raw command-line text string targeting completion evaluation pipelines.
   * @param cwd The working root base location on the native filesystem architecture maps.
   * @param onData Reactive interceptor hook receiving real-time raw stdout chunk dumps from terminal buffers.
   * @param outputChannel Optional UI mirror channel parameters setup layout:
   * - `false` (Default): Fully silent internal operation. Logs pass strictly to `onData`. Hidden from Tasks Panel.
   * - `string`: Formats and logs logs explicitly straight into a visual `outputStore` window path and mounts item logs onto the Tasks UI Panel.
   * * @returns Handle object containing the output resolution Promise thread and a hard cancel disposal kill method.
   */
  execute(
    cmd:           string,
    cwd:           string,
    onData:        (d: string) => void,
    outputChannel: string | false = false,
  ): { result: Promise<{ exitCode: number }>; kill: () => void } {
    this.ensureListeners();

    const sessionId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const channel   = outputChannel === false ? '' : outputChannel;

    // Enforce isolation mapping: only log tasks explicitly requesting target visibility scopes
    if (channel) {
      const record: TaskRecord = {
        sessionId, command: cmd, cwd, channel,
        startedAt: Date.now(), status: 'running',
      };
      this._tasks.push(record);
      this.notify();
    }

    /** Lazy injection worker routing streaming data arrays safely to output pipelines. */
    const mirror = (text: string) => {
      if (!channel) return;
      try {
        const { useOutputStore } = require('@/features/termis/components/output/store/outputStore');
        useOutputStore.getState().appendLog(channel, text);
      } catch { /* lazy store connection bypass - target cluster layer unmounted */ }
    };

    this.handlers.set(sessionId, (data) => {
      onData(data);
      mirror(data);
    });

    const result = new Promise<{ exitCode: number }>(resolve => {
      this.exitHandlers.set(sessionId, (code) => {
        if (channel) {
          this.updateTask(sessionId, {
            status:   code === 0 ? 'done' : 'failed',
            exitCode: code,
          });
        }
        resolve({ exitCode: code });
      });

      if (Capacitor.isNativePlatform()) {
        const wrapped = `cd "${cwd}" && ${cmd}`;
        NativeTerminal.streamBackgroundExecute({ sessionId, command: wrapped, cwd });
      } else {
        // Fallback simulation mock grid rendering data sets on web browser sandbox footprints
        setTimeout(() => {
          const mockOut = `[Mock] $ ${cmd}\n[Mock] Done.\n`;
          onData(mockOut);
          mirror(mockOut);
          this.exitHandlers.get(sessionId)?.(0);
        }, 800);
      }
    });

    return {
      result,
      kill: () => {
        if (channel) {
          this.updateTask(sessionId, { status: 'killed' });
          mirror('\n[Process killed by user]');
        }
        if (Capacitor.isNativePlatform()) {
          NativeTerminal.killBackgroundProcess({ sessionId });
        }
      },
    };
  }
}

/**
 * Global Architecture Task Orchestrator Singleton instance.
 * Manages background terminal operations and bridges shell logic hooks safely across Capacitor compilation lines.
 */
export const taskManager = new TaskManager();