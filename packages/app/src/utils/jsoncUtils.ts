// src/utils/jsoncUtils.ts
import { settingsRegistry } from '@/features/settings/config/settingsSchema';

/**
 * Generates a JSONC string containing settings with VS Code style documentation comments.
 */
export const generateSettingsJSONC = (userSettings: Record<string, any>): string => {
  let jsonc = '{\n';
  const keys = Object.keys(userSettings);

  keys.forEach((key, index) => {
    // Extract metadata descriptions from the registry configuration schema
    const schema = settingsRegistry.find(s => s.id === key);
    
    if (schema) {
      // Prioritize markdown description fallback to regular description strings safely
      const descText = schema.markdownDescription || schema.description || '';
      
      if (descText) {
        jsonc += `  // ${descText.replace(/\n/g, '\n  // ')}\n`;
      }
      
      // Inject list of all available enum or predefined selection values if present
      if (schema.options && schema.options.length > 0) {
        schema.options.forEach(opt => {
          jsonc += `  //  - ${opt.value}: ${opt.label}\n`;
        });
      }
    } else {
      jsonc += `  // Unknown configuration setting\n`;
    }

    // Append key-value configurations
    jsonc += `  "${key}": ${JSON.stringify(userSettings[key])}`;
    
    // Append trailing comma unless processing the final item sequence boundary
    if (index < keys.length - 1) jsonc += ',';
    jsonc += '\n\n';
  });

  jsonc += '}\n';
  return jsonc;
};

/**
 * Parses JSONC strings into safe records by stripping block or inline comments.
 */
export const parseJSONC = (jsoncString: string): Record<string, any> => {
  try {
    const cleanJson = jsoncString.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m);
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("JSONC Parse Error:", e);
    return {};
  }
};
