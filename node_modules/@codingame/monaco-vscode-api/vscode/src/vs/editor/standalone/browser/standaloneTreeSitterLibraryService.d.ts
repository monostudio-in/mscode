import type { Parser, Language, Query } from "../../../../../../external/@vscode/tree-sitter-wasm/wasm/tree-sitter.js";
import { IReader } from "../../../base/common/observable.js";
import { ITreeSitterLibraryService } from "../../common/services/treeSitter/treeSitterLibraryService.service.js";
export declare class StandaloneTreeSitterLibraryService implements ITreeSitterLibraryService {
    readonly _serviceBrand: undefined;
    getParserClass(): Promise<typeof Parser>;
    supportsLanguage(languageId: string, reader: IReader | undefined): boolean;
    getLanguage(languageId: string, ignoreSupportsCheck: boolean, reader: IReader | undefined): Language | undefined;
    getLanguagePromise(languageId: string): Promise<Language | undefined>;
    getInjectionQueries(languageId: string, reader: IReader | undefined): Query | null | undefined;
    getHighlightingQueries(languageId: string, reader: IReader | undefined): Query | null | undefined;
    createQuery(language: Language, querySource: string): Promise<Query>;
}
