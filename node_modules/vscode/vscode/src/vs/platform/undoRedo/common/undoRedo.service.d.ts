import { IDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { UriComparisonKeyComputer, IUndoRedoElement, UndoRedoGroup, UndoRedoSource, IPastFutureElements, ResourceEditStackSnapshot } from "./undoRedo.js";
export declare const IUndoRedoService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUndoRedoService>;
export interface IUndoRedoService {
    readonly _serviceBrand: undefined;
    /**
    * Register an URI -> string hasher.
    * This is useful for making multiple URIs share the same undo-redo stack.
    */
    registerUriComparisonKeyComputer(scheme: string, uriComparisonKeyComputer: UriComparisonKeyComputer): IDisposable;
    /**
    * Get the hash used internally for a certain URI.
    * This uses any registered `UriComparisonKeyComputer`.
    */
    getUriComparisonKey(resource: URI): string;
    /**
    * Add a new element to the `undo` stack.
    * This will destroy the `redo` stack.
    */
    pushElement(element: IUndoRedoElement, group?: UndoRedoGroup, source?: UndoRedoSource): void;
    /**
    * Get the last pushed element for a resource.
    * If the last pushed element has been undone, returns null.
    */
    getLastElement(resource: URI): IUndoRedoElement | null;
    /**
    * Get all the elements associated with a resource.
    * This includes the past and the future.
    */
    getElements(resource: URI): IPastFutureElements;
    /**
    * Validate or invalidate stack elements associated with a resource.
    */
    setElementsValidFlag(resource: URI, isValid: boolean, filter: (element: IUndoRedoElement) => boolean): void;
    /**
    * Remove elements that target `resource`.
    */
    removeElements(resource: URI): void;
    /**
    * Create a snapshot of the current elements on the undo-redo stack for a resource.
    */
    createSnapshot(resource: URI): ResourceEditStackSnapshot;
    /**
    * Attempt (as best as possible) to restore a certain snapshot previously created with `createSnapshot` for a resource.
    */
    restoreSnapshot(snapshot: ResourceEditStackSnapshot): void;
    canUndo(resource: URI | UndoRedoSource): boolean;
    undo(resource: URI | UndoRedoSource): Promise<void> | void;
    canRedo(resource: URI | UndoRedoSource): boolean;
    redo(resource: URI | UndoRedoSource): Promise<void> | void;
}
