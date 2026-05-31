import { IObservable } from "../../../base/common/observable.js";
import { ITrackedWord } from "./renameSymbolTrackerService.js";
export declare const IRenameSymbolTrackerService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IRenameSymbolTrackerService>;
export interface IRenameSymbolTrackerService {
    readonly _serviceBrand: undefined;
    /**
    * Observable that emits the currently tracked word, or undefined if no word is being tracked.
    */
    readonly trackedWord: IObservable<ITrackedWord | undefined>;
}
