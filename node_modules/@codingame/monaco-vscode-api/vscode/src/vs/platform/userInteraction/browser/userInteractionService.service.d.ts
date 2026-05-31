import { IFocusTracker } from "../../../base/browser/dom.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { IReader, IObservable } from "../../../base/common/observable.js";
import { IModifierKeyStatus } from "./userInteractionService.js";
export declare const IUserInteractionService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserInteractionService>;
/**
* Used to track user UI interactions such as focus and hover states.
* This allows mocking these interactions in tests and simulating specific states.
*/
export interface IUserInteractionService {
    readonly _serviceBrand: undefined;
    /**
    * Reads the current modifier key status for the window containing the given element.
    * Pass an element to determine the correct window context (for multi-window support).
    */
    readModifierKeyStatus(element: HTMLElement | Window, reader: IReader | undefined): IModifierKeyStatus;
    /**
    * Creates an observable that tracks whether the given element (or a descendant) has focus.
    * The observable is disposed when the disposable store is disposed.
    */
    createFocusTracker(element: HTMLElement | Window, store: DisposableStore): IObservable<boolean>;
    /**
    * Creates an observable that tracks whether the given element is hovered.
    * The observable is disposed when the disposable store is disposed.
    */
    createHoverTracker(element: Element, store: DisposableStore): IObservable<boolean>;
    createDomFocusTracker(element: HTMLElement): IFocusTracker;
}
