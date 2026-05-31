import { IDisposable, Disposable } from "../../../../../base/common/lifecycle.js";
import { ILogService } from "../../../../../platform/log/common/log.service.js";
export interface ITypeData {
    text: string;
    replacePrevCharCnt: number;
    replaceNextCharCnt: number;
    positionDelta: number;
}
export declare class FocusTracker extends Disposable {
    private readonly _domNode;
    private readonly _onFocusChange;
    private _isFocused;
    private _isPaused;
    constructor(_logService: ILogService, _domNode: HTMLElement, _onFocusChange: (newFocusValue: boolean) => void);
    pause(): void;
    resume(): void;
    private _handleFocusedChanged;
    focus(): void;
    refreshFocusState(): void;
    get isFocused(): boolean;
}
export declare function editContextAddDisposableListener<K extends keyof EditContextEventHandlersEventMap>(target: EventTarget, type: K, listener: (this: GlobalEventHandlers, ev: EditContextEventHandlersEventMap[K]) => void, options?: boolean | AddEventListenerOptions): IDisposable;
