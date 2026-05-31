// src/features/terminal/core/XtermAdapter.ts
//
// Sets up an xterm.js Terminal instance with addons and connects it
// to a TerminalProcess.
//
// Why a separate adapter?
//   - xterm.js is an optional dependency (may not be installed yet)
//   - Addon loading is async and messy — centralize it here
//   - Swap to AnsiParser fallback cleanly if xterm unavailable
//
// Usage:
//   const adapter = new XtermAdapter(containerEl, process, theme);
//   await adapter.init();
//   // later:
//   adapter.dispose();


import type { TerminalProcess } from './TerminalProcess';

// ─── Theme Type ───────────────────────────────────────────────────────────────

export interface XtermTheme {
  background:   string;
  foreground:   string;
  cursor:       string;
  selectionBg:  string;
  black:        string;  red:   string;  green:  string;  yellow: string;
  blue:         string;  magenta: string; cyan:  string;  white:  string;
  brightBlack:  string;  brightRed: string;  brightGreen: string;
  brightYellow: string;  brightBlue: string; brightMagenta: string;
  brightCyan:   string;  brightWhite: string;
}

export const DARK_XTERM_THEME: XtermTheme = {
  background:     '#1e1e1e',  foreground:     '#d4d4d4',
  cursor:         '#d4d4d4',  selectionBg:    '#264f78',
  black:          '#1e1e1e',  red:          '#f44747',
  green:          '#4ec9b0',  yellow:       '#dcdcaa',
  blue:           '#569cd6',  magenta:      '#c586c0',
  cyan:           '#9cdcfe',  white:        '#d4d4d4',
  brightBlack:    '#808080',  brightRed:    '#f44747',
  brightGreen:    '#4ec9b0',  brightYellow: '#dcdcaa',
  brightBlue:     '#569cd6',  brightMagenta:'#c586c0',
  brightCyan:     '#9cdcfe',  brightWhite:  '#ffffff',
};

export const LIGHT_XTERM_THEME: XtermTheme = {
  background:     '#ffffff',  foreground:     '#1e1e1e',
  cursor:         '#1e1e1e',  selectionBg:    '#add6ff',
  black:          '#000000',  red:          '#cd3131',
  green:          '#107c10',  yellow:       '#949800',
  blue:           '#0070c1',  magenta:      '#bc05bc',
  cyan:           '#0070c1',  white:        '#555555',
  brightBlack:    '#666666',  brightRed:    '#f14c4c',
  brightGreen:    '#23d18b',  brightYellow: '#f5f543',
  brightBlue:     '#3b8eea',  brightMagenta:'#d670d6',
  brightCyan:     '#29b8db',  brightWhite:  '#e5e5e5',
};

// ─── Settings Options Type ────────────────────────────────────────────────────
export interface TerminalOptions {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | number;
  letterSpacing?: number;
  tabStopWidth?: number;
  cursorStyle?: 'block' | 'underline' | 'bar';
  fontLigatures?: boolean;
  mouseWheelZoom?: boolean;
  
  cursorBlink?: boolean;
  cursorWidth?: number;
  scrollback?: number;
  macOptionIsMeta?: boolean;
  rightClickSelectsWord?: boolean;
  fastScrollModifier?: 'alt' | 'ctrl' | 'shift';
}

// ─── XtermAdapter ─────────────────────────────────────────────────────────────

export class XtermAdapter {
  private xterm:          any = null; // xterm.Terminal
  private fitAddon:       any = null;
  private webglAddon:     any = null;
  private searchAddon:    any = null;
  private webLinksAddon:  any = null;
  private ligaturesAddon: any = null;

  private disposables: Array<{ dispose(): void }> = [];
  private resizeObserver?: ResizeObserver;
  private _fitTimer: any = null;

  private container: HTMLElement;
  private process:   TerminalProcess;
  private theme:     XtermTheme;
  public  options:   TerminalOptions;

  constructor(
    container: HTMLElement,
    process:   TerminalProcess,
    theme:     XtermTheme = DARK_XTERM_THEME,
    options:   TerminalOptions = {}
  ) {
    this.container = container;
    this.process   = process;
    this.theme     = theme;
    this.options   = {
      fontSize: 13,
      fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
      fontWeight: 'normal',
      letterSpacing: 0,
      cursorStyle: 'bar',
      tabStopWidth: 8,
      fontLigatures: false,
      mouseWheelZoom: false,
      cursorBlink: true,
      cursorWidth: 2,
      scrollback: 10000,
      macOptionIsMeta: true,
      rightClickSelectsWord: false,
      fastScrollModifier: 'alt',
      ...options
    };
  }

