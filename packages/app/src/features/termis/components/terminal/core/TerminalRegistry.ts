// src/features/termis/components/parts/terminal/core/terminalRegistry.ts

/**
 * Interface defining the operational bridge for external sandbox environments
 * to interact with active terminal session resources.
 */
interface TerminalProcessApi {
    /** Sends raw data sequences into the process input stream. */
    write: (data: string) => void;
    /** Triggers a termination signal to the active process. */
    kill: () => void;
    /** Requests the clearing of the process output buffer. */
    clear: () => void;
}

/**
 * Registry storing active terminal process handles, allowing extension sandboxes
 * to safely access and manipulate terminal sessions via unique identifiers.
 */
const processRegistry = new Map<string, TerminalProcessApi>();
  
export const terminalProcessRegistry = {
    /** Registers a terminal process API into the global registry. */
    register: (id: string, api: TerminalProcessApi) => processRegistry.set(id, api),
    
    /** Removes a terminal process from the registry upon session closure. */
    unregister: (id: string) => processRegistry.delete(id),
    
    /** Retrieves the operational API for a specific terminal session ID. */
    get: (id: string) => processRegistry.get(id),
};
  
/**
 * Defines the lifecycle event types available for monitoring terminal session status changes.
 */
export type TerminalEventType = 'open' | 'close' | 'activeChange';

/**
 * Internal map maintaining sets of callback listeners for various terminal lifecycle events.
 */
const terminalListeners = new Map<TerminalEventType, Set<(data: any) => void>>();

/**
 * Event bus coordinating terminal lifecycle signals, enabling components to subscribe 
 * to session status updates and state transitions.
 */
export const terminalEvents = {
    /**
     * Broadcasts a lifecycle event to all registered listeners of the given type.
     */
    emit: (type: TerminalEventType, data: unknown) => {
        terminalListeners.get(type)?.forEach(fn => fn(data));
    },

    /**
     * Registers a listener for a specific lifecycle event.
     * 
     * @param type The lifecycle event type to observe.
     * @param fn The callback function invoked when the event occurs.
     * @returns A disposable object to easily unregister the listener.
     */
    on: (type: TerminalEventType, fn: (data: any) => void) => {
        if (!terminalListeners.has(type)) {
            terminalListeners.set(type, new Set());
        }
        terminalListeners.get(type)!.add(fn);
        
        return { 
            dispose: () => terminalListeners.get(type)?.delete(fn) 
        };
    },
};
