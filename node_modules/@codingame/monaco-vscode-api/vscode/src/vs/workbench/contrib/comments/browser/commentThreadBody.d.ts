import * as dom from "../../../../base/browser/dom.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import * as languages from "../../../../editor/common/languages.js";
import { ICommentService } from "./commentService.service.js";
import { CommentNode } from "./commentNode.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { URI } from "../../../../base/common/uri.js";
import { ICommentThreadWidget } from "../common/commentThreadWidget.js";
import { IMarkdownRendererExtraOptions } from "../../../../platform/markdown/browser/markdownRenderer.js";
import { ICellRange } from "../../notebook/common/notebookRange.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { LayoutableEditor } from "./simpleCommentEditor.js";
export declare class CommentThreadBody<T extends IRange | ICellRange = IRange> extends Disposable {
    private readonly _parentEditor;
    readonly owner: string;
    readonly parentResourceUri: URI;
    readonly container: HTMLElement;
    private _markdownRendererOptions;
    private _commentThread;
    private _pendingEdits;
    private _scopedInstatiationService;
    private _parentCommentThreadWidget;
    private readonly commentService;
    private _commentsElement;
    private _commentElements;
    private _resizeObserver;
    private _focusedComment;
    private _onDidResize;
    onDidResize: import("../../../../base/common/event.js").Event<dom.Dimension>;
    private _commentDisposable;
    get length(): number;
    get activeComment(): CommentNode<T>;
    constructor(_parentEditor: LayoutableEditor, owner: string, parentResourceUri: URI, container: HTMLElement, _markdownRendererOptions: IMarkdownRendererExtraOptions, _commentThread: languages.CommentThread<T>, _pendingEdits: {
        [key: number]: languages.PendingComment;
    } | undefined, _scopedInstatiationService: IInstantiationService, _parentCommentThreadWidget: ICommentThreadWidget, commentService: ICommentService);
    focus(commentUniqueId?: number): void;
    hasCommentsInEditMode(): boolean;
    ensureFocusIntoNewEditingComment(): void;
    display(): Promise<void>;
    private _containerClientArea;
    private _refresh;
    getDimensions(): dom.Dimension;
    layout(widthInPixel?: number): void;
    getPendingEdits(): {
        [key: number]: languages.PendingComment;
    };
    getCommentCoords(commentUniqueId: number): {
        thread: dom.IDomNodePagePosition;
        comment: dom.IDomNodePagePosition;
    } | undefined;
    updateCommentThread(commentThread: languages.CommentThread<T>, preserveFocus: boolean): Promise<void>;
    private _updateAriaLabel;
    private _setFocusedComment;
    private createNewCommentNode;
    dispose(): void;
}
