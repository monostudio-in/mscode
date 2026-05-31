import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IAiSettingsSearchProvider, AiSettingsSearchResult } from "./aiSettingsSearch.js";
export declare const IAiSettingsSearchService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAiSettingsSearchService>;
export interface IAiSettingsSearchService {
    readonly _serviceBrand: undefined;
    readonly onProviderRegistered: Event<void>;
    isEnabled(): boolean;
    startSearch(query: string, token: CancellationToken): void;
    getEmbeddingsResults(query: string, token: CancellationToken): Promise<string[] | null>;
    getLLMRankedResults(query: string, token: CancellationToken): Promise<string[] | null>;
    registerSettingsSearchProvider(provider: IAiSettingsSearchProvider): IDisposable;
    handleSearchResult(results: AiSettingsSearchResult): void;
}
