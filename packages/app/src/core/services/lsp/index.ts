// src/core/services/lsp/index.ts

export { LspService }         from './LspService';
export type { LspOptions }    from './types';
export type { ILspService }   from '../ILspService';

import { LspService }         from './LspService';
export const lspService = new LspService();
