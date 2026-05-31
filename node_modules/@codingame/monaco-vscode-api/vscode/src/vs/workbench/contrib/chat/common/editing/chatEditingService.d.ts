import { VSBuffer } from "../../../../../base/common/buffer.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Event } from "../../../../../base/common/event.js";
import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { IObservable, IReader } from "../../../../../base/common/observable.js";
import { URI } from "../../../../../base/common/uri.js";
import { IDocumentDiff } from "@codingame/monaco-vscode-chat-service-override/vscode/vs/editor/common/diff/documentDiffProvider";
import { TextEdit } from "../../../../../editor/common/languages.js";
import { ITextModel } from "../../../../../editor/common/model.js";
import { EditSuggestionId } from "../../../../../editor/common/textModelEditSource.js";
import { RawContextKey } from "../../../../../platform/contextkey/common/contextkey.js";
import { IEditorPane } from "../../../../common/editor.js";
import { ICellEditOperation } from "../../../notebook/common/notebookCommon.js";
import { IChatMultiDiffData, IChatProgress, IChatWorkspaceEdit } from "../chatService/chatService.js";
import { IChatRequestDisablement, IChatResponseModel } from "../model/chatModel.js";
import { IChatAgentResult } from "../participants/chatAgents.js";
export interface IChatEditingSessionProvider {
    createEditingSession(chatSessionResource: URI): IChatEditingSession;
}
export interface WorkingSetDisplayMetadata {
    state: ModifiedFileEntryState;
    description?: string;
}
export interface IStreamingEdits {
    pushText(edits: TextEdit[], isLastEdits: boolean): void;
    pushNotebookCellText(cell: URI, edits: TextEdit[], isLastEdits: boolean): void;
    pushNotebook(edits: ICellEditOperation[], isLastEdits: boolean): void;
    /** Marks edits as done, idempotent */
    complete(): void;
}
export interface IModifiedEntryTelemetryInfo {
    readonly agentId: string | undefined;
    readonly command: string | undefined;
    readonly sessionResource: URI;
    readonly requestId: string;
    readonly result: IChatAgentResult | undefined;
    readonly modelId: string | undefined;
    readonly modeId: "ask" | "edit" | "agent" | "custom" | "applyCodeBlock" | undefined;
    readonly applyCodeBlockSuggestionId: EditSuggestionId | undefined;
    readonly feature: "sideBarChat" | "inlineChat" | undefined;
}
export interface ISnapshotEntry {
    readonly resource: URI;
    readonly languageId: string;
    readonly snapshotUri: URI;
    readonly original: string;
    readonly current: string;
    readonly state: ModifiedFileEntryState;
    telemetryInfo: IModifiedEntryTelemetryInfo;
    /** True if this entry represents a deleted file */
    readonly isDeleted?: boolean;
}
export interface IChatEditingSession extends IDisposable {
    readonly isGlobalEditingSession: boolean;
    readonly supportsKeepUndo: boolean;
    readonly chatSessionResource: URI;
    readonly onDidDispose: Event<void>;
    readonly state: IObservable<ChatEditingSessionState>;
    readonly entries: IObservable<readonly IModifiedFileEntry[]>;
    /** Requests disabled by undo/redo in the session */
    readonly requestDisablement: IObservable<IChatRequestDisablement[]>;
    show(previousChanges?: boolean): Promise<void>;
    accept(...uris: URI[]): Promise<void>;
    reject(...uris: URI[]): Promise<void>;
    getEntry(uri: URI): IModifiedFileEntry | undefined;
    readEntry(uri: URI, reader: IReader): IModifiedFileEntry | undefined;
    restoreSnapshot(requestId: string, stopId: string | undefined): Promise<void>;
    /**
     * Marks all edits to the given resources as agent edits until
     * {@link stopExternalEdits} is called with the same ID. This is used for
     * agents that make changes on-disk rather than streaming edits through the
     * chat session.
     */
    startExternalEdits(responseModel: IChatResponseModel, operationId: number, resources: URI[], undoStopId: string, contentFor?: URI[]): Promise<IChatProgress[]>;
    stopExternalEdits(responseModel: IChatResponseModel, operationId: number, contentFor?: URI[]): Promise<IChatProgress[]>;
    /**
     * Gets the snapshot URI of a file at the request and _after_ changes made in the undo stop.
     * @param uri File in the workspace
     */
    getSnapshotUri(requestId: string, uri: URI, stopId: string | undefined): URI | undefined;
    getSnapshotContents(requestId: string, uri: URI, stopId: string | undefined): Promise<VSBuffer | undefined>;
    getSnapshotModel(requestId: string, undoStop: string | undefined, snapshotUri: URI): Promise<ITextModel | null>;
    /**
     * Will lead to this object getting disposed
     */
    stop(clearState?: boolean): Promise<void>;
    /**
     * Starts making edits to the resource.
     * @param resource URI that's being edited
     * @param responseModel The response model making the edits
     * @param inUndoStop The undo stop the edits will be grouped in
     */
    startStreamingEdits(resource: URI, responseModel: IChatResponseModel, inUndoStop: string | undefined): IStreamingEdits;
    /**
     * Applies a workspace edit (file deletions, creations, renames).
     * @param edit The workspace edit containing file operations
     * @param responseModel The response model making the edit
     * @param undoStopId The undo stop ID for this edit
     */
    applyWorkspaceEdit(edit: IChatWorkspaceEdit, responseModel: IChatResponseModel, undoStopId: string): void;
    /**
     * Gets the document diff of a change made to a URI between one undo stop and
     * the next one.
     * @returns The observable or undefined if there is no diff between the stops.
     */
    getEntryDiffBetweenStops(uri: URI, requestId: string | undefined, stopId: string | undefined): IObservable<IEditSessionEntryDiff | undefined> | undefined;
    /**
     * Gets the document diff of a change made to a URI between one request to another one.
     * @returns The observable or undefined if there is no diff between the requests.
     */
    getEntryDiffBetweenRequests(uri: URI, startRequestIs: string, stopRequestId: string): IObservable<IEditSessionEntryDiff | undefined>;
    /**
     * Gets the diff of each file modified in this session, comparing the initial
     * baseline to the current state.
     */
    getDiffsForFilesInSession(): IObservable<readonly IEditSessionEntryDiff[]>;
    /**
     * Gets the diff of each file modified in the request.
     */
    getDiffsForFilesInRequest(requestId: string): IObservable<readonly IEditSessionEntryDiff[]>;
    /**
     * Whether there are any edits made in the given request.
     */
    hasEditsInRequest(requestId: string, reader?: IReader): boolean;
    /**
     * Gets the aggregated diff stats for all files modified in this session.
     */
    getDiffForSession(): IObservable<IEditSessionDiffStats>;
    readonly canUndo: IObservable<boolean>;
    readonly canRedo: IObservable<boolean>;
    undoInteraction(): Promise<void>;
    redoInteraction(): Promise<void>;
    /**
     * Triggers generation of explanations for all modified files in the session.
     */
    triggerExplanationGeneration(): Promise<void>;
    /**
     * Clears any active explanation generation.
     */
    clearExplanations(): void;
    /**
     * Whether explanations are currently being generated or displayed.
     */
    hasExplanations(): boolean;
}
export declare function chatEditingSessionIsReady(session: IChatEditingSession): Promise<void>;
export declare function editEntriesToMultiDiffData(entriesObs: IObservable<readonly IEditSessionEntryDiff[]>): IChatMultiDiffData;
export declare function awaitCompleteChatEditingDiff(diff: IObservable<IEditSessionEntryDiff>, token?: CancellationToken): Promise<IEditSessionEntryDiff>;
export declare function awaitCompleteChatEditingDiff(diff: IObservable<readonly IEditSessionEntryDiff[]>, token?: CancellationToken): Promise<readonly IEditSessionEntryDiff[]>;
export interface IEditSessionDiffStats {
    /** Added data (e.g. line numbers) to show in the UI */
    added: number;
    /** Removed data (e.g. line numbers) to show in the UI */
    removed: number;
}
export interface IEditSessionEntryDiff extends IEditSessionDiffStats {
    /** LHS and RHS of a diff editor, if opened: */
    originalURI: URI;
    modifiedURI: URI;
    /** Diff state information: */
    quitEarly: boolean;
    identical: boolean;
    /** True if nothing else will be added to this diff. */
    isFinal: boolean;
    /** True if the diff is currently being computed or updated. */
    isBusy: boolean;
}
export declare function emptySessionEntryDiff(originalURI: URI, modifiedURI: URI): IEditSessionEntryDiff;
export declare enum ModifiedFileEntryState {
    Modified = 0,
    Accepted = 1,
    Rejected = 2
}
/**
 * Represents a part of a change
 */
