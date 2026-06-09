// src/core/bootstrap/tabRegistration.ts

import { tabRegistry } from '@/core/extensionAPI/registry/tabRegistry';

// ─── Import Core Views ───
import { MenuInspector } from '@/features/developer/components/MenuInspector/MenuInspector';
import { KeybindingsView } from '@/features/keybindings/KeybindingsView';
import { SettingsView } from '@/features/settings/SettingsView'; 
import { TermisPanel } from '@/features/termis/TermisPanel';
import { CodeEditor } from '@/features/editor';
import { DiffEditor } from '@/features/editor/components/DiffEditor/DiffEditor';
import { ExtensionDetailPage } from '@/features/extensions/detail/ExtensionDetailPage';

export function bootstrapTab() {
  
  // 1. Menu Page
  tabRegistry.registerTab('menus', MenuInspector);
  
  // 2. Core Editor Views
  tabRegistry.registerTab('code', CodeEditor);
  tabRegistry.registerTab('diff', DiffEditor);
  
  // 3. System Utility Views
  tabRegistry.registerTab('settings', SettingsView);
  tabRegistry.registerTab('keybindings', KeybindingsView);
  tabRegistry.registerTab('termis', TermisPanel);
  
  // 4. Extension Management
  tabRegistry.registerTab('extension', ExtensionDetailPage);
  
}