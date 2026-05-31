import { IFocusTracker } from "../../../base/browser/dom.js";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { IObservable, IReader } from "../../../base/common/observable.js";
import { IModifierKeyStatus } from "./userInteractionService.js";
import { IUserInteractionService } from "./userInteractionService.service.js";
export declare class UserInteractionService implements IUserInteractionService {
    readonly _serviceBrand: undefined;
    private readonly _modifierObservables;
    readModifierKeyStatus(element: HTMLElement | Window, reader: IReader | undefined): IModifierKeyStatus;
    createFocusTracker(element: HTMLElement | Window, store: DisposableStore): IObservable<boolean>;
    createHoverTracker(element: Element, store: DisposableStore): IObservable<boolean>;
    createDomFocusTracker(element: HTMLElement): IFocusTracker;
}