  // ── init ───────────────────────────────────────────────────────────────────

  async init(): Promise<void> {
    let TerminalClass: any;
    try {
      const mod = await import('@xterm/xterm');
      TerminalClass = mod.Terminal;
    } catch {
      console.warn('[XtermAdapter] @xterm/xterm not installed — using fallback renderer');
      this._initFallback();
      return;
    }

    this.xterm = new TerminalClass({
      theme:          this._mapTheme(),
      fontFamily:     this.options.fontFamily,
      fontSize:       this.options.fontSize,
      fontWeight:     this.options.fontWeight,
      letterSpacing:  this.options.letterSpacing,
      tabStopWidth:   this.options.tabStopWidth,
      cursorStyle:    this.options.cursorStyle,
      cursorBlink:    this.options.cursorBlink,
      cursorWidth:    this.options.cursorWidth,
      scrollback:     this.options.scrollback,
      macOptionIsMeta:       this.options.macOptionIsMeta,
      rightClickSelectsWord: this.options.rightClickSelectsWord,
      fastScrollModifier:    this.options.fastScrollModifier,
      
      allowProposedApi:      true,
      allowTransparency:     false,
      convertEol:            true,
      disableStdin:          false,
      logLevel: 'off',
    });

    await this._loadAddons();

    this.xterm.open(this.container);

    setTimeout(() => this.fitAddon?.fit(), 50);

    this._connectProcess();
    this._setupResizeObserver();
    this._setupMouseWheelZoom();
    this._setupTouchScrolling();
  }

  private async _loadAddons(): Promise<void> {
    const results = await Promise.allSettled([
      import('@xterm/addon-fit'),
      import('@xterm/addon-webgl'),
      import('@xterm/addon-search'),
      import('@xterm/addon-web-links'),
    ]);

    if (results[0].status === 'fulfilled') {
      this.fitAddon = new results[0].value.FitAddon();
      this.xterm.loadAddon(this.fitAddon);
    }

    if (results[1].status === 'fulfilled') {
      try {
        this.webglAddon = new results[1].value.WebglAddon();
        this.webglAddon.onContextLoss(() => {
          this.webglAddon?.dispose();
          this.webglAddon = null;
        });
        this.xterm.loadAddon(this.webglAddon);
      } catch {}
    }

    if (results[2].status === 'fulfilled') {
      this.searchAddon = new results[2].value.SearchAddon();
      this.xterm.loadAddon(this.searchAddon);
    }

    if (results[3].status === 'fulfilled') {
      this.webLinksAddon = new results[3].value.WebLinksAddon();
      this.xterm.loadAddon(this.webLinksAddon);
    }

    if (this.options.fontLigatures) {
      await this._enableLigatures();
    }
  }

  private async _enableLigatures() {
    try {
      if (!this.ligaturesAddon) {
        const mod = await import('@xterm/addon-ligatures');
        this.ligaturesAddon = new mod.LigaturesAddon();
        this.xterm.loadAddon(this.ligaturesAddon);
      }
    } catch (e) {
      console.warn('[XtermAdapter] Failed to load font ligatures addon', e);
    }
  }

  private _disableLigatures() {
    if (this.ligaturesAddon) {
      this.ligaturesAddon.dispose();
      this.ligaturesAddon = null;
    }
  }

  private _connectProcess(): void {
    const offData = this.process.on((event) => {
      if (event.type === 'data') this.xterm.write(event.data);
      if (event.type === 'exit') {
        this.xterm.write(`\r\n\x1b[2m[Process exited with code ${event.code}]\x1b[0m\r\n`);
      }
    });
    this.disposables.push({ dispose: offData });

    const onData = this.xterm.onData((data: string) => this.process.write(data));
    this.disposables.push(onData);

    const onResize = this.xterm.onResize(({ cols, rows }: { cols: number; rows: number }) => {
      this.process.resize(cols, rows);
    });
    this.disposables.push(onResize);
  }

