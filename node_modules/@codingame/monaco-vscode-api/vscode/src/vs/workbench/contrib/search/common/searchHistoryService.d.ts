import { Event } from "../../../../base/common/event.js";
import { IStorageService } from "../../../../platform/storage/common/storage.service.js";
import { ISearchHistoryService } from "./searchHistoryService.service.js";
export interface ISearchHistoryValues {
    search?: string[];
    replace?: string[];
    include?: string[];
    exclude?: string[];
}
export declare class SearchHistoryService implements ISearchHistoryService {
    private readonly storageService;
    readonly _serviceBrand: undefined;
    static readonly SEARCH_HISTORY_KEY = "workbench.search.history";
    private readonly _onDidClearHistory;
    readonly onDidClearHistory: Event<void>;
    constructor(storageService: IStorageService);
    clearHistory(): void;
    load(): ISearchHistoryValues;
    save(history: ISearchHistoryValues): void;
}
