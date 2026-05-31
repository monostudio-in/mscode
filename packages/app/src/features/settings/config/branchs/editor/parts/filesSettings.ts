// src/features/settings/config/branchs/editor/parts/filesSettings.ts

import type { IConfigurationSection } from '@/core/extensionAPI/registry/configurationRegistry';

export const filesProperties: IConfigurationSection['properties'] = {

  'files.autoSave': {
    title: 'Auto Save',
    type: 'select',
    subCategory: 'Files',
    defaultValue: 'off',
    order: 1,
    tags: ['files', 'save', 'autosave'],
    markdownDescription: 'Controls auto save of dirty editors. \n\n' +
      '- `off`: A dirty editor is never automatically saved.\n' +
      '- `afterDelay`: A dirty editor is automatically saved after the configured `#files.autoSaveDelay#`.\n' +
      '- `onFocusChange`: A dirty editor is automatically saved when the editor loses focus.\n' +
      '- `onWindowChange`: A dirty editor is automatically saved when the window loses focus.',
    enum: ['off', 'afterDelay', 'onFocusChange', 'onWindowChange'],
    enumItemLabels: ['Off', 'After Delay', 'On Focus Change', 'On Window Change'],
  },

  'files.autoSaveDelay': {
    title: 'Auto Save Delay',
    type: 'number',
    subCategory: 'Files',
    defaultValue: 1000,
    minimum: 0,
    order: 2,
    tags: ['files', 'save', 'delay'],
    markdownDescription: 'Controls the delay in milliseconds after which a dirty editor is saved automatically. Only applies when `#files.autoSave#` is set to `afterDelay`.',
  },

  'files.encoding': {
    title: 'Encoding',
    type: 'select',
    subCategory: 'Files',
    defaultValue: 'utf-8',
    order: 3,
    tags: ['files', 'encoding', 'charset'],
    markdownDescription: 'The default character set encoding to use when reading and writing files.',
    // 🌟 THE MAGIC: সব এনকোডিং ডেটা এখন শুধুমাত্র এখানেই থাকবে!
    enum: [
      'utf-8', 'utf-16le', 'utf-16be', 'windows-1252', 'iso-8859-1', 'iso-8859-15', 'macintosh', 'ascii', 
      'windows-1251', 'iso-8859-5', 'koi8-r', 'koi8-u', 'windows-1250', 'iso-8859-2', 
      'shift_jis', 'euc-jp', 'gbk', 'gb18030', 'big5', 'euc-kr', 
      'windows-1256', 'iso-8859-6', 'windows-1255', 'windows-1254', 'windows-1258', 'tis-620'
    ],
    enumItemLabels: [
      'UTF-8', 'UTF-16 LE', 'UTF-16 BE', 'Windows 1252', 'ISO 8859-1', 'ISO 8859-15', 'macOS Roman', 'ASCII', 
      'Windows 1251', 'ISO 8859-5', 'KOI8-R', 'KOI8-U', 'Windows 1250', 'ISO 8859-2', 
      'Shift JIS', 'EUC-JP', 'GBK', 'GB18030', 'Big5', 'EUC-KR', 
      'Windows 1256', 'ISO 8859-6', 'Windows 1255', 'Windows 1254', 'Windows 1258', 'TIS-620'
    ],
    enumDescriptions: [
      'Universal / Web Default', 'Little Endian', 'Big Endian', 'Western European', 'Western', 'Western (with Euro)', 'Legacy Mac', 'Basic English', 
      'Cyrillic', 'Cyrillic', 'Russian', 'Ukrainian', 'Central European', 'Central European', 
      'Japanese', 'Japanese', 'Simplified Chinese', 'Simplified Chinese', 'Traditional Chinese', 'Korean', 
      'Arabic', 'Arabic', 'Hebrew', 'Turkish', 'Vietnamese', 'Thai'
    ],
  },

  'files.eol': {
    title: 'End of Line (EOL)',
    type: 'select',
    subCategory: 'Files',
    defaultValue: 'auto',
    order: 4,
    tags: ['files', 'eol', 'line ending'],
    markdownDescription: 'The default end of line character. \n\n' +
      '- `auto`: Uses operating system specific end of line character.\n' +
      '- `\\n`: Uses LF as the end of line character (Linux/macOS).\n' +
      '- `\\r\\n`: Uses CRLF as the end of line character (Windows).',
    enum: ['auto', '\n', '\r\n'],
    enumItemLabels: ['Auto', '\\n (LF)', '\\r\\n (CRLF)'],
  },

  'files.trimTrailingWhitespace': {
    title: 'Trim Trailing Whitespace',
    type: 'boolean',
    subCategory: 'Files',
    defaultValue: false,
    order: 5,
    tags: ['files', 'format', 'whitespace'],
    markdownDescription: 'When enabled, will trim trailing whitespace when saving a file.',
  }
};