import { CancellationToken } from "../../../../base/common/cancellation.js";
export declare enum AiSettingsSearchResultKind {
    EMBEDDED = 1,
    LLM_RANKED = 2,
    CANCELED = 3
}
export interface AiSettingsSearchResult {
    query: string;
    kind: AiSettingsSearchResultKind;
    settings: string[];
}
export interface AiSettingsSearchProviderOptions {
    limit: number;
    embeddingsOnly: boolean;
}
export interface IAiSettingsSearchProvider {
    searchSettings(query: string, option: AiSettingsSearchProviderOptions, token: CancellationToken): void;
}
