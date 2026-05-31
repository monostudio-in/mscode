// src/features/terminal/hooks/useTerminalInstance.ts

import { useEffect, useRef, useCallback, useState } from 'react';
import { TerminalProcess }  from '../core/TerminalProcess';
import { XtermAdapter, DARK_XTERM_THEME, LIGHT_XTERM_THEME } from '../core/XtermAdapter';
import { useTerminalStore } from '../store/terminalStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { terminalProcessRegistry } from '../core/TerminalRegistry';
import { Clipboard } from '@capacitor/clipboard';


interface UseTerminalInstanceOptions {
  terminalId: string;
}

export function useTerminalInstance({ terminalId }: UseTerminalInstanceOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const processRef   = useRef<TerminalProcess | null>(null);
  const adapterRef   = useRef<XtermAdapter | null>(null);

  // Selection State for Teardrops & Menu
  const [selection, setSelection] = useState<{ text: string, startX: number, startY: number, endX: number, endY: number } | null>(null);

  const { instances, updateInstance }  = useTerminalStore();
  const settings                       = useSettingsStore(s => s.settings);

  const instance = instances.find(t => t.id === terminalId);

  // ── Mount / Unmount ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!containerRef.current || !instance) return;

    let alive = true;

    const boot = async () => {
      // 1. Spawn process
      const proc = new TerminalProcess({
        id: terminalId,
        shell:  instance.shell,
        cwd:    instance.workingDir,
        cols:   80,
        rows:   24,
      });
      processRef.current = proc;
      terminalProcessRegistry.register(instance.id, {
        write: (data: string) => { 
          proc.write(data).catch(() => {}); 
        },
        kill: () => { 
          proc.kill(); 
        },
        clear: () => { 
          // Clear UI by (XtermAdapter)
          adapterRef.current?.clear(); 
        }
      });
      // 2. Determine theme from workbench setting
      const isLight = settings['workbench.theme'] === 'vs-light';
      const theme   = isLight ? LIGHT_XTERM_THEME : DARK_XTERM_THEME;

      // 3. Create xterm adapter with all initial settings
      const adapter = new XtermAdapter(
        containerRef.current!,
        proc,
        theme,
        {
          fontFamily:      settings['terminal.integrated.fontFamily'] as string || settings['editor.fontFamily'] as string || "'Fira Code', monospace",
          fontSize:        settings['terminal.integrated.fontSize'] as number ?? settings['editor.fontSize'] as number ?? 13,
          fontWeight:      settings['terminal.integrated.fontWeight'] as any || 'normal',
          letterSpacing:   settings['terminal.integrated.letterSpacing'] as number ?? 0,
          cursorStyle:     settings['terminal.integrated.cursorStyle'] as any || 'bar',
          tabStopWidth:    settings['terminal.integrated.tabStopWidth'] as number ?? 8,
          fontLigatures:   settings['terminal.integrated.fontLigatures'] as boolean ?? false,
          mouseWheelZoom:  settings['terminal.integrated.mouseWheelZoom'] as boolean ?? false,
          
          cursorBlink:     settings['terminal.integrated.cursorBlink'] as boolean ?? true,
          cursorWidth:     settings['terminal.integrated.cursorWidth'] as number ?? 2,
          scrollback:      settings['terminal.integrated.scrollback'] as number ?? 10000,
          macOptionIsMeta: settings['terminal.integrated.macOptionIsMeta'] as boolean ?? true,
          rightClickSelectsWord: settings['terminal.integrated.rightClickSelectsWord'] as boolean ?? false,
          fastScrollModifier:    settings['terminal.integrated.fastScrollModifier'] as 'alt' | 'ctrl' | 'shift' ?? 'alt',
        }
      );
      adapterRef.current = adapter;

      // 4. Start process
      await proc.start();

      if (!alive) { proc.kill(); adapter.dispose(); return; }

      // 5. Init xterm UI
      await adapter.init();

      // Android Default Menu Block
      containerRef.current?.addEventListener('contextmenu', (e) => e.preventDefault());

      // SELECTION HANDLER WITH DEBOUNCE (Double-Click Delay Fix)
      let selTimeout: any;
      adapter.xtermInstance?.onSelectionChange(() => {
        clearTimeout(selTimeout);
        
        // 100ms wait for dbl click selection
        selTimeout = setTimeout(() => {
          const text = adapter.getSelection();
          if (!text || text.trim() === '') {
            setSelection(null);
            return;
          }

          const m = adapter.getSelectionMetrics();
          if (!m || m.cellW === 0) return;

          const PADDING = 10;
          const startX = (m.startColumn * m.cellW) + PADDING;
          const startY = (m.startRow * m.cellH) + PADDING;
          const endX   = (m.endColumn * m.cellW) + PADDING;
          const endY   = ((m.endRow + 1) * m.cellH) + PADDING;

          setSelection({ text, startX, startY, endX, endY });
        }, 100); 
      });

      // 6. Track process events
      proc.on(event => {
        if (event.type === 'ready') updateInstance(terminalId, { status: 'ready' });
        if (event.type === 'exit') updateInstance(terminalId, { status: 'exited', exitCode: event.code });
        if (event.type === 'error') updateInstance(terminalId, { status: 'error' });
      });

      updateInstance(terminalId, { pid: proc.pid });
    };

    boot().catch(err => {
      console.error('[useTerminalInstance] boot failed:', err);
      updateInstance(terminalId, { status: 'error' });
    });

    return () => {
      alive = false;
      terminalProcessRegistry.unregister(instance.id);
      if (processRef.current) {
         processRef.current.kill();
         processRef.current = null;
      }
      if (adapterRef.current) {
         adapterRef.current = null;
      }
      if (containerRef.current) {
         containerRef.current.innerHTML = '';
      }
    };
  }, []);

  // ── Theme sync ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!adapterRef.current) return;
    const isLight = settings['workbench.theme'] === 'vs-light';
    adapterRef.current.setTheme(isLight ? LIGHT_XTERM_THEME : DARK_XTERM_THEME);
  }, [settings['workbench.theme']]);

  // Terminal Settings Sync ────────────────────────────────────────────────
  useEffect(() => {
    if (adapterRef.current) {
      adapterRef.current.updateSettings({
        fontSize:        settings['terminal.integrated.fontSize'] as number ?? settings['editor.fontSize'] as number,
        fontFamily:      settings['terminal.integrated.fontFamily'] as string || settings['editor.fontFamily'] as string,
        fontWeight:      settings['terminal.integrated.fontWeight'] as any,
        letterSpacing:   settings['terminal.integrated.letterSpacing'] as number,
        cursorStyle:     settings['terminal.integrated.cursorStyle'] as any,
        tabStopWidth:    settings['terminal.integrated.tabStopWidth'] as number,
        fontLigatures:   settings['terminal.integrated.fontLigatures'] as boolean,
        mouseWheelZoom:  settings['terminal.integrated.mouseWheelZoom'] as boolean,
        
        cursorBlink:     settings['terminal.integrated.cursorBlink'] as boolean,
        cursorWidth:     settings['terminal.integrated.cursorWidth'] as number,
        scrollback:      settings['terminal.integrated.scrollback'] as number,
        macOptionIsMeta: settings['terminal.integrated.macOptionIsMeta'] as boolean,
        rightClickSelectsWord: settings['terminal.integrated.rightClickSelectsWord'] as boolean,
        fastScrollModifier:    settings['terminal.integrated.fastScrollModifier'] as 'alt' | 'ctrl' | 'shift',
      });
    }
  }, [
    settings['terminal.integrated.fontSize'],
    settings['editor.fontSize'],
    settings['terminal.integrated.fontFamily'],
    settings['editor.fontFamily'],
    settings['terminal.integrated.fontWeight'],
    settings['terminal.integrated.letterSpacing'],
    settings['terminal.integrated.cursorStyle'],
    settings['terminal.integrated.tabStopWidth'],
    settings['terminal.integrated.fontLigatures'],
    settings['terminal.integrated.mouseWheelZoom'],
    
    settings['terminal.integrated.cursorBlink'],
    settings['terminal.integrated.cursorWidth'],
    settings['terminal.integrated.scrollback'],
    settings['terminal.integrated.macOptionIsMeta'],
    settings['terminal.integrated.rightClickSelectsWord'],
    settings['terminal.integrated.fastScrollModifier']
  ]);

  // Copy/Paste Actions ───────────────────────────────────────────────
  const handleCopy = useCallback(async () => {
  if (selection?.text) {
    await Clipboard.write({ string: selection.text });
    adapterRef.current?.clearSelection();
    setSelection(null);
  }
}, [selection]);

// Paste Action
const handlePaste = useCallback(async () => {
  try {
    const { value } = await Clipboard.read();
    if (value && processRef.current) {
      processRef.current.write(value);
    }
  } catch (err) {
    console.error("Paste failed", err);
  }
}, []);

  // ── Public ────────────────────────────────────────────────────────────────

  const focus = useCallback(() => adapterRef.current?.focus(), []);
  const clear = useCallback(() => adapterRef.current?.clear(), []);
  const fit   = useCallback(() => adapterRef.current?.fit(),   []);

  const findNext     = useCallback((t: string) => adapterRef.current?.findNext(t)     ?? false, []);
  const findPrevious = useCallback((t: string) => adapterRef.current?.findPrevious(t) ?? false, []);

  return { containerRef, focus, clear, fit, findNext, findPrevious, selection, handleCopy, handlePaste };
}