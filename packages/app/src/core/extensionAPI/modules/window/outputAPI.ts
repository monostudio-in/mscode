// src/core/extensionAPI/modules/window/outputAPI.ts

import { useOutputStore } from '@/features/termis/components/output/store/outputStore';
import { useTermisStore } from '@/features/termis/store/termisStore';
import { msEvents } from '@/core/extensionAPI/events/EventManager';
import { ensureTermisTabOpen } from '../termisModule';

export const createOutputAPI = () => ({
  /**
   * Returns the name of the currently active output channel.
   * @returns {string} The active channel name.
   */
  get activeOutputChannel(): string {
    return useOutputStore.getState().activeChannel;
  },

  /**
   * Returns a list of all currently open output channels.
   * @returns {string[]} Array of channel names.
   */
  get outputChannels(): string[] {
    return useOutputStore.getState().channels;
  },

  /**
   * Creates a new output channel with a specific name.
   * @param {string} name The display name of the channel.
   * @returns An object representing the output channel with control methods.
   */
  createOutputChannel: (name: string) => {
    const {
      createChannel, appendLog, clearChannel, removeChannel,
      setActiveChannel, registerKillHandler, unregisterKillHandler,
    } = useOutputStore.getState();

    createChannel(name);

    return {
      name,
      append: (text: string) => appendLog(name, text),
      appendLine: (text: string) => appendLog(name, `${text}\n`),
      clear: () => clearChannel(name),
      show: () => {
        setActiveChannel(name);
        useTermisStore.getState().setActiveView('output');
        ensureTermisTabOpen();
      },
      dispose: () => removeChannel(name),
      onDidKill: (handler: () => void) => registerKillHandler(name, handler),
      clearKillHandler: () => unregisterKillHandler(name),
    };
  },

  // ────────────────────────────────────────────────────────
  // EVENT LISTENERS
  // ────────────────────────────────────────────────────────

  /**
   * Fired when a new output channel is created.
   * @param handler Callback receiving the name of the new channel.
   * @returns A disposable object to stop listening.
   */
  onDidOpenOutputChannel: (handler: (channelName: string) => void) => {
    return { dispose: msEvents.on('onDidOpenOutputChannel', handler) };
  },

  /**
   * Fired when an output channel is disposed/closed.
   * @param handler Callback receiving the name of the closed channel.
   * @returns A disposable object to stop listening.
   */
  onDidCloseOutputChannel: (handler: (channelName: string) => void) => {
    return { dispose: msEvents.on('onDidCloseOutputChannel', handler) };
  },

  /**
   * Fired when the active output channel changes.
   * @param handler Callback receiving the name of the newly active channel.
   * @returns A disposable object to stop listening.
   */
  onDidChangeActiveOutputChannel: (handler: (channelName: string) => void) => {
    return { dispose: msEvents.on('onDidChangeActiveOutputChannel', handler) };
  }
});