export interface IModifiedFileEntryChangeHunk {
    accept(): Promise<boolean>;
    reject(): Promise<boolean>;
}
export interface IModifiedFileEntryEditorIntegration extends IDisposable {
    /**
     * The index of a change
     */
    currentIndex: IObservable<number>;
    /**
     * Reveal the first (`true`) or last (`false`) change
     */
    reveal(firstOrLast: boolean, preserveFocus?: boolean): void;
    /**
     * Go to next change and increate `currentIndex`
     * @param wrap When at the last, start over again or not
     * @returns If it went next
     */
    next(wrap: boolean): boolean;
    /**
     * @see `next`
     */
    previous(wrap: boolean): boolean;
    /**
     * Enable the accessible diff viewer for this editor
     */
    enableAccessibleDiffView(): void;
    /**
     * Accept the change given or the nearest
     * @param change An opaque change object
     */
    acceptNearestChange(change?: IModifiedFileEntryChangeHunk): Promise<void>;
    /**
     * @see `acceptNearestChange`
     */
    rejectNearestChange(change?: IModifiedFileEntryChangeHunk): Promise<void>;
    /**
     * Toggle between diff-editor and normal editor
     * @param change An opaque change object
     * @param show Optional boolean to control if the diff should show
     */
    toggleDiff(change: IModifiedFileEntryChangeHunk | undefined, show?: boolean): Promise<void>;
}
export interface IModifiedFileEntry {
    readonly entryId: string;
    readonly originalURI: URI;
    readonly modifiedURI: URI;
    readonly isDeletion?: boolean;
    readonly lastModifyingRequestId: string;
    readonly state: IObservable<ModifiedFileEntryState>;
    readonly isCurrentlyBeingModifiedBy: IObservable<{
        responseModel: IChatResponseModel;
        undoStopId: string | undefined;
    } | undefined>;
    readonly lastModifyingResponse: IObservable<IChatResponseModel | undefined>;
    readonly rewriteRatio: IObservable<number>;
    readonly waitsForLastEdits: IObservable<boolean>;
    accept(): Promise<void>;
    reject(): Promise<void>;
    reviewMode: IObservable<boolean>;
    autoAcceptController: IObservable<{
        total: number;
        remaining: number;
        cancel(): void;
    } | undefined>;
    enableReviewModeUntilSettled(): void;
    /**
     * Number of changes for this file
     */
    readonly changesCount: IObservable<number>;
    /**
     * Diff information for this entry
     */
    readonly diffInfo?: IObservable<IDocumentDiff>;
    /**
     * Number of lines added in this entry.
     */
    readonly linesAdded?: IObservable<number>;
    /**
     * Number of lines removed in this entry
     */
    readonly linesRemoved?: IObservable<number>;
    getEditorIntegration(editor: IEditorPane): IModifiedFileEntryEditorIntegration;
    /**
     * Gets the document diff info, waiting for any ongoing promises to flush.
     */
    getDiffInfo?(): Promise<IDocumentDiff>;
}
export interface IChatEditingSessionStream {
    textEdits(resource: URI, textEdits: TextEdit[], isLastEdits: boolean, responseModel: IChatResponseModel): void;
    notebookEdits(resource: URI, edits: ICellEditOperation[], isLastEdits: boolean, responseModel: IChatResponseModel): void;
}
export declare enum ChatEditingSessionState {
    Initial = 0,
    StreamingEdits = 1,
    Idle = 2,
    Disposed = 3
}
export declare const CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME = "chat-editing-multi-diff-source";
export declare const chatEditingWidgetFileStateContextKey: RawContextKey<ModifiedFileEntryState>;
export declare const chatEditingAgentSupportsReadonlyReferencesContextKey: RawContextKey<boolean>;
export declare const decidedChatEditingResourceContextKey: RawContextKey<string[]>;
export declare const chatEditingResourceContextKey: RawContextKey<string | undefined>;
export declare const inChatEditingSessionContextKey: RawContextKey<boolean | undefined>;
export declare const hasUndecidedChatEditingResourceContextKey: RawContextKey<boolean | undefined>;
export declare const hasAppliedChatEditsContextKey: RawContextKey<boolean | undefined>;
export declare const applyingChatEditsFailedContextKey: RawContextKey<boolean | undefined>;
export declare const chatEditingMaxFileAssignmentName = "chatEditingSessionFileLimit";
export declare const defaultChatEditingMaxFileLimit = 10;
export declare enum ChatEditKind {
    Created = 0,
    Modified = 1,
    Deleted = 2
}
export interface IChatEditingActionContext {
    sessionResource: URI;
}
export declare function isChatEditingActionContext(thing: unknown): thing is IChatEditingActionContext;
export declare function getMultiDiffSourceUri(session: IChatEditingSession, showPreviousChanges?: boolean): URI;
export declare function parseChatMultiDiffUri(uri: URI): {
    chatSessionResource: URI;
    showPreviousChanges: boolean;
};
