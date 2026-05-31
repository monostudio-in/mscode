import { IKeyboardEvent } from "./keyboardEvent.js";
import { IMouseEvent } from "./mouseEvent.js";
import { DisposableStore } from "../common/lifecycle.js";
export interface IContentActionHandler {
    readonly callback: (content: string, event: IMouseEvent | IKeyboardEvent) => void;
    readonly disposables: DisposableStore;
}
export interface FormattedTextRenderOptions {
    readonly actionHandler?: IContentActionHandler;
    readonly renderCodeSegments?: boolean;
}
export declare function renderText(text: string, _options?: FormattedTextRenderOptions, target?: HTMLElement): HTMLElement;
export declare function renderFormattedText(formattedText: string, options?: FormattedTextRenderOptions, target?: HTMLElement): HTMLElement;
