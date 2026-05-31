import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { QuickDiffProvider, QuickDiff } from "./quickDiff.js";
export declare const IQuickDiffService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IQuickDiffService>;
export interface IQuickDiffService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeQuickDiffProviders: Event<void>;
    readonly providers: readonly QuickDiffProvider[];
    addQuickDiffProvider(quickDiff: QuickDiffProvider): IDisposable;
    getQuickDiffs(uri: URI, language?: string, isSynchronized?: boolean): Promise<QuickDiff[]>;
    toggleQuickDiffProviderVisibility(id: string): void;
    isQuickDiffProviderVisible(id: string): boolean;
}
