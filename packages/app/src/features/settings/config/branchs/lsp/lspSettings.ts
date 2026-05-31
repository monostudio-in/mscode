// src/features/settings/config/branchs/lsp/lspSettings.ts
import type { IConfigurationSection } from '@/core/extensionAPI/registry/configurationRegistry';

// import { pythonLspProperties } from './parts/pythonSettings';
// import { cppLspProperties }    from './parts/cppSettings';
// import { cLspProperties }    from './parts/cSettings';
import { htmlLspProperties }   from './parts/Htmlsettings';
// import { jsLspProperties, tsLspProperties } from './parts/Jstssettings';
import { cssLspProperties, jsonLspProperties } from './parts/Cssjsonsettings';

export const lspSection: IConfigurationSection = {
  id:    'lsp',
  title: 'Language Features',
  order: 15,
  properties: {
    // ── External LSP servers (need Alpine + proot) ─────────────────────────
    // ...pythonLspProperties,
    // ...cppLspProperties,
    // ...cLspProperties,

    // ── Monaco built-in (no server needed, but still user-configurable) ────
    // ...jsLspProperties,
    // ...tsLspProperties,
    ...htmlLspProperties,
    ...cssLspProperties,
    ...jsonLspProperties,
  },
};