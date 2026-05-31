import { CancellationToken } from "../../../base/common/cancellation.js";
import { Event } from "../../../base/common/event.js";
import { IObservable } from "../../../base/common/observable.js";
import { IQuickAccessController } from "./quickAccess.js";
import { IQuickInputButton, QuickInputAlignment, IQuickPickItem, QuickPickInput, IPickOptions, Omit, IInputOptions, IQuickPick, IInputBox, IQuickWidget, IQuickTreeItem, IQuickTree, IQuickNavigateConfiguration, IKeyMods, QuickInputHideReason, IQuickInput } from "./quickInput.js";
export declare const IQuickInputService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IQuickInputService>;
export interface IQuickInputService {
    readonly _serviceBrand: undefined;
    /**
    * Provides access to the back button in quick input.
    */
    readonly backButton: IQuickInputButton;
    /**
    * Provides access to the quick access providers.
    */
    readonly quickAccess: IQuickAccessController;
    /**
    * Allows to register on the event that quick input is showing.
    */
    readonly onShow: Event<void>;
    /**
    * Allows to register on the event that quick input is hiding.
    */
    readonly onHide: Event<void>;
    /**
    * The current alignment of the quick input widget.
    */
    readonly alignment: IObservable<QuickInputAlignment>;
    /**
    * Opens the quick input box for selecting items and returns a promise
    * with the user selected item(s) if any.
    */
    pick<T extends IQuickPickItem>(picks: Promise<QuickPickInput<T>[]> | QuickPickInput<T>[], options?: IPickOptions<T> & {
        canPickMany: true;
    }, token?: CancellationToken): Promise<T[] | undefined>;
    pick<T extends IQuickPickItem>(picks: Promise<QuickPickInput<T>[]> | QuickPickInput<T>[], options?: IPickOptions<T> & {
        canPickMany: false;
    }, token?: CancellationToken): Promise<T | undefined>;
    pick<T extends IQuickPickItem>(picks: Promise<QuickPickInput<T>[]> | QuickPickInput<T>[], options?: Omit<IPickOptions<T>, "canPickMany">, token?: CancellationToken): Promise<T | undefined>;
    /**
    * Opens the quick input box for text input and returns a promise with the user typed value if any.
    */
    input(options?: IInputOptions, token?: CancellationToken): Promise<string | undefined>;
    /**
    * Provides raw access to the quick pick controller.
    */
    createQuickPick<T extends IQuickPickItem>(options: {
        useSeparators: true;
    }): IQuickPick<T, {
        useSeparators: true;
    }>;
    createQuickPick<T extends IQuickPickItem>(options?: {
        useSeparators: boolean;
    }): IQuickPick<T, {
        useSeparators: false;
    }>;
    /**
    * Provides raw access to the input box controller.
    */
    createInputBox(): IInputBox;
    /**
    * Provides raw access to the quick widget controller.
    */
    createQuickWidget(): IQuickWidget;
    /**
    * Provides raw access to the quick tree controller.
    * @template T The type of items in the quick tree.
    */
    createQuickTree<T extends IQuickTreeItem>(): IQuickTree<T>;
    /**
    * Moves focus into quick input.
    */
    focus(): void;
    /**
    * Toggle the checked state of the selected item.
    */
    toggle(): void;
    /**
    * Navigate inside the opened quick input list.
    */
    navigate(next: boolean, quickNavigate?: IQuickNavigateConfiguration): void;
    /**
    * Navigate back in a multi-step quick input.
    */
    back(): Promise<void>;
    /**
    * Accept the selected item.
    *
    * @param keyMods allows to override the state of key
    * modifiers that should be present when invoking.
    */
    accept(keyMods?: IKeyMods): Promise<void>;
    /**
    * Cancels quick input and closes it.
    */
    cancel(reason?: QuickInputHideReason): Promise<void>;
    /**
    * Toggles hover for the current quick input item
    */
    toggleHover(): void;
    /**
    * The current quick pick that is visible. Undefined if none is open.
    */
    currentQuickInput: IQuickInput | undefined;
    /**
    * Set the alignment of the quick input.
    * @param alignment either a preset or a custom alignment
    */
    setAlignment(alignment: "top" | "center" | {
        top: number;
        left: number;
    }): void;
}
