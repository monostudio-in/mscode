// src/features/statusbar/items/language.ts

import * as monaco from 'monaco-editor';
import { usePaletteStore, type QuickPickItem } from '@/store/paletteStore';
import { fileIconRegistry } from '@/core/extensionAPI/registry/FileIconRegistry';
import { useLanguageStore } from '@/store/languageStore';

/**
 * Handles the status bar language selection action, presenting an interactive list of
 * available language configurations to map over the active text model pipeline.
 * 
 * @param editor Operational Monaco code editor instance container context.
 */
export const handleLanguageClick = (editor: monaco.editor.IStandaloneCodeEditor): void => {
  const model = editor.getModel();
  if (!model) return;
  
  const currentLangId = model.getLanguageId() || 'plaintext';

  const items: QuickPickItem[] = [
    { 
      id: 'auto-detect', 
      label: 'Auto Detect', 
      leftIcon: 'wand', 
      onSelect: () => {
        const ext = '.' + model.uri.path.split('.').pop()?.toLowerCase();
        const langs = useLanguageStore.getState().languages; 
        
        const detectedLang = langs.find(l => l.extensions?.includes(ext));
        const targetLang = detectedLang ? detectedLang.id : 'plaintext';
        monaco.editor.setModelLanguage(model, targetLang);
      } 
    },
    { id: 'sep-lang', type: 'separator', label: '' }
  ];

  const availableLangs = useLanguageStore.getState().getAvailableLanguages();
  
  availableLangs.forEach(lang => {
    const langName = lang.aliases?.[0] || lang.id;
    
    const icon = (fileIconRegistry as any).getLanguageIcon 
      ? (fileIconRegistry as any).getLanguageIcon(lang.id) 
      : { type: 'class', value: 'ms-icon-default-file' };
    
    items.push({
      id: lang.id, 
      label: langName, 
      inlineDetail: `(${lang.id})`,
      suffix: lang.id === currentLangId ? ' - configured language' : undefined,
      iconClass: icon.type === 'class' ? `ms-file-icon ${icon.value}` : undefined,
      leftIcon: icon.type === 'image' ? 'code' : undefined,
      indent: true,
      onSelect: () => monaco.editor.setModelLanguage(model, lang.id)
    });
  });

  usePaletteStore.getState().openQuickPick('Select Language Mode', items, (sel) => {
    if (sel.onSelect) sel.onSelect();
  });
};
