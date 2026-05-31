// src/features/editor/hooks/statusbar/items/indent.ts

import * as monaco from 'monaco-editor';
import { usePaletteStore, type QuickPickItem } from '@/store/paletteStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { useTabStore } from '@/store/tabStore';
import { useEditorViewStateStore } from '@/features/editor/store/editorViewStateStore';

/**
 * Handles the click interaction on the status bar indentation item by rendering a command
 * palette selector menu for workspace tab layouts, text transformations, and formatting setups.
 * 
 * @param editor Operational Monaco code editor instance container context.
 */
export const handleIndentClick = (editor: monaco.editor.IStandaloneCodeEditor): void => {
  const model = editor.getModel();
  if (!model) return;

  const activeTabId = useTabStore.getState().activeTabId;
  const viewState = activeTabId ? useEditorViewStateStore.getState().viewStates[activeTabId] : null;
  const settings = useSettingsStore.getState().settings;

  const defaultTabSize = settings['editor.tabSize'] ?? 4;
  const defaultInsertSpaces = settings['editor.insertSpaces'] ?? true;

  const currentOptions = model.getOptions();
  const configuredTabSize = viewState?.tabSize ?? currentOptions.tabSize;
  const configuredInsertSpaces = viewState?.insertSpaces ?? currentOptions.insertSpaces;

  const openTabSizeSelector = (targetInsertSpaces: boolean) => {
    const sizes = [1, 2, 3, 4, 5, 6, 7, 8];
    
    const items: QuickPickItem[] = sizes.map(size => {
      const isDefault = size === defaultTabSize;
      const isConfigured = size === configuredTabSize && targetInsertSpaces === configuredInsertSpaces;

      let suffixText = '';
      if (isConfigured) suffixText += ' - configured';
      if (isDefault) suffixText += ' - default';

      return {
        id: `ts-${size}`,
        label: `${size}`,
        suffix: suffixText.trim(), 
        onSelect: () => {
          model.updateOptions({ tabSize: size, insertSpaces: targetInsertSpaces });
          
          if (activeTabId) {
            useEditorViewStateStore.getState().updateViewState(activeTabId, {
              tabSize: size,
              insertSpaces: targetInsertSpaces
            });
          }
        }
      };
    });

    setTimeout(() => {
      usePaletteStore.getState().openQuickPick(
        'Select Tab Size for Current File',
        items,
        (selected) => { if (selected.onSelect) selected.onSelect(); }
      );
    }, 50); 
  };

  const mainItems: QuickPickItem[] = [
    { 
      id: 'indent-spaces', 
      label: 'Indent Using Spaces', 
      description: 'change view', 
      onSelect: () => openTabSizeSelector(true) 
    },
    { 
      id: 'indent-tabs', 
      label: 'Indent Using Tabs', 
      description: 'change view', 
      onSelect: () => openTabSizeSelector(false) 
    },
    { 
      id: 'change-view', 
      label: 'Change Tab Display Size', 
      description: 'change view', 
      onSelect: () => openTabSizeSelector(configuredInsertSpaces) 
    },
    { 
      id: 'sep-indent', 
      type: 'separator', 
      label: '' 
    },
    { 
      id: 'detect-indent', 
      label: 'Detect Indentation from Content', 
      description: 'convert file', 
      onSelect: () => model.detectIndentation(defaultInsertSpaces, defaultTabSize) 
    },
    { 
      id: 'convert-spaces', 
      label: 'Convert Indentation to Spaces', 
      description: 'convert file', 
      onSelect: () => {
        model.updateOptions({ insertSpaces: true });
        editor.trigger('source', 'editor.action.indentationToSpaces', null);
      }
    },
    { 
      id: 'convert-tabs', 
      label: 'Convert Indentation to Tabs', 
      description: 'convert file', 
      onSelect: () => {
        model.updateOptions({ insertSpaces: false });
        editor.trigger('source', 'editor.action.indentationToTabs', null);
      }
    },
    { 
      id: 'trim-whitespace', 
      label: 'Trim Trailing Whitespace', 
      onSelect: () => editor.trigger('source', 'editor.action.trimTrailingWhitespace', null) 
    }
  ];

  usePaletteStore.getState().openQuickPick('Select Action', mainItems, (selected) => {
    if (selected.onSelect) selected.onSelect();
  });
};
