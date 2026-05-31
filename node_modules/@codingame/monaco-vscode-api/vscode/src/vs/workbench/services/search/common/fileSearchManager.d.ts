import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IFileMatch, ISearchCompleteStats, IFileQuery } from "./search.js";
import { FileSearchProvider2 } from "./searchExtTypes.js";
export declare class FileSearchManager {
    private static readonly BATCH_SIZE;
    private readonly sessions;
    fileSearch(config: IFileQuery, provider: FileSearchProvider2, onBatch: (matches: IFileMatch[]) => void, token: CancellationToken): Promise<ISearchCompleteStats>;
    clearCache(cacheKey: string): void;
    private getSessionTokenSource;
    private rawMatchToSearchItem;
    private doSearch;
}
