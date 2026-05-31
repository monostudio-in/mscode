import { Event } from "../../../../base/common/event.js";
import { ISearchHistoryValues } from "./searchHistoryService.js";
export interface ISearchHistoryService {
    readonly _serviceBrand: undefined;
    readonly onDidClearHistory: Event<void>;
    clearHistory(): void;
    load(): ISearchHistoryValues;
    save(history: ISearchHistoryValues): void;
}
export declare const ISearchHistoryService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISearchHistoryService>;
