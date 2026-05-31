// src/features/settings/config/branchs/editor/parts/displaySettings.ts
import type { IConfigurationSection } from '@/core/extensionAPI/registry/configurationRegistry';

export const menuProperties: IConfigurationSection['properties'] = {
  //  EDITOR CONTEXT MENU :
  'editor.contextMenuStyle': {
    title: 'Context Menu Style',
    type: 'select',
    defaultValue: 'android',
    order: 150,
    subCategory: 'Context Menu > Editor',
    tags: ['menu', 'context'],
    description: 'Controls the visual layout and style of the context menu.',
    enum: ['android', 'vertical', 'native'],
    enumItemLabels: ['Android (Horizontal)', 'Vertical (MS Code)', 'Native (Monaco)'],
  },
  'editor.androidMenuOverflowLimit': {
    title: 'Android Menu Overflow Limit',
    type: 'number',
    defaultValue: 4,
    minimum: 1,
    maximum: 10,
    order: 151,
    subCategory: 'Context Menu > Editor',
    tags: ['menu', 'context', 'android', 'overflow'],
    markdownDescription: 
      'Controls the maximum number of menu items to show in the **Android** menu style before overflowing.\n\n' +
      'For example: setting it to `3` will show 3 primary icons, and the rest will be pushed to the overflow section.',
  },

  'editor.androidMenuOverflowStyle': {
    title: 'Android Menu Overflow Style',
    type: 'select',
    defaultValue: 'more',
    order: 152,
    subCategory: 'Context Menu > Editor',
    tags: ['menu', 'context', 'android', 'overflow', 'style'],
    enum: ['scroll', 'more'],
    enumItemLabels: ['Horizontal Scroll', 'More Button (⋮)'],
    markdownDescription: 
      'Controls how extra menu items are handled when the overflow limit is reached in the Android menu style.\n\n' +
      '**Available Behaviors:**\n' +
      '- `Horizontal Scroll`: Allows smooth swiping left and right to view hidden items.\n' +
      '- `More Button (⋮)`: Displays a classic three-dot button that opens a clean vertical dropdown.',
  },
  'editor.androidMenuItemDisplay': {
    title: 'Android Menu Item Display',
    type: 'select',
    defaultValue: 'icon', 
    order: 153,
    subCategory: 'Context Menu > Editor',
    tags: ['menu', 'context', 'android', 'display', 'icon', 'label'],
    enum: ['icon', 'label', 'both'],
    enumItemLabels: ['Only Icons', 'Only Labels', 'Icon and Label'],
    markdownDescription: 
      'Controls how the primary items are displayed in the **Android** menu style (horizontal bar).\n\n' +
      '**Available Options:**\n' +
      '- `Only Icons`: Shows only the icon for a compact look.\n' +
      '- `Only Labels`: Shows only the text label.\n' +
      '- `Icon and Label`: Shows both the icon and the text label side-by-side.',
  },
}