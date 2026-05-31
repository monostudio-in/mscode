import * as monaco from 'monaco-editor';
import { usePaletteStore, type QuickPickItem } from '@/store/paletteStore';
import { useStatusBarStore } from '../store/statusBarStore';
import { configRegistry } from '@/core/extensionAPI/registry/configurationRegistry';

export const handleEOLClick = (editor: monaco.editor.IStandaloneCodeEditor) => {
  const model = editor.getModel();
  if (!model) return;

  const currentEOL = model.getEOL(); 
  
  // Dynamic Data load from Settings Registry
  const settingDef = configRegistry.getSetting('files.eol');

  const items: QuickPickItem[] = (settingDef?.enum || []).map((val, idx) => {
    const label = settingDef?.enumItemLabels?.[idx] || String(val);
    
    // Check if it's the currently active EOL
    let isCurrent = false;
    if (val === '\n' && currentEOL === '\n') isCurrent = true;
    if (val === '\r\n' && currentEOL === '\r\n') isCurrent = true;

    return { 
      id: String(val), 
      label: label, 
      suffix: isCurrent ? ' - current' : '',
      onSelect: () => {
        if (val === '\n') {
            model.setEOL(monaco.editor.EndOfLineSequence.LF);
            useStatusBarStore.getState().updateItem('eol', { label: 'LF' });
        } else if (val === '\r\n') {
            model.setEOL(monaco.editor.EndOfLineSequence.CRLF);
            useStatusBarStore.getState().updateItem('eol', { label: 'CRLF' });
        }
      }
    };
  });

  setTimeout(() => {
    usePaletteStore.getState().openQuickPick(
      'Select End of Line Sequence', 
      items, 
      (selected) => { if (selected.onSelect) selected.onSelect(); }
    );
  }, 50);
};