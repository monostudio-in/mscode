import { URI } from "../../../../base/common/uri.js";
import { ISnippetGetOptions } from "./snippets.js";
import { SnippetFile, Snippet } from "./snippetsFile.js";
export declare const ISnippetsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISnippetsService>;
export interface ISnippetsService {
    readonly _serviceBrand: undefined;
    getSnippetFiles(): Promise<Iterable<SnippetFile>>;
    isEnabled(snippet: Snippet): boolean;
    updateEnablement(snippet: Snippet, enabled: boolean): void;
    updateUsageTimestamp(snippet: Snippet): void;
    getSnippets(languageId: string | undefined, resourceUri?: URI, opt?: ISnippetGetOptions): Promise<Snippet[]>;
    getSnippetsSync(languageId: string, resourceUri?: URI, opt?: ISnippetGetOptions): Snippet[];
}
