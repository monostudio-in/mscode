import { Event } from "../../base/common/event.js";
import { IMarkdownString } from "../../base/common/htmlContent.js";
import { IDisposable } from "../../base/common/lifecycle.js";
import { ThemeColor } from "../../base/common/themables.js";
import { URI, UriComponents } from "../../base/common/uri.js";
import { IEditorOptions } from "./config/editorOptions.js";
import { IDimension } from "./core/2d/dimension.js";
import { IPosition, Position } from "./core/position.js";
import { IRange, Range } from "./core/range.js";
import { ISelection, Selection } from "./core/selection.js";
import { IModelDecoration, IModelDecorationsChangeAccessor, IModelDeltaDecoration, ITextModel, IValidEditOperation, OverviewRulerLane, TrackedRangeStickiness } from "./model.js";
import { IModelDecorationsChangedEvent } from "./textModelEvents.js";
import { ICommandMetadata } from "../../platform/commands/common/commands.js";
/**
 * A builder and helper for edit operations for a command.
 */
export interface IEditOperationBuilder {
    /**
     * Add a new edit operation (a replace operation).
     * @param range The range to replace (delete). May be empty to represent a simple insert.
     * @param text The text to replace with. May be null to represent a simple delete.
     */
    addEditOperation(range: IRange, text: string | null, forceMoveMarkers?: boolean): void;
    /**
     * Add a new edit operation (a replace operation).
     * The inverse edits will be accessible in `ICursorStateComputerData.getInverseEditOperations()`
     * @param range The range to replace (delete). May be empty to represent a simple insert.
     * @param text The text to replace with. May be null to represent a simple delete.
     */
    addTrackedEditOperation(range: IRange, text: string | null, forceMoveMarkers?: boolean): void;
    /**
     * Track `selection` when applying edit operations.
     * A best effort will be made to not grow/expand the selection.
     * An empty selection will clamp to a nearby character.
     * @param selection The selection to track.
     * @param trackPreviousOnEmpty If set, and the selection is empty, indicates whether the selection
     *           should clamp to the previous or the next character.
     * @return A unique identifier.
     */
    trackSelection(selection: Selection, trackPreviousOnEmpty?: boolean): string;
}
/**
 * A helper for computing cursor state after a command.
 */
export interface ICursorStateComputerData {
    /**
     * Get the inverse edit operations of the added edit operations.
     */
    getInverseEditOperations(): IValidEditOperation[];
    /**
     * Get a previously tracked selection.
     * @param id The unique identifier returned by `trackSelection`.
     * @return The selection.
     */
    getTrackedSelection(id: string): Selection;
}
/**
 * A command that modifies text / cursor state on a model.
 */
