import { Disposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { ICommentInfo } from "@codingame/monaco-vscode-comments-service-override/vscode/vs/workbench/contrib/comments/browser/commentService";
import { ICommentService } from "./commentService.service.js";
export declare class CommentThreadRangeDecorator extends Disposable {
    private static description;
    private decorationOptions;
    private activeDecorationOptions;
    private decorationIds;
    private activeDecorationIds;
    private editor;
    private threadCollapseStateListeners;
    private currentThreadCollapseStateListener;
    constructor(commentService: ICommentService);
    private updateCurrent;
    update(editor: ICodeEditor | undefined, commentInfos: ICommentInfo[]): void;
    dispose(): void;
}
