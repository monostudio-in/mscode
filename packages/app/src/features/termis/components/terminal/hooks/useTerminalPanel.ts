// src/features/termis/components/parts/terminal/hooks/useTerminalPanel.ts
//
// Manages the bottom panel: open/close, height via drag.
// Thin wrapper over terminalStore & termisStore — keeps components clean.

import { useCallback } from 'react';
import { useTerminalStore } from '../store/terminalStore';
import { useTermisStore } from '@/features/termis/store/termisStore';

export function useTerminalPanel() {
  //  Terminal Specific Store
  const {
    instances,
    activeId,
    createInstance,
    removeInstance,
    setActive,
    defaultShell,
  } = useTerminalStore();

  //  Termis Brain Store (UI & Panel State)
  const {
    isOpen: isPanelOpen, // API compatible : isOpen -> isPanelOpen
    panelHeight,
    openPanel: _openPanel,
    closePanel,
    togglePanel,
    setPanelHeight,
    setActiveView
  } = useTermisStore();

  // ── Derived state ─────────────────────────────────────────────────────────

  const activeInstance = instances.find(t => t.id === activeId) ?? null;
  const hasInstances   = instances.length > 0;

  // ── Open panel + ensure at least one terminal ─────────────────────────────

  const openOrFocus = useCallback(() => {
    if (!hasInstances) createInstance();
    setActiveView('terminal');
  }, [hasInstances, createInstance, setActiveView]);

  // ── Add new terminal instance ─────────────────────────────────────────────

  const addTerminal = useCallback((opts?: { shell?: string; cwd?: string }) => {
    const id = createInstance({
      shell: (opts?.shell ?? defaultShell) as any,
      workingDir: opts?.cwd,
    });
    setActiveView('terminal');
    return id;
  }, [createInstance, defaultShell, setActiveView]);

  // ── Kill active terminal ──────────────────────────────────────────────────

  const killActive = useCallback(() => {
    if (activeId) removeInstance(activeId);
  }, [activeId, removeInstance]);

  // ── Resize drag ───────────────────────────────────────────────────────────

  const handleResizerDrag = useCallback((deltaY: number) => {
    // Dragging up (negative deltaY) increases panel height
    setPanelHeight(panelHeight - deltaY);
  }, [panelHeight, setPanelHeight]);

  return {
    // State
    isPanelOpen,
    panelHeight,
    instances,
    activeId,
    activeInstance,
    hasInstances,

    // Actions
    openPanel:    openOrFocus,
    closePanel,
    togglePanel,
    addTerminal,
    killActive,
    setActive,
    removeInstance,
    handleResizerDrag,
  };
}