import { IInputBoxStyles, IRange } from "../../../base/browser/ui/inputbox/inputBox.js";
import { IToggleStyles, Toggle } from "../../../base/browser/ui/toggle/toggle.js";
import { IAction } from "../../../base/common/actions.js";
import { IActionViewItemProvider } from "../../../base/browser/ui/actionbar/actionbar.js";
import { Disposable, IDisposable } from "../../../base/common/lifecycle.js";
import Severity from "../../../base/common/severity.js";
export declare class QuickInputBox extends Disposable {
    private parent;
    private container;
    private findInput;
    private _listFocusMode;
    constructor(parent: HTMLElement, inputBoxStyles: IInputBoxStyles, toggleStyles: IToggleStyles);
    get onKeyDown(): import("../../../base/common/event.js").Event<import("../../../base/browser/keyboardEvent.js").IKeyboardEvent>;
    get onMouseDown(): import("../../../base/common/event.js").Event<import("../../../base/browser/mouseEvent.js").IMouseEvent>;
    onDidChange: (handler: (event: string) => void) => IDisposable;
    get value(): string;
    set value(value: string);
    select(range?: IRange | null): void;
    getSelection(): IRange | null;
    isSelectionAtEnd(): boolean;
    setPlaceholder(placeholder: string): void;
    get placeholder(): string;
    set placeholder(placeholder: string);
    get password(): boolean;
    set password(password: boolean);
    set enabled(enabled: boolean);
    set toggles(toggles: Toggle[] | undefined);
    set actions(actions: ReadonlyArray<IAction> | undefined);
    setActions(actions: ReadonlyArray<IAction> | undefined, actionViewItemProvider?: IActionViewItemProvider): void;
    get ariaLabel(): string;
    set ariaLabel(ariaLabel: string);
    hasFocus(): boolean;
    setAttribute(name: string, value: string): void;
    removeAttribute(name: string): void;
    /**
     * Controls the ARIA popup mode for screen readers.
     * When enabled (hasActiveDescendant=true), indicates a list popup is active.
     * When disabled, removes ARIA attributes to allow normal text input behavior.
     * Only updates attributes when the state actually changes to avoid
     * unnecessary screen reader re-announcements.
     */
    setListFocusMode(hasActiveDescendant: boolean): void;
    showDecoration(decoration: Severity): void;
    stylesForType(decoration: Severity): {
        border: string | undefined;
        background: string | undefined;
        foreground: string | undefined;
    };
    setFocus(): void;
    layout(): void;
}
