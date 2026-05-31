import { Event } from "../../../../base/common/event.js";
import { IHistory } from "../../../../base/common/history.js";
import { IStorageService } from "../../../../platform/storage/common/storage.service.js";
export declare class FindWidgetSearchHistory implements IHistory<string> {
    private readonly storageService;
    static readonly FIND_HISTORY_KEY = "workbench.find.history";
    private inMemoryValues;
    onDidChange?: Event<string[]>;
    private _onDidChangeEmitter;
    private static _instance;
    static getOrCreate(storageService: IStorageService): FindWidgetSearchHistory;
    constructor(storageService: IStorageService);
    delete(t: string): boolean;
    add(t: string): this;
    has(t: string): boolean;
    clear(): void;
    forEach(callbackfn: (value: string, value2: string, set: Set<string>) => void, thisArg?: unknown): void;
    replace?(t: string[]): void;
    load(): void;
    save(): Promise<void>;
}
