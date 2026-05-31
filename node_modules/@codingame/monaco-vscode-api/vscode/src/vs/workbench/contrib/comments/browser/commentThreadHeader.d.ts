import { Disposable } from "../../../../base/common/lifecycle.js";
import * as languages from "../../../../editor/common/languages.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { CommentMenus } from "@codingame/monaco-vscode-comments-service-override/vscode/vs/workbench/contrib/comments/browser/commentMenus";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.service.js";
export declare class CommentThreadHeader<T = IRange> extends Disposable {
    private _delegate;
    private _commentMenus;
    private _commentThread;
    private readonly _contextKeyService;
    private readonly _instantiationService;
    private readonly _contextMenuService;
    private _headElement;
    private _headingLabel;
    private _actionbarWidget;
    private _collapseAction;
    private _contextMenuActionRunner;
    constructor(container: HTMLElement, _delegate: {
        collapse: () => void;
    }, _commentMenus: CommentMenus, _commentThread: languages.CommentThread<T>, _contextKeyService: IContextKeyService, _instantiationService: IInstantiationService, _contextMenuService: IContextMenuService);
    protected _fillHead(): void;
    private setActionBarActions;
    updateCommentThread(commentThread: languages.CommentThread<T>): void;
    createThreadLabel(): void;
    updateHeight(headHeight: number): void;
    private onContextMenu;
}
