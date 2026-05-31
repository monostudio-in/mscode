// src/core/extensionAPI/modules/languagesModule.ts
//
// Language feature contributions: snippets, diagnostics (problems), and future additions
// (formatters, hover providers, code-lens providers, etc.)

import { createSnippetsAPI }    from './languages/snippetsAPI';
import { createDiagnosticsAPI } from './languages/diagnosticsAPI';
import { createFormattersAPI }  from './languages/formattersAPI';

export const createLanguagesModule = (extId: string) => ({
  ...createSnippetsAPI(),         
  ...createDiagnosticsAPI(extId),
  ...createFormattersAPI(),
});

export type LanguagesModule = ReturnType<typeof createLanguagesModule>;