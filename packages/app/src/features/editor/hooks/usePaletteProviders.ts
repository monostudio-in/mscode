// src/features/editor/hooks/usePaletteProviders.ts

import { useEffect } from 'react';
import * as monaco from 'monaco-editor';
import { usePaletteStore } from '@/store/paletteStore';
import { commands } from '@/core/extensionAPI/registry/commandRegistry';
import { getSymbolIconName, getSymbolCategoryName } from '@/core/symbols/utils/iconMap';
import { getFlatSymbols, getActiveEditor } from '@/core/services/symbolService';
import { useRecentStore } from '@/store/recentStore';
import { useExplorerStore } from '@/features/explorer/store/exploreStore';
import { keybindingManager } from '@/core/keybindings/keybindingManager';

/**
 * Hook registering semantic search matching strategies to the central command palette.
 * Configures functional routing blocks for file rehydration, structural analysis jumping,
 * and contextual action executions.
 *
 * @param editor Root host code editor view structure context.
 */
export function usePaletteProviders(editor: any) {
  useEffect(() => {
    if (!editor) return;
    const { registerProvider } = usePaletteStore.getState();

    // ── 0. Default Orchestration Mode (Help & Routing Directory) ──
    registerProvider({
      prefix: '',
      name: 'Help & Menu',
      provideItems: (search) => {
        if (search.length > 0) return []; 
        const setQuery = usePaletteStore.getState().setQuery;

        return [
          {
            id: 'help-recent',
            label: 'Recent Opened Files/Folder',
            inlineDetail: '/',
            leftIcon: 'folder',
            keepOpen: true,
            onSelect: () => setQuery('/') 
          },
          {
            id: 'help-line',
            label: 'Go to Line/Column...',
            inlineDetail: ':',
            shortcut: 'Ctrl+G',
            leftIcon: 'arrow-right',
            keepOpen: true,
            onSelect: () => setQuery(':')
          },
          {
            id: 'help-symbol',
            label: 'Go to Symbol...',
            inlineDetail: '@',
            shortcut: 'Ctrl+Shift+O',
            leftIcon: 'symbol-method',
            keepOpen: true,
            onSelect: () => setQuery('@')
          },
          {
            id: 'help-symbol-cat',
            label: 'Go to Symbol by Category...',
            inlineDetail: '@:',
            leftIcon: 'symbol-class',
            keepOpen: true,
            onSelect: () => setQuery('@:')
          },
          {
            id: 'help-cmd',
            label: 'Show And Run Commands',
            inlineDetail: '>',
            shortcut: 'F1',
            leftIcon: 'terminal',
            keepOpen: true,
            onSelect: () => setQuery('>')
          }
        ];
      }
    });
    
    // ── 0.5. Historical Workspace Ingestion (/) ──
    registerProvider({
      prefix: '/',
      name: 'Recent Opened Files/Folder',
      provideItems: async (search) => {
        await useRecentStore.getState().loadRecents();
        const recents = useRecentStore.getState().recentWorkspaces;

        if (recents.length === 0) {
          return [{ id: 'no-recent', label: 'No recent workspaces found.', readonly: true } as any];
        }

        const normalizedSearch = search.toLowerCase();
        const items = recents
          .filter(w => w.name.toLowerCase().includes(normalizedSearch) || w.path.toLowerCase().includes(normalizedSearch))
          .map(w => ({
            id: `recent-${w.path}`,
            label: w.name,
            description: w.path,
            leftIcon: 'folder',
            onSelect: async () => {
              const { setWorkspace, triggerRefresh } = useExplorerStore.getState();
              setWorkspace(w.name, w.path);
              
              // Dynamically resolve sandboxed stores to mitigate early load race locks
              const { useTabStore } = await import('@/store/tabStore');
              const { useEditorViewStateStore } = await import('@/features/editor/store/editorViewStateStore');
              
              await useTabStore.getState().initTabs(w.path);
              await useEditorViewStateStore.getState().initViewStates(w.path);
              triggerRefresh();
            }
          }));

        items.push({ id: 'sep-clear', type: 'separator', label: '' } as any);
        items.push({
          id: 'clear-recent',
          label: 'Clear Recently Opened',
          leftIcon: 'close',
          onSelect: () => useRecentStore.getState().clearRecents()
        } as any);

        return items;
      }
    });

    // ── 1. Coordinate Point Matrix Locator (:) ──
    registerProvider({
      prefix: ':',
      name: 'Go to Line/Column',
      provideItems: (search) => {
        const activeEditor = getActiveEditor(editor);
        const model = activeEditor.getModel();
        const totalLines = model ? model.getLineCount() : 1;
        
        if (!search) {
          return [{ id: 'hint', label: `Type a line number to go to (from 1 to ${totalLines}).`, readonly: true } as any]; 
        }
        
        const parts = search.split(',');
        let line = parseInt(parts[0], 10);
        const col = parseInt(parts[1], 10) || 1;
        
        if (isNaN(line)) {
          return [{ id: 'error', label: 'Please type a valid line number.', readonly: true } as any];
        }
        
        if (line > totalLines) line = totalLines;
        if (line < 1) line = 1;
        
        return [{
          id: 'goto', 
          label: `Go to line ${line}${parts.length > 1 ? ` and column ${col}` : ''}`, 
          leftIcon: 'arrow-right',
          onFocus: () => {
            const lineContentLength = activeEditor.getModel()?.getLineLength(line) || 0;
            const range = new monaco.Range(line, 1, line, lineContentLength + 1);
            activeEditor.setSelection(range);
            activeEditor.revealRangeInCenterIfOutsideViewport(range); 
          },
          onSelect: () => { 
            activeEditor.setPosition({ lineNumber: line, column: col }); 
            activeEditor.revealLineInCenter(line); 
            activeEditor.focus(); 
          }
        }];
      }
    });

    // ── 2. Structural Lexical Symbols (@) ──
    registerProvider({
      prefix: '@',
      name: 'Go to Symbol',
      provideItems: async (search) => {
        const activeEditor = getActiveEditor(editor);
        const model = activeEditor.getModel();
        if (!model) return [];

        const symbols = await getFlatSymbols(model);
        const normalizedSearch = search.toLowerCase();
        
        return symbols
          .filter((s: any) => s.name.toLowerCase().includes(normalizedSearch))
          .map((s: any) => ({
            id: `sym-${s.name}-${s.range.startLineNumber}`,
            label: s.name,
            description: s.containerName ? `${s.containerName} (Ln ${s.range.startLineNumber})` : `Ln ${s.range.startLineNumber}`,
            leftIcon: getSymbolIconName(s.kind) as any,
            onFocus: () => {
              const range = new monaco.Range(s.range.startLineNumber, s.range.startColumn, s.range.endLineNumber, s.range.endColumn);
              activeEditor.setSelection(range);
              activeEditor.revealRangeInCenterIfOutsideViewport(range); 
            },
            onSelect: () => {
              activeEditor.setPosition({ lineNumber: s.range.startLineNumber, column: 1 });
              activeEditor.revealLineInCenter(s.range.startLineNumber);
              activeEditor.focus();
            }
          }));
      }
    });

    // ── 3. Categorized Structural Symbol Partitions (@:) ──
    registerProvider({
      prefix: '@:',
      name: 'Group Symbols by Category',
      provideItems: async (search) => {
        const activeEditor = getActiveEditor(editor);
        const model = activeEditor.getModel();
        if (!model) return [];

        const symbols = await getFlatSymbols(model);
        const normalizedSearch = search.toLowerCase();
        const filtered = symbols.filter((s: any) => s.name.toLowerCase().includes(normalizedSearch));

        const groups: Record<string, any[]> = {};
        filtered.forEach((s: any) => {
          const category = getSymbolCategoryName(s.kind);
          if (!groups[category]) groups[category] = [];
          groups[category].push(s);
        });

        const items: any[] = [];
        Object.keys(groups).sort().forEach(cat => {
          items.push({ id: `sep-${cat}`, type: 'separator', label: cat });
          groups[cat].forEach(s => {
            items.push({
              id: `cat-sym-${s.name}-${s.range.startLineNumber}`,
              label: s.name,
              description: s.containerName || `Ln ${s.range.startLineNumber}`,
              leftIcon: getSymbolIconName(s.kind) as any,
              indent: true,
              onFocus: () => {
                const range = new monaco.Range(s.range.startLineNumber, s.range.startColumn, s.range.endLineNumber, s.range.endColumn);
                activeEditor.setSelection(range);
                activeEditor.revealRangeInCenterIfOutsideViewport(range); 
              },
              onSelect: () => {
                activeEditor.setPosition({ lineNumber: s.range.startLineNumber, column: 1 });
                activeEditor.revealLineInCenter(s.range.startLineNumber);
                activeEditor.focus();
              }
            });
          });
        });

        return items;
      }
    });

    // ── 4. Global Registration Action Handlers (>) ──
    registerProvider({
      prefix: '>',
      name: 'Show and Run Commands',
      provideItems: (search) => {
        const activeEditor = getActiveEditor(editor);
        
        const customCommands = commands.getCommandsForPalette().map(cmd => ({
          id: cmd.id, 
          label: cmd.title || cmd.id, 
          description: cmd.category,  
          shortcut: keybindingManager.getShortcutLabel(cmd.id) || cmd.shortcut, 
          leftIcon: (cmd.icon as any) || 'terminal',
          onSelect: () => commands.executeCommand(cmd.id, activeEditor)
        }));

        const monacoActions = activeEditor.getActions().map((action: any) => {
          const defaultKb = activeEditor._standaloneKeybindingService?.lookupKeybinding(action.id)?.getLabel() || '';
          return {
            id: action.id, 
            label: action.label || action.id || 'Unknown Command', 
            shortcut: keybindingManager.getShortcutLabel(action.id) || defaultKb, 
            leftIcon: 'terminal', 
            onSelect: () => { action.run(); activeEditor.focus(); }
          };
        });

        const query = search ? search.toLowerCase() : '';

        return [...customCommands, ...monacoActions]
          .filter(c => {
            const lbl = (c.label || '').toLowerCase();
            const desc = (c.description || '').toLowerCase();
            return lbl.includes(query) || desc.includes(query);
          })
          .sort((a, b) => (a.label || '').localeCompare(b.label || '')); 
      }
    });

    return () => {};
  }, [editor]); 
}
