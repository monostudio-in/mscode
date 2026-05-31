import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { Range, IRange } from "../../../../editor/common/core/range.js";
import { CommentThread, CommentingRanges, CommentThreadChangedEvent, CommentingRangeResourceHint, Comment, CommentReaction, PendingCommentThread } from "../../../../editor/common/languages.js";
import { ICellRange } from "../../notebook/common/notebookRange.js";
import { ICommentThreadChangedEvent } from "../common/commentModel.js";
import { CommentMenus } from "@codingame/monaco-vscode-comments-service-override/vscode/vs/workbench/contrib/comments/browser/commentMenus";
import { IResourceCommentThreadEvent, IWorkspaceCommentThreadsEvent, INotebookCommentThreadChangedEvent, ICommentController, ICommentInfo, INotebookCommentInfo, IContinueOnCommentProvider } from "@codingame/monaco-vscode-comments-service-override/vscode/vs/workbench/contrib/comments/browser/commentService";
import { ICommentsModel } from "./commentsModel.js";
export declare const ICommentService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ICommentService>;
export interface ICommentService {
    readonly _serviceBrand: undefined;
    readonly onDidSetResourceCommentInfos: Event<IResourceCommentThreadEvent>;
    readonly onDidSetAllCommentThreads: Event<IWorkspaceCommentThreadsEvent>;
    readonly onDidUpdateCommentThreads: Event<ICommentThreadChangedEvent>;
    readonly onDidUpdateNotebookCommentThreads: Event<INotebookCommentThreadChangedEvent>;
    readonly onDidChangeActiveEditingCommentThread: Event<CommentThread | null>;
    readonly onDidChangeCurrentCommentThread: Event<CommentThread | undefined>;
    readonly onDidUpdateCommentingRanges: Event<{
        uniqueOwner: string;
    }>;
    readonly onDidChangeActiveCommentingRange: Event<{
        range: Range;
        commentingRangesInfo: CommentingRanges;
    }>;
    readonly onDidSetDataProvider: Event<void>;
    readonly onDidDeleteDataProvider: Event<string | undefined>;
    readonly onDidChangeCommentingEnabled: Event<boolean>;
    readonly onResourceHasCommentingRanges: Event<void>;
    readonly isCommentingEnabled: boolean;
    readonly commentsModel: ICommentsModel;
    readonly lastActiveCommentcontroller: ICommentController | undefined;
    setDocumentComments(resource: URI, commentInfos: ICommentInfo[]): void;
    setWorkspaceComments(uniqueOwner: string, commentsByResource: CommentThread<IRange | ICellRange>[]): void;
    removeWorkspaceComments(uniqueOwner: string): void;
    registerCommentController(uniqueOwner: string, commentControl: ICommentController): void;
    unregisterCommentController(uniqueOwner?: string): void;
    getCommentController(uniqueOwner: string): ICommentController | undefined;
    createCommentThreadTemplate(uniqueOwner: string, resource: URI, range: Range | undefined, editorId?: string): Promise<void>;
    updateCommentThreadTemplate(uniqueOwner: string, threadHandle: number, range: Range): Promise<void>;
    getCommentMenus(uniqueOwner: string): CommentMenus;
    updateComments(ownerId: string, event: CommentThreadChangedEvent<IRange>): void;
    updateNotebookComments(ownerId: string, event: CommentThreadChangedEvent<ICellRange>): void;
    disposeCommentThread(ownerId: string, threadId: string): void;
    getDocumentComments(resource: URI): Promise<(ICommentInfo | null)[]>;
    getNotebookComments(resource: URI): Promise<(INotebookCommentInfo | null)[]>;
    updateCommentingRanges(ownerId: string, resourceHints?: CommentingRangeResourceHint): void;
    hasReactionHandler(uniqueOwner: string): boolean;
    toggleReaction(uniqueOwner: string, resource: URI, thread: CommentThread<IRange | ICellRange>, comment: Comment, reaction: CommentReaction): Promise<void>;
    setActiveEditingCommentThread(commentThread: CommentThread<IRange | ICellRange> | null): void;
    setCurrentCommentThread(commentThread: CommentThread<IRange | ICellRange> | undefined): void;
    setActiveCommentAndThread(uniqueOwner: string, commentInfo: {
        thread: CommentThread<IRange | ICellRange>;
        comment?: Comment;
    } | undefined): Promise<void>;
    enableCommenting(enable: boolean): void;
    registerContinueOnCommentProvider(provider: IContinueOnCommentProvider): IDisposable;
    removeContinueOnComment(pendingComment: {
        range: IRange | undefined;
        uri: URI;
        uniqueOwner: string;
        isReply?: boolean;
    }): PendingCommentThread | undefined;
    resourceHasCommentingRanges(resource: URI): boolean;
}