export interface ICommand {
    /**
     * Signal that this command is inserting automatic whitespace that should be trimmed if possible.
     * @internal
     */
    readonly insertsAutoWhitespace?: boolean;
    /**
     * Get the edit operations needed to execute this command.
     * @param model The model the command will execute on.
     * @param builder A helper to collect the needed edit operations and to track selections.
     */
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    /**
     * Compute the cursor state after the edit operations were applied.
     * @param model The model the command has executed on.
     * @param helper A helper to get inverse edit operations and to get previously tracked selections.
     * @return The cursor state after the command executed.
     */
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
/**
 * A model for the diff editor.
 */
export interface IDiffEditorModel {
    /**
     * Original model.
     */
    original: ITextModel;
    /**
     * Modified model.
     */
    modified: ITextModel;
}
export interface IDiffEditorViewModel extends IDisposable {
    readonly model: IDiffEditorModel;
    waitForDiff(): Promise<void>;
}
/**
 * An event describing that an editor has had its model reset (i.e. `editor.setModel()`).
 */
export interface IModelChangedEvent {
    /**
     * The `uri` of the previous model or null.
     */
    readonly oldModelUrl: URI | null;
    /**
     * The `uri` of the new model or null.
     */
    readonly newModelUrl: URI | null;
}
export interface IScrollEvent {
    readonly scrollTop: number;
    readonly scrollLeft: number;
    readonly scrollWidth: number;
    readonly scrollHeight: number;
    readonly scrollTopChanged: boolean;
    readonly scrollLeftChanged: boolean;
    readonly scrollWidthChanged: boolean;
    readonly scrollHeightChanged: boolean;
}
export interface IContentSizeChangedEvent {
    readonly contentWidth: number;
    readonly contentHeight: number;
    readonly contentWidthChanged: boolean;
    readonly contentHeightChanged: boolean;
}
/**
 * @internal
 */
export interface ITriggerEditorOperationEvent {
    source: string | null | undefined;
    handlerId: string;
    payload: unknown;
}
export interface INewScrollPosition {
    scrollLeft?: number;
    scrollTop?: number;
}
export interface IEditorAction {
    readonly id: string;
    readonly label: string;
    readonly alias: string;
    readonly metadata: ICommandMetadata | undefined;
    isSupported(): boolean;
    run(args?: unknown): Promise<void>;
}
export type IEditorModel = ITextModel | IDiffEditorModel | IDiffEditorViewModel;
/**
 * A (serializable) state of the cursors.
 */
export interface ICursorState {
    inSelectionMode: boolean;
    selectionStart: IPosition;
    position: IPosition;
}
/**
 * A (serializable) state of the view.
 */
export interface IViewState {
    /** written by previous versions */
    scrollTop?: number;
    /** written by previous versions */
    scrollTopWithoutViewZones?: number;
    scrollLeft: number;
    firstPosition: IPosition;
    firstPositionDeltaTop: number;
}
/**
 * A (serializable) state of the code editor.
 */
export interface ICodeEditorViewState {
    cursorState: ICursorState[];
    viewState: IViewState;
    contributionsState: {
        [id: string]: unknown;
    };
}
/**
 * (Serializable) View state for the diff editor.
 */
export interface IDiffEditorViewState {
    original: ICodeEditorViewState | null;
    modified: ICodeEditorViewState | null;
    modelState?: unknown;
}
/**
 * An editor view state.
 */
export type IEditorViewState = ICodeEditorViewState | IDiffEditorViewState;
export declare enum ScrollType {
    Smooth = 0,
    Immediate = 1
}
/**
 * An editor.
 */
export type IEditor = import("monaco-editor").editor.IEditor;
/**
 * A diff editor.
 *
 * @internal
 */
export interface IDiffEditor extends IEditor {
    /**
     * Type the getModel() of IEditor.
     */
    getModel(): IDiffEditorModel | null;
    /**
     * Get the `original` editor.
     */
    getOriginalEditor(): IEditor;
    /**
     * Get the `modified` editor.
     */
    getModifiedEditor(): IEditor;
}
/**
 * @internal
 */
export interface ICompositeCodeEditor {
    /**
     * An event that signals that the active editor has changed
     */
    readonly onDidChangeActiveEditor: Event<ICompositeCodeEditor>;
    /**
     * The active code editor iff any
     */
    readonly activeCodeEditor: IEditor | undefined;
}
/**
 * A collection of decorations
 */
export interface IEditorDecorationsCollection {
    /**
     * An event emitted when decorations change in the editor,
     * but the change is not caused by us setting or clearing the collection.
     */
    readonly onDidChange: Event<IModelDecorationsChangedEvent>;
    /**
     * Get the decorations count.
     */
    length: number;
    /**
     * Get the range for a decoration.
     */
    getRange(index: number): Range | null;
    /**
     * Get all ranges for decorations.
     */
    getRanges(): Range[];
    /**
     * Determine if a decoration is in this collection.
     */
    has(decoration: IModelDecoration): boolean;
    /**
     * Replace all previous decorations with `newDecorations`.
     */
    set(newDecorations: readonly IModelDeltaDecoration[]): string[];
    /**
     * Append `newDecorations` to this collection.
     */
    append(newDecorations: readonly IModelDeltaDecoration[]): string[];
    /**
     * Remove all previous decorations.
     */
    clear(): void;
}
/**
 * An editor contribution that gets created every time a new editor gets created and gets disposed when the editor gets disposed.
 */
export interface IEditorContribution {
    /**
     * Dispose this contribution.
     */
    dispose(): void;
    /**
     * Store view state.
     */
    saveViewState?(): unknown;
    /**
     * Restore view state.
     */
    restoreViewState?(state: unknown): void;
}
/**
 * A diff editor contribution that gets created every time a new  diffeditor gets created and gets disposed when the diff editor gets disposed.
 * @internal
 */
export interface IDiffEditorContribution {
    /**
     * Dispose this contribution.
     */
    dispose(): void;
}
/**
 * @internal
 */
export declare function isThemeColor(o: unknown): o is ThemeColor;
/**
 * @internal
 */
export interface IThemeDecorationRenderOptions {
    backgroundColor?: string | ThemeColor;
    outline?: string;
    outlineColor?: string | ThemeColor;
    outlineStyle?: string;
    outlineWidth?: string;
    border?: string;
    borderColor?: string | ThemeColor;
    borderRadius?: string;
    borderSpacing?: string;
    borderStyle?: string;
    borderWidth?: string;
    fontStyle?: string;
    fontWeight?: string;
    fontFamily?: string;
    fontSize?: string;
    lineHeight?: number;
    textDecoration?: string;
    cursor?: string;
    color?: string | ThemeColor;
    opacity?: string;
    letterSpacing?: string;
    gutterIconPath?: UriComponents;
    gutterIconSize?: string;
    overviewRulerColor?: string | ThemeColor;
    /**
     * @deprecated
     */
    before?: IContentDecorationRenderOptions;
    /**
     * @deprecated
     */
    after?: IContentDecorationRenderOptions;
    /**
     * @deprecated
     */
    beforeInjectedText?: IContentDecorationRenderOptions & {
        affectsLetterSpacing?: boolean;
    };
    /**
     * @deprecated
     */
    afterInjectedText?: IContentDecorationRenderOptions & {
        affectsLetterSpacing?: boolean;
    };
}
/**
 * @internal
 */
export interface IContentDecorationRenderOptions {
    contentText?: string;
    contentIconPath?: UriComponents;
    border?: string;
    borderColor?: string | ThemeColor;
    borderRadius?: string;
    fontStyle?: string;
    fontWeight?: string;
    fontSize?: string;
    fontFamily?: string;
    textDecoration?: string;
    color?: string | ThemeColor;
    backgroundColor?: string | ThemeColor;
    opacity?: string;
    verticalAlign?: string;
    margin?: string;
    padding?: string;
    width?: string;
    height?: string;
}
/**
 * @internal
 */
export interface IDecorationRenderOptions extends IThemeDecorationRenderOptions {
    isWholeLine?: boolean;
    rangeBehavior?: TrackedRangeStickiness;
    overviewRulerLane?: OverviewRulerLane;
    light?: IThemeDecorationRenderOptions;
    dark?: IThemeDecorationRenderOptions;
}
/**
 * @internal
 */
export interface IThemeDecorationInstanceRenderOptions {
    /**
     * @deprecated
     */
    before?: IContentDecorationRenderOptions;
    /**
     * @deprecated
     */
    after?: IContentDecorationRenderOptions;
}
/**
 * @internal
 */
export interface IDecorationInstanceRenderOptions extends IThemeDecorationInstanceRenderOptions {
    light?: IThemeDecorationInstanceRenderOptions;
    dark?: IThemeDecorationInstanceRenderOptions;
}
/**
 * @internal
 */
export interface IDecorationOptions {
    range: IRange;
    hoverMessage?: IMarkdownString | IMarkdownString[];
    renderOptions?: IDecorationInstanceRenderOptions;
}
/**
 * The type of the `IEditor`.
 */
export declare const EditorType: {
    ICodeEditor: string;
    IDiffEditor: string;
};
/**
 * Built-in commands.
 * @internal
 */
export declare enum Handler {
    CompositionStart = "compositionStart",
    CompositionEnd = "compositionEnd",
    Type = "type",
    ReplacePreviousChar = "replacePreviousChar",
    CompositionType = "compositionType",
    Paste = "paste",
    Cut = "cut"
}
/**
 * @internal
 */
export interface TypePayload {
    text: string;
}
/**
 * @internal
 */
export interface ReplacePreviousCharPayload {
    text: string;
    replaceCharCnt: number;
}
/**
 * @internal
 */
export interface CompositionTypePayload {
    text: string;
    replacePrevCharCnt: number;
    replaceNextCharCnt: number;
    positionDelta: number;
}
