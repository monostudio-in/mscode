// src/features/termis/components/parts/terminal/store/terminalStore.ts

import { create } from 'zustand';
import { msEvents } from '@/core/extensionAPI/events/EventManager';

export type TerminalStatus = 'initializing' | 'ready' | 'busy' | 'exited' | 'error';
export type TerminalShell = 'bash' | 'sh' | 'zsh' | 'fish' | 'powershell' | 'cmd';

export interface TerminalInstance {
  id:          string;
  title:       string;
  shell:       TerminalShell;
  status:      TerminalStatus;
  workingDir:  string;
  pid?:        number;
  exitCode?:   number;
  createdAt:   number;
}

interface TerminalState {
  instances:       TerminalInstance[];
  activeId:        string | null;
  defaultShell:    TerminalShell;

  createInstance:  (opts?: Partial<Pick<TerminalInstance, 'title' | 'shell' | 'workingDir'>>) => string;
  removeInstance:  (id: string) => void;
  setActive:       (id: string) => void;
  updateInstance:  (id: string, patch: Partial<TerminalInstance>) => void;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  instances:       [],
  activeId:        null,
  defaultShell:    'sh',

  createInstance: (opts) => {
    const id = `term-${Date.now()}`;
    const instance: TerminalInstance = {
      id,
      title: opts?.title || 'Terminal',
      shell: opts?.shell || get().defaultShell,
      status: 'initializing',
      workingDir: opts?.workingDir || '/storage/emulated/0',
      createdAt: Date.now(),
    };

    set(s => ({ instances: [...s.instances, instance], activeId: id }));
    
    msEvents.emit('onDidOpenTerminal', instance); 
    
    return id;
  },

  removeInstance: (id) => {
    let closedInstance: TerminalInstance | undefined;
    set(s => {
      closedInstance = s.instances.find(t => t.id === id);
      const remaining = s.instances.filter(t => t.id !== id);
      let newActive   = s.activeId;

      if (s.activeId === id) {
        const idx   = s.instances.findIndex(t => t.id === id);
        const next  = remaining[Math.max(0, idx - 1)];
        newActive   = next?.id ?? null;
      }
      return { instances: remaining, activeId: newActive };
    });
    
    if (closedInstance) msEvents.emit('onDidCloseTerminal', { id, exitCode: closedInstance.exitCode });
  },

  setActive: (id) => {
    set({ activeId: id });
    const inst = get().instances.find(t => t.id === id);
    
    if (inst) msEvents.emit('onDidChangeActiveTerminal', inst);
  },

  updateInstance: (id, patch) =>
    set(s => ({ instances: s.instances.map(t => t.id === id ? { ...t, ...patch } : t) })),
}));