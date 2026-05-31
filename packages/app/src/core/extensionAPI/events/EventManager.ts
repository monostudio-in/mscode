// src/core/extensionAPI/events/EventManager.ts

/**
 * Type definition for event subscription callbacks.
 * Receives an optional generic data payload dispatched by the publisher.
 */
type EventCallback = (data?: any) => void;

/**
 * EventBus Architecture Subsystem
 * Facilitates decoupled, asynchronous communication between application core state engines 
 * and external extension APIs via a Publisher/Subscriber model.
 */
class EventBus {
  private listeners: Record<string, EventCallback[]> = {};

  /**
   * Registers an event consumer listener instance.
   * Extensions attach runtime lifecycle hooks here to intercept framework mutations.
   * 
   * @param eventName Unique identifier string of the target transaction event.
   * @param callback Execution logic triggered when the corresponding event is dispatched.
   * @returns Unsubscribe function closure to tear down the listener and manage memory lifecycle safely.
   */
  on(eventName: string, callback: EventCallback): () => void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);

    return () => {
      this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
    };
  }

  /**
   * Dispatches data payloads downstream to all mounted event consumers.
   * Invoked internally within the platform's core store subsystems to broadcast mutations.
   * 
   * @param eventName Target event string descriptor matching consumer configurations.
   * @param data Contextual payload structure accompanying the broadcast window.
   */
  emit(eventName: string, data?: any): void {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(callback => callback(data));
    }
  }
}

/**
 * Global Singleton Event Bus instance exported for cross-subsystem messaging orchestration.
 */
export const msEvents = new EventBus();


// ============================================================================
// USAGE REFERENCE INTEGRATION MANUAL
// ============================================================================
// Internal decoupled store engines (e.g., tabStore, exploreStore) declare
// transaction checkpoints by dispatching localized status frames to the EventBus proxy.
//
// Example Integration:
//
// import { msEvents } from '@/core/extensionAPI/events/EventManager';
//
// export const useTabStore = create((set) => ({
//   activeTabId: null,
//   
//   setActiveTab: (tabId) => {
//     set({ activeTabId: tabId });
//     
//     // Broadcast active tab mutation state updates
//     msEvents.emit('onTabChange', { tabId }); 
//   },
//   
//   closeTab: (tabId) => {
//     // Tab removal logic processing...
//     msEvents.emit('onTabClose', { tabId });
//   }
// }));
