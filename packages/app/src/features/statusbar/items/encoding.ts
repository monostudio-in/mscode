// src/features/statusbar/items/encoding.ts

import * as monaco from 'monaco-editor';
import { usePaletteStore, type QuickPickItem } from '@/store/paletteStore';
import { useStatusBarStore } from '../store/statusBarStore';
import { useEditorViewStateStore } from '@/features/editor/store/editorViewStateStore';
import { configRegistry } from '@/core/extensionAPI/registry/configurationRegistry';
import { useSettingsStore } from '@/features/settings/store/settingsStore';

/**
 * Resolves the operational character encoding identifier mapped to an open tab context, 
 * falling back gracefully to the workspace configuration limits when undefined.
 * 
 * @param tabId Target workspace resource descriptor lookup string.
 * @returns Configured configuration string matching runtime fallback guidelines.
 */
export const getFileEncoding = (tabId: string): string => {
  const viewState = useEditorViewStateStore.getState().viewStates[tabId];
  const globalEncoding = useSettingsStore.getState().settings['files.encoding'] || 'utf-8';
  return viewState?.encoding || globalEncoding; 
};

/**
 * Transforms an raw text storage flag into a formatted display title 
 * determined by properties fetched from the registration catalog schemas.
 * 
 * @param tabId Target workspace resource descriptor lookup string.
 * @returns Canonical UI display presentation boundary label.
 */
export const getFileEncodingLabel = (tabId: string): string => {
  const val = getFileEncoding(tabId);
  const settingDef = configRegistry.getSetting('files.encoding');
  const idx = settingDef?.enum?.indexOf(val) ?? -1;
  return idx !== -1 ? (settingDef?.enumItemLabels?.[idx] || val.toUpperCase()) : val.toUpperCase();
};

/**
 * Displays a global option select menu containing every character encoding type 
 * supported inside the application workspace container pipeline architectures.
 * 
 * @param editor The operational Monaco code editor workspace container instance.
 */
export const handleEncodingClick = (editor: monaco.editor.IStandaloneCodeEditor): void => {
  const model = editor.getModel();
  if (!model) return;
  
  const currentPath = model.uri.path;
  const settingDef = configRegistry.getSetting('files.encoding');

  const encodings: QuickPickItem[] = (settingDef?.enum || []).map((val, idx) => ({
    id: String(val),
    label: settingDef?.enumItemLabels?.[idx] || String(val),
    description: settingDef?.enumDescriptions?.[idx] || '',
    onSelect: () => {
      const displayLabel = settingDef?.enumItemLabels?.[idx] || String(val).toUpperCase();
      
      useEditorViewStateStore.getState().updateViewState(currentPath, { encoding: String(val) });
      useStatusBarStore.getState().updateItem('encoding', { label: displayLabel });
    }
  }));

  usePaletteStore.getState().openQuickPick(
    'Select File Encoding to Save with', 
    encodings, 
    (selectedItem) => {
      if (selectedItem.onSelect) selectedItem.onSelect();
    }
  );
};