  private _setupResizeObserver(): void {
    if (!this.fitAddon) return;

    const doFit = () => {
      clearTimeout(this._fitTimer);
      this._fitTimer = setTimeout(() => {
        try { 
          this.fitAddon?.fit(); 
          if (this.xterm && this.xterm.cols && this.xterm.rows) {
            this.process.resize(this.xterm.cols, this.xterm.rows);
          }
        } catch (e) {}
      }, 40);
    };

    this.resizeObserver = new ResizeObserver(doFit);
    this.resizeObserver.observe(this.container);

    const onWindowResize = () => {
      doFit();
      setTimeout(doFit, 150);
      setTimeout(doFit, 300);
      setTimeout(doFit, 500); 
    };
    
    window.addEventListener('resize', onWindowResize);
    this.disposables.push({ dispose: () => window.removeEventListener('resize', onWindowResize) });
  }

  private _onWheel = (e: WheelEvent) => {
    if (!this.options.mouseWheelZoom) return;
    
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const currentSize = this.options.fontSize || 13;
      const newSize = e.deltaY > 0 ? Math.max(6, currentSize - 1) : Math.min(100, currentSize + 1);
      
      this.updateSettings({ fontSize: newSize });
    }
  };

  private _setupMouseWheelZoom() {
    this.container.addEventListener('wheel', this._onWheel, { passive: false });
    this.disposables.push({
      dispose: () => this.container.removeEventListener('wheel', this._onWheel)
    });
  }
  
  // Programmatic Touch Scrolling for Web/Mobile
  private _setupTouchScrolling() {
    let lastY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        lastY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // Preventing Browser Default "Pull-to-refresh" or Page Bounce 
        e.preventDefault(); 
        
        const currentY = e.touches[0].clientY;
        const deltaY = lastY - currentY; // Positive => Up Swipe
        
        const lineHeight = (this.options.fontSize || 14) * 1.2;

        if (Math.abs(deltaY) >= lineHeight) {
          const linesToScroll = Math.trunc(deltaY / lineHeight);
          
          if (this.xterm) {
            this.xterm.scrollLines(linesToScroll);
          }
          
          lastY -= (linesToScroll * lineHeight);
        }
      }
    };

    this.container.addEventListener('touchstart', onTouchStart, { passive: true });
    this.container.addEventListener('touchmove', onTouchMove, { passive: false });

    // Memory Leak Prevent during Dispose 
    this.disposables.push({
      dispose: () => {
        this.container.removeEventListener('touchstart', onTouchStart);
        this.container.removeEventListener('touchmove', onTouchMove);
      }
    });
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  focus(): void { this.xterm?.focus(); }
  blur():  void { this.xterm?.blur(); }

  fit(): void {
    this.fitAddon?.fit();
  }

  findNext(term: string): boolean {
    return this.searchAddon?.findNext(term, { incremental: true }) ?? false;
  }

  findPrevious(term: string): boolean {
    return this.searchAddon?.findPrevious(term) ?? false;
  }

  clear(): void {
    this.xterm?.clear();
  }

  setTheme(theme: XtermTheme): void {
    this.theme = theme;
    this.xterm?.options.setOption('theme', this._mapTheme());
  }

  // Update Settings Dynamically
  public async updateSettings(settings: Partial<TerminalOptions>) {
    if (!this.xterm) return;

    this.options = { ...this.options, ...settings };

    // Apply all settings directly to xterm.options
    if (settings.fontSize !== undefined) this.xterm.options.fontSize = settings.fontSize;
    if (settings.fontFamily !== undefined) this.xterm.options.fontFamily = settings.fontFamily;
    if (settings.fontWeight !== undefined) this.xterm.options.fontWeight = settings.fontWeight;
    if (settings.letterSpacing !== undefined) this.xterm.options.letterSpacing = settings.letterSpacing;
    if (settings.cursorStyle !== undefined) this.xterm.options.cursorStyle = settings.cursorStyle;
    if (settings.tabStopWidth !== undefined) this.xterm.options.tabStopWidth = settings.tabStopWidth;
    if (settings.cursorBlink !== undefined) this.xterm.options.cursorBlink = settings.cursorBlink;
    if (settings.cursorWidth !== undefined) this.xterm.options.cursorWidth = settings.cursorWidth;
    if (settings.scrollback !== undefined) this.xterm.options.scrollback = settings.scrollback;
    if (settings.macOptionIsMeta !== undefined) this.xterm.options.macOptionIsMeta = settings.macOptionIsMeta;
    if (settings.rightClickSelectsWord !== undefined) this.xterm.options.rightClickSelectsWord = settings.rightClickSelectsWord;
    if (settings.fastScrollModifier !== undefined) this.xterm.options.fastScrollModifier = settings.fastScrollModifier;

    // Font Ligatures toggle
    if (settings.fontLigatures !== undefined) {
      if (settings.fontLigatures) {
        await this._enableLigatures();
      } else {
        this._disableLigatures();
      }
    }

    this.fit();
  }
  
  // Add these inside XtermAdapter class (Before dispose method)

  public get xtermInstance() {
    return this.xterm;
  }

  public getSelection(): string {
    return this.xterm?.getSelection() || '';
  }

  public clearSelection(): void {
    this.xterm?.clearSelection();
  }

  // Safe Metric Calculation for WebGL & Canvas
  public getSelectionMetrics() {
    if (!this.xterm) return null;
    
    const pos = this.xterm.getSelectionPosition();
    if (!pos) return null;

    const core = (this.xterm as any)._core;
    let cellW = 8;
    let cellH = 16;

    // Safety fallback: যদি WebGL অ্যাডন সেল ডাইমেনশন লুকিয়ে ফেলে, তবে কন্টেইনার থেকে ভাগ করে নেবে
    try {
      if (core?._renderService?.dimensions?.css?.cell?.width) {
        cellW = core._renderService.dimensions.css.cell.width;
        cellH = core._renderService.dimensions.css.cell.height;
      } else if (this.container.clientWidth && this.xterm.cols) {
        cellW = this.container.clientWidth / this.xterm.cols;
        cellH = this.container.clientHeight / this.xterm.rows;
      }
    } catch(e) {}

    const viewportY = this.xterm.buffer.active.viewportY;

    return {
      startColumn: pos.startColumn,
      startRow: pos.startRow - viewportY,
      endColumn: pos.endColumn,
      endRow: pos.endRow - viewportY,
      cellW,
      cellH
    };
  }

  dispose(): void {
    clearTimeout(this._fitTimer);
    this.resizeObserver?.disconnect();
    this.disposables.forEach(d => d.dispose());
    
    this._disableLigatures();
    this.webglAddon?.dispose();
    this.searchAddon?.dispose();
    this.webLinksAddon?.dispose();
    this.fitAddon?.dispose();
    this.xterm?.dispose();
    
    this.xterm = null;
  }

  private _initFallback(): void {
    const fontFam = this.options.fontFamily || "'Fira Code', 'Cascadia Code', Consolas, monospace";
    const fontSz  = this.options.fontSize || 13;

    this.container.style.cssText = `
      background: ${this.theme.background};
      color:      ${this.theme.foreground};
      font-family: ${fontFam};
      font-size:   ${fontSz}px;
      padding:     10px;
      overflow-y:  auto;
      height:      100%;
      box-sizing:  border-box;
      white-space: pre-wrap;
    `;

    const offData = this.process.on((event) => {
      if (event.type === 'data') {
        const clean = event.data
          .replace(/\x1b\[[0-9;]*m/g, '')
          .replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');
        this.container.textContent += clean;
        this.container.scrollTop = this.container.scrollHeight;
      }
    });
    this.disposables.push({ dispose: offData });
  }

  private _mapTheme() {
    return {
      background: this.theme.background,
      foreground: this.theme.foreground,
      cursor: this.theme.cursor,
      selectionBackground: this.theme.selectionBg,
      black: this.theme.black,
      red: this.theme.red,
      green: this.theme.green,
      yellow: this.theme.yellow,
      blue: this.theme.blue,
      magenta: this.theme.magenta,
      cyan: this.theme.cyan,
      white: this.theme.white,
      brightBlack: this.theme.brightBlack,
      brightRed: this.theme.brightRed,
      brightGreen: this.theme.brightGreen,
      brightYellow: this.theme.brightYellow,
      brightBlue: this.theme.brightBlue,
      brightMagenta: this.theme.brightMagenta,
      brightCyan: this.theme.brightCyan,
      brightWhite: this.theme.brightWhite,
    };
  }
}