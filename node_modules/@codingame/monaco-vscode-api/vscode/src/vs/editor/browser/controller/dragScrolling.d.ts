import { Disposable, IDisposable } from "../../../base/common/lifecycle.js";
import { ViewContext } from "../../common/viewModel/viewContext.js";
import { NavigationCommandRevealType } from "../coreCommands.js";
import { IMouseTarget, IMouseTargetOutsideEditor } from "../editorBrowser.js";
import { EditorMouseEvent } from "../editorDom.js";
import { IPointerHandlerHelper } from "./mouseHandler.js";
import { MouseTargetFactory } from "./mouseTarget.js";
export declare abstract class DragScrolling extends Disposable {
    protected readonly _context: ViewContext;
    protected readonly _viewHelper: IPointerHandlerHelper;
    protected readonly _mouseTargetFactory: MouseTargetFactory;
    protected readonly _dispatchMouse: (position: IMouseTarget, inSelectionMode: boolean, revealType: NavigationCommandRevealType) => void;
    private _operation;
    constructor(_context: ViewContext, _viewHelper: IPointerHandlerHelper, _mouseTargetFactory: MouseTargetFactory, _dispatchMouse: (position: IMouseTarget, inSelectionMode: boolean, revealType: NavigationCommandRevealType) => void);
    dispose(): void;
    start(position: IMouseTargetOutsideEditor, mouseEvent: EditorMouseEvent): void;
    stop(): void;
    protected abstract _createDragScrollingOperation(position: IMouseTargetOutsideEditor, mouseEvent: EditorMouseEvent): DragScrollingOperation;
}
export declare abstract class DragScrollingOperation extends Disposable {
    protected readonly _context: ViewContext;
    protected readonly _viewHelper: IPointerHandlerHelper;
    protected readonly _mouseTargetFactory: MouseTargetFactory;
    protected readonly _dispatchMouse: (position: IMouseTarget, inSelectionMode: boolean, revealType: NavigationCommandRevealType) => void;
    protected _position: IMouseTargetOutsideEditor;
    protected _mouseEvent: EditorMouseEvent;
    private _lastTime;
    protected _animationFrameDisposable: IDisposable;
    constructor(_context: ViewContext, _viewHelper: IPointerHandlerHelper, _mouseTargetFactory: MouseTargetFactory, _dispatchMouse: (position: IMouseTarget, inSelectionMode: boolean, revealType: NavigationCommandRevealType) => void, position: IMouseTargetOutsideEditor, mouseEvent: EditorMouseEvent);
    dispose(): void;
    setPosition(position: IMouseTargetOutsideEditor, mouseEvent: EditorMouseEvent): void;
    /**
     * update internal state and return elapsed ms since last time
     */
    protected _tick(): number;
    protected abstract _execute(): void;
}
export declare class TopBottomDragScrolling extends DragScrolling {
    protected _createDragScrollingOperation(position: IMouseTargetOutsideEditor, mouseEvent: EditorMouseEvent): DragScrollingOperation;
}
export declare class TopBottomDragScrollingOperation extends DragScrollingOperation {
    /**
     * get the number of lines per second to auto-scroll
     */
    private _getScrollSpeed;
    protected _execute(): void;
}
export declare class LeftRightDragScrolling extends DragScrolling {
    protected _createDragScrollingOperation(position: IMouseTargetOutsideEditor, mouseEvent: EditorMouseEvent): DragScrollingOperation;
}
export declare class LeftRightDragScrollingOperation extends DragScrollingOperation {
    /**
     * get the number of cols per second to auto-scroll
     */
    private _getScrollSpeed;
    protected _execute(): void;
}
