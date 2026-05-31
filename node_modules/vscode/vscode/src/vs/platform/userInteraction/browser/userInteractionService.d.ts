import { IObservable, IReader } from "../../../base/common/observable.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { IFocusTracker } from "../../../base/browser/dom.js";
import { IUserInteractionService } from "./userInteractionService.service.js";
export interface IModifierKeyStatus {
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
}
/**
 * Mock implementation of IUserInteractionService that can be used for testing
 * or simulating specific interaction states.
 */
export declare class MockUserInteractionService implements IUserInteractionService {
    private readonly _simulateFocus;
    private readonly _simulateHover;
    private readonly _modifiers;
    readonly _serviceBrand: undefined;
    constructor(_simulateFocus?: boolean, _simulateHover?: boolean, _modifiers?: IModifierKeyStatus);
    readModifierKeyStatus(_element: HTMLElement | Window, _reader: IReader | undefined): IModifierKeyStatus;
    createFocusTracker(_element: HTMLElement | Window, _store: DisposableStore): IObservable<boolean>;
    createHoverTracker(_element: Element, _store: DisposableStore): IObservable<boolean>;
    createDomFocusTracker(_element: HTMLElement): IFocusTracker;
}
