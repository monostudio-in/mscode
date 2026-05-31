// src/features/settings/config/branchs/editor/parts/cursorSettings.ts
import type { IConfigurationSection } from '@/core/extensionAPI/registry/configurationRegistry';

export const cursorProperties: IConfigurationSection['properties'] = {

  'editor.cursorStyle': {
    title: 'Cursor Style',
    type: 'select',
    subCategory: 'Cursor',
    defaultValue: 'line',
    order: 1,
    tags: ['cursor'],
    description: 'Controls the cursor style.',
    enum: ['line', 'block', 'underline', 'line-thin', 'block-outline', 'underline-thin'],
    enumItemLabels: ['Line', 'Block', 'Underline', 'Line (thin)', 'Block outline', 'Underline (thin)'],
  },

  'editor.cursorBlinking': {
    title: 'Cursor Blinking',
    type: 'select',
    subCategory: 'Cursor',
    defaultValue: 'blink',
    order: 2,
    tags: ['cursor'],
    description: 'Controls the cursor animation style.',
    enum: ['blink', 'smooth', 'phase', 'expand', 'solid'],
    enumItemLabels: ['Blink', 'Smooth', 'Phase', 'Expand', 'Solid'],
    enumDescriptions: [
      'The editor cursor blinks.',
      'The editor cursor fades in and out smoothly.',
      'The editor cursor blinks with a phase shifting.',
      'The editor cursor expands and contracts.',
      'No cursor animation — always visible.',
    ],
  },

  'editor.cursorWidth': {
    title: 'Cursor Width',
    type: 'number',
    subCategory: 'Cursor',
    defaultValue: 2,
    minimum: 1,
    maximum: 10,
    order: 3,
    tags: ['cursor'],
    markdownDescription: 'Controls the width of the cursor when `#editor.cursorStyle#` is set to `line`.',
  },

  'editor.cursorSurroundingLines': {
    title: 'Cursor Surrounding Lines',
    type: 'number',
    subCategory: 'Cursor',
    defaultValue: 0,
    minimum: 0,
    maximum: 50,
    order: 4,
    tags: ['cursor', 'scroll'],
    markdownDescription: 'Controls the minimal number of visible leading and trailing lines (a.k.a. scroll margin or scrolloff) surrounding the cursor. Known as `scrollOff` or `scrollOffset` in some other editors.',
  },

  'editor.cursorSurroundingLinesStyle': {
    title: 'Cursor Surrounding Lines Style',
    type: 'select',
    subCategory: 'Cursor',
    defaultValue: 'default',
    order: 5,
    tags: ['cursor'],
    description: 'Controls when cursorSurroundingLines should be enforced.',
    enum: ['default', 'all'],
    enumItemLabels: ['Default', 'All'],
    enumDescriptions: [
      'cursorSurroundingLines is enforced only in the cursor movement commands.',
      'cursorSurroundingLines is enforced always.',
    ],
  },

  'editor.cursorSmoothCaretAnimation': {
    title: 'Cursor Smooth Caret Animation',
    type: 'select',
    subCategory: 'Cursor',
    defaultValue: 'off',
    order: 6,
    tags: ['cursor'],
    description: 'Controls whether the smooth caret animation should be enabled.',
    enum: ['off', 'explicit', 'on'],
    enumItemLabels: ['Off', 'Explicit', 'On'],
    enumDescriptions: [
      'Smooth caret animation is disabled.',
      'Smooth caret animation is enabled only when the user moves the cursor with an explicit gesture.',
      'Smooth caret animation is always enabled.',
    ],
  },

  'editor.multiCursorModifier': {
    title: 'Multi Cursor Modifier',
    type: 'select',
    subCategory: 'Cursor',
    defaultValue: 'alt',
    order: 7,
    tags: ['cursor', 'multicursor'],
    markdownDescription: 'The modifier to be used to add multiple cursors with the mouse. `ctrlCmd` maps to `Ctrl` on Windows/Linux and `Cmd` on macOS.',
    enum: ['ctrlCmd', 'alt'],
    enumItemLabels: ['Ctrl / Cmd', 'Alt'],
  },

  'editor.multiCursorPaste': {
    title: 'Multi Cursor Paste',
    type: 'select',
    subCategory: 'Cursor',
    defaultValue: 'spread',
    order: 8,
    tags: ['cursor', 'multicursor'],
    description: 'Controls pasting when the line count of the pasted text matches the cursor count.',
    enum: ['spread', 'full'],
    enumItemLabels: ['Spread', 'Full'],
    enumDescriptions: [
      'Each cursor pastes a single line of the text.',
      'Each cursor pastes the full text.',
    ],
  },

  'editor.multiCursorLimit': {
    title: 'Multi Cursor Limit',
    type: 'number',
    subCategory: 'Cursor',
    defaultValue: 10000,
    minimum: 1,
    maximum: 100000,
    order: 9,
    tags: ['cursor', 'multicursor'],
    markdownDescription: 'Controls the max number of cursors that can be in an active editor at once.',
  },
};
