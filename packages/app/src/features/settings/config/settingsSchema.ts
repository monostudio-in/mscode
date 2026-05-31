import { configRegistry } from '@/core/extensionAPI/registry/configurationRegistry';
import { editorSection } from './branchs/editor/editorSettings'; 
import { workbenchSection } from './branchs/workbench/workbenchSettings';
import { lspSection } from './branchs/lsp/lspSettings'; 
 import { gitSection }       from './branchs/git/gitSettings';   // ← NEW
 
export type { SettingDefinition, SettingType, SettingOption } from '@/core/extensionAPI/registry/configurationRegistry';

configRegistry.registerConfiguration(editorSection);
configRegistry.registerConfiguration(workbenchSection);
configRegistry.registerConfiguration(lspSection); 
configRegistry.registerConfiguration(gitSection);      

/**
 * Cached map layout representing total registered configuration properties compiled down across namespaces.
 */
export const settingsRegistry = configRegistry.getAllSettings();

/**
 * Re-evaluates defaults schemas mapped out dynamically by registration records to form standard initialization states.
 * 
 * @returns Flat key-value record holding baseline application parameter states.
 */
export const getDefaultSettings = (): Record<string, any> => configRegistry.getDefaults();


