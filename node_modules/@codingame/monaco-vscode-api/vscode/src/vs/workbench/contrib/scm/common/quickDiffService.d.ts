import { URI } from "../../../../base/common/uri.js";
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { QuickDiff, QuickDiffProvider } from "./quickDiff.js";
import { IQuickDiffService } from "./quickDiff.service.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.service.js";
import { IStorageService } from "../../../../platform/storage/common/storage.service.js";
export declare class QuickDiffService extends Disposable implements IQuickDiffService {
    private readonly storageService;
    private readonly uriIdentityService;
    readonly _serviceBrand: undefined;
    private static readonly STORAGE_KEY;
    private quickDiffProviders;
    get providers(): readonly QuickDiffProvider[];
    private readonly _onDidChangeQuickDiffProviders;
    readonly onDidChangeQuickDiffProviders: import("../../../../base/common/event.js").Event<void>;
    private hiddenQuickDiffProviders;
    constructor(storageService: IStorageService, uriIdentityService: IUriIdentityService);
    addQuickDiffProvider(quickDiff: QuickDiffProvider): IDisposable;
    getQuickDiffs(uri: URI, language?: string, isSynchronized?: boolean): Promise<QuickDiff[]>;
    toggleQuickDiffProviderVisibility(id: string): void;
    isQuickDiffProviderVisible(id: string): boolean;
    private loadState;
    private saveState;
}
export declare function getOriginalResource(quickDiffService: IQuickDiffService, uri: URI, language: string | undefined, isSynchronized: boolean | undefined): Promise<URI | null>;
