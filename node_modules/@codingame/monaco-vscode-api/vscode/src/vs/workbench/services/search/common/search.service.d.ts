import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { ResourceSet } from "../../../../base/common/map.js";
import { ITextQuery, ISearchProgressItem, ISearchComplete, IAITextQuery, IFileQuery, SearchProviderType, ISearchResultProvider } from "./search.js";
export declare const ISearchService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISearchService>;
/**
* A service that enables to search for files or with in files.
*/
export interface ISearchService {
    readonly _serviceBrand: undefined;
    textSearch(query: ITextQuery, token?: CancellationToken, onProgress?: (result: ISearchProgressItem) => void): Promise<ISearchComplete>;
    aiTextSearch(query: IAITextQuery, token?: CancellationToken, onProgress?: (result: ISearchProgressItem) => void): Promise<ISearchComplete>;
    getAIName(): Promise<string | undefined>;
    textSearchSplitSyncAsync(query: ITextQuery, token?: CancellationToken | undefined, onProgress?: ((result: ISearchProgressItem) => void) | undefined, notebookFilesToIgnore?: ResourceSet, asyncNotebookFilesToIgnore?: Promise<ResourceSet>): {
        syncResults: ISearchComplete;
        asyncResults: Promise<ISearchComplete>;
    };
    fileSearch(query: IFileQuery, token?: CancellationToken): Promise<ISearchComplete>;
    schemeHasFileSearchProvider(scheme: string): boolean;
    clearCache(cacheKey: string): Promise<void>;
    registerSearchResultProvider(scheme: string, type: SearchProviderType, provider: ISearchResultProvider): IDisposable;
}
