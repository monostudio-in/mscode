import { IAction } from "../../../common/actions.js";
import { Emitter, Event } from "../../../common/event.js";
import { IMarkdownString } from "../../../common/htmlContent.js";
import { ThemeIcon } from "../../../common/themables.js";
import { IKeyboardEvent } from "../../keyboardEvent.js";
import { BaseActionViewItem, IActionViewItemOptions } from "../actionbar/actionViewItems.js";
import { IActionViewItemProvider } from "../actionbar/actionbar.js";
import { IHoverLifecycleOptions } from "../hover/hover.js";
import { Widget } from "../widget.js";
export interface IToggleOpts extends IToggleStyles {
    readonly actionClassName?: string;
    readonly icon?: ThemeIcon;
    readonly title: string | IMarkdownString | HTMLElement;
    readonly isChecked: boolean;
    readonly notFocusable?: boolean;
    readonly hoverLifecycleOptions?: IHoverLifecycleOptions;
}
export interface IToggleStyles {
    readonly inputActiveOptionBorder: string | undefined;
    readonly inputActiveOptionForeground: string | undefined;
    readonly inputActiveOptionBackground: string | undefined;
}
export interface ICheckboxStyles {
    readonly checkboxBackground: string | undefined;
    readonly checkboxBorder: string | undefined;
    readonly checkboxForeground: string | undefined;
    readonly checkboxDisabledBackground: string | undefined;
    readonly checkboxDisabledForeground: string | undefined;
    readonly size?: number;
    readonly hoverLifecycleOptions?: IHoverLifecycleOptions;
}
export declare const unthemedToggleStyles: {
    inputActiveOptionBorder: string;
    inputActiveOptionForeground: string;
    inputActiveOptionBackground: string;
};
export declare class ToggleActionViewItem extends BaseActionViewItem {
    protected readonly toggle: Toggle;
    constructor(context: unknown, action: IAction, options: IActionViewItemOptions);
    render(container: HTMLElement): void;
    protected updateEnabled(): void;
    protected updateChecked(): void;
    protected updateLabel(): void;
    focus(): void;
    blur(): void;
    setFocusable(focusable: boolean): void;
}
export declare class Toggle extends Widget {
    private readonly _onChange;
    get onChange(): Event<boolean>;
    private readonly _onKeyDown;
    get onKeyDown(): Event<IKeyboardEvent>;
    private readonly _opts;
    private _title;
    private _icon;
    readonly domNode: HTMLElement;
    private _checked;
    constructor(opts: IToggleOpts);
    get enabled(): boolean;
    focus(): void;
    get checked(): boolean;
    set checked(newIsChecked: boolean);
    setIcon(icon: ThemeIcon | undefined): void;
    width(): number;
    protected applyStyles(): void;
    enable(): void;
    disable(): void;
    setTitle(newTitle: string | IMarkdownString | HTMLElement): void;
    set visible(visible: boolean);
    get visible(): boolean;
}
declare abstract class BaseCheckbox extends Widget {
    protected readonly checkbox: Toggle;
    readonly domNode: HTMLElement;
    protected readonly styles: ICheckboxStyles;
    static readonly CLASS_NAME = "monaco-checkbox";
    protected readonly _onChange: Emitter<boolean>;
    readonly onChange: Event<boolean>;
    constructor(checkbox: Toggle, domNode: HTMLElement, styles: ICheckboxStyles);
    get enabled(): boolean;
    focus(): void;
    hasFocus(): boolean;
    enable(): void;
    disable(): void;
    setTitle(newTitle: string): void;
    protected applyStyles(enabled?: boolean): void;
}
export declare class Checkbox extends BaseCheckbox {
    constructor(title: string, isChecked: boolean, styles: ICheckboxStyles);
    get checked(): boolean;
    set checked(newIsChecked: boolean);
    protected applyStyles(enabled?: boolean): void;
}
export declare class TriStateCheckbox extends BaseCheckbox {
    private _state;
    constructor(title: string, _state: boolean | "mixed", styles: ICheckboxStyles);
    get checked(): boolean | "mixed";
    set checked(newState: boolean | "mixed");
    protected applyStyles(enabled?: boolean): void;
}
export interface ICheckboxActionViewItemOptions extends IActionViewItemOptions {
    checkboxStyles: ICheckboxStyles;
}
export declare class CheckboxActionViewItem extends BaseActionViewItem {
    protected readonly toggle: Checkbox;
    private cssClass?;
    constructor(context: unknown, action: IAction, options: ICheckboxActionViewItemOptions);
    render(container: HTMLElement): void;
    private onChange;
    protected updateEnabled(): void;
    protected updateChecked(): void;
    protected updateClass(): void;
    focus(): void;
    blur(): void;
    setFocusable(focusable: boolean): void;
}
/**
 * Creates an action view item provider that renders toggles for actions with a checked state
 * and falls back to default button rendering for regular actions.
 *
 * @param toggleStyles - Optional styles to apply to toggle items
 * @returns An IActionViewItemProvider that can be used with ActionBar
 */
export declare function createToggleActionViewItemProvider(toggleStyles?: IToggleStyles): IActionViewItemProvider;
export {};
