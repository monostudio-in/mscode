import { IKeyboardEvent } from "../../base/browser/keyboardEvent.js";
import { IMouseEvent, IMouseWheelEvent } from "../../base/browser/mouseEvent.js";
import { IBoundarySashes } from "../../base/browser/ui/sash/sash.js";
import { Event } from "../../base/common/event.js";
import { MenuId } from "../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../platform/contextkey/common/contextkey.service.js";
import { ServicesAccessor } from "../../platform/instantiation/common/instantiation.js";
import { ConfigurationChangedEvent, EditorLayoutInfo, EditorOption, FindComputedEditorOptionValueById, IComputedEditorOptions, IDiffEditorOptions, IEditorOptions, OverviewRulerPosition } from "../common/config/editorOptions.js";
import { IDimension } from "../common/core/2d/dimension.js";
import { TextEdit } from "../common/core/edits/textEdit.js";
import { IPosition, Position } from "../common/core/position.js";
import { IRange, Range } from "../common/core/range.js";
import { Selection } from "../common/core/selection.js";
import { IWordAtPosition } from "../common/core/wordHelper.js";
import { ICursorPositionChangedEvent, ICursorSelectionChangedEvent } from "../common/cursorEvents.js";
import { IDiffComputationResult, ILineChange } from "../common/diff/legacyLinesDiffComputer.js";
import * as editorCommon from "../common/editorCommon.js";
import { GlyphMarginLane, ICursorStateComputer, IIdentifiedSingleEditOperation, IModelDecoration, IModelDecorationsChangeAccessor, IModelDeltaDecoration, ITextModel, PositionAffinity } from "../common/model.js";
import { InjectedText } from "../common/modelLineProjectionData.js";
import { TextModelEditSource } from "../common/textModelEditSource.js";
import { IModelContentChangedEvent, IModelDecorationsChangedEvent, IModelLanguageChangedEvent, IModelLanguageConfigurationChangedEvent, IModelOptionsChangedEvent, IModelTokensChangedEvent, ModelFontChangedEvent, ModelLineHeightChangedEvent } from "../common/textModelEvents.js";
import { IEditorWhitespace, IViewModel } from "../common/viewModel.js";
import { OverviewRulerZone } from "../common/viewModel/overviewZoneManager.js";
import { IEditorConstructionOptions } from "./config/editorConfiguration.js";
import { IClipboardCopyEvent, IClipboardPasteEvent } from "./controller/editContext/clipboardUtils.js";
/**
 * A view zone is a full horizontal rectangle that 'pushes' text down.
 * The editor reserves space for view zones when rendering.
 */
export interface IViewZone {
    /**
     * The line number after which this zone should appear.
     * Use 0 to place a view zone before the first line number.
     */
    afterLineNumber: number;
    /**
     * The column after which this zone should appear.
     * If not set, the maxLineColumn of `afterLineNumber` will be used.
     * This is relevant for wrapped lines.
     */
    afterColumn?: number;
    /**
     * If the `afterColumn` has multiple view columns, the affinity specifies which one to use. Defaults to `none`.
    */
    afterColumnAffinity?: PositionAffinity;
    /**
     * Render the zone even when its line is hidden.
     */
    showInHiddenAreas?: boolean;
    /**
     * Tiebreaker that is used when multiple view zones want to be after the same line.
     * Defaults to `afterColumn` otherwise 10000;
     */
    ordinal?: number;
    /**
     * Suppress mouse down events.
     * If set, the editor will attach a mouse down listener to the view zone and .preventDefault on it.
     * Defaults to false
     */
    suppressMouseDown?: boolean;
    /**
     * The height in lines of the view zone.
     * If specified, `heightInPx` will be used instead of this.
     * If neither `heightInPx` nor `heightInLines` is specified, a default of `heightInLines` = 1 will be chosen.
     */
    heightInLines?: number;
    /**
     * The height in px of the view zone.
     * If this is set, the editor will give preference to it rather than `heightInLines` above.
     * If neither `heightInPx` nor `heightInLines` is specified, a default of `heightInLines` = 1 will be chosen.
     */
    heightInPx?: number;
    /**
     * The minimum width in px of the view zone.
     * If this is set, the editor will ensure that the scroll width is >= than this value.
     */
    minWidthInPx?: number;
    /**
     * The dom node of the view zone
     */
    domNode: HTMLElement;
    /**
     * An optional dom node for the view zone that will be placed in the margin area.
     */
    marginDomNode?: HTMLElement | null;
    /**
     * Callback which gives the relative top of the view zone as it appears (taking scrolling into account).
     */
    onDomNodeTop?: (top: number) => void;
    /**
     * Callback which gives the height in pixels of the view zone.
     */
    onComputedHeight?: (height: number) => void;
}
/**
 * An accessor that allows for zones to be added or removed.
 */
export interface IViewZoneChangeAccessor {
    /**
     * Create a new view zone.
     * @param zone Zone to create
     * @return A unique identifier to the view zone.
     */
    addZone(zone: IViewZone): string;
    /**
     * Remove a zone
     * @param id A unique identifier to the view zone, as returned by the `addZone` call.
     */
    removeZone(id: string): void;
    /**
     * Change a zone's position.
     * The editor will rescan the `afterLineNumber` and `afterColumn` properties of a view zone.
     */
    layoutZone(id: string): void;
}
/**
 * A positioning preference for rendering content widgets.
 */
export declare enum ContentWidgetPositionPreference {
    /**
     * Place the content widget exactly at a position
     */
    EXACT = 0,
    /**
     * Place the content widget above a position
     */
    ABOVE = 1,
    /**
     * Place the content widget below a position
     */
    BELOW = 2
}
/**
 * A position for rendering content widgets.
 */
export interface IContentWidgetPosition {
    /**
     * Desired position which serves as an anchor for placing the content widget.
     * The widget will be placed above, at, or below the specified position, based on the
     * provided preference. The widget will always touch this position.
     *
     * Given sufficient horizontal space, the widget will be placed to the right of the
     * passed in position. This can be tweaked by providing a `secondaryPosition`.
     *
     * @see preference
     * @see secondaryPosition
     */
    position: IPosition | null;
    /**
     * Optionally, a secondary position can be provided to further define the placing of
     * the content widget. The secondary position must have the same line number as the
     * primary position. If possible, the widget will be placed such that it also touches
     * the secondary position.
     */
    secondaryPosition?: IPosition | null;
    /**
     * Placement preference for position, in order of preference.
     */
    preference: ContentWidgetPositionPreference[];
    /**
     * Placement preference when multiple view positions refer to the same (model) position.
     * This plays a role when injected text is involved.
    */
    positionAffinity?: PositionAffinity;
}
/**
 * A content widget renders inline with the text and can be easily placed 'near' an editor position.
 */
export interface IContentWidget {
    /**
     * Render this content widget in a location where it could overflow the editor's view dom node.
     */
    allowEditorOverflow?: boolean;
    /**
     * If true, this widget doesn't have a visual representation.
     * The element will have display set to 'none'.
    */
    useDisplayNone?: boolean;
    /**
     * Call preventDefault() on mousedown events that target the content widget.
     */
    suppressMouseDown?: boolean;
    /**
     * Get a unique identifier of the content widget.
     */
    getId(): string;
    /**
     * Get the dom node of the content widget.
     */
    getDomNode(): HTMLElement;
    /**
     * Get the placement of the content widget.
     * If null is returned, the content widget will be placed off screen.
     */
    getPosition(): IContentWidgetPosition | null;
    /**
     * Optional function that is invoked before rendering
     * the content widget. If a dimension is returned the editor will
     * attempt to use it.
     */
    beforeRender?(): IDimension | null;
    /**
     * Optional function that is invoked after rendering the content
     * widget. Is being invoked with the selected position preference
     * or `null` if not rendered.
     */
    afterRender?(position: ContentWidgetPositionPreference | null, coordinate: IContentWidgetRenderedCoordinate | null): void;
}
/**
 * Coordinatees passed in {@link IContentWidget.afterRender}
 */
export interface IContentWidgetRenderedCoordinate {
    /**
     * Top position relative to the editor content.
     */
    readonly top: number;
    /**
     * Left position relative to the editor content.
     */
    readonly left: number;
}
/**
 * A positioning preference for rendering overlay widgets.
 */
export declare enum OverlayWidgetPositionPreference {
    /**
     * Position the overlay widget in the top right corner
     */
    TOP_RIGHT_CORNER = 0,
    /**
     * Position the overlay widget in the bottom right corner
     */
    BOTTOM_RIGHT_CORNER = 1,
    /**
     * Position the overlay widget in the top center
     */
    TOP_CENTER = 2
}
/**
 * Represents editor-relative coordinates of an overlay widget.
 */
export interface IOverlayWidgetPositionCoordinates {
    /**
     * The top position for the overlay widget, relative to the editor.
     */
    top: number;
    /**
     * The left position for the overlay widget, relative to the editor.
     */
    left: number;
}
/**
 * A position for rendering overlay widgets.
 */
export interface IOverlayWidgetPosition {
    /**
     * The position preference for the overlay widget.
     */
    preference: OverlayWidgetPositionPreference | IOverlayWidgetPositionCoordinates | null;
    /**
     * When set, stacks with other overlay widgets with the same preference,
     * in an order determined by the ordinal value.
     */
    stackOrdinal?: number;
}
/**
 * An overlay widgets renders on top of the text.
 */
export interface IOverlayWidget {
    /**
     * Event fired when the widget layout changes.
     */
    readonly onDidLayout?: Event<void>;
    /**
     * Render this overlay widget in a location where it could overflow the editor's view dom node.
     */
    allowEditorOverflow?: boolean;
    /**
     * Get a unique identifier of the overlay widget.
     */
    getId(): string;
    /**
     * Get the dom node of the overlay widget.
     */
    getDomNode(): HTMLElement;
    /**
     * Get the placement of the overlay widget.
     * If null is returned, the overlay widget is responsible to place itself.
     */
    getPosition(): IOverlayWidgetPosition | null;
    /**
     * The editor will ensure that the scroll width is >= than this value.
     */
    getMinContentWidthInPx?(): number;
}
/**
 * A glyph margin widget renders in the editor glyph margin.
 */
export interface IGlyphMarginWidget {
    /**
     * Get a unique identifier of the glyph widget.
     */
    getId(): string;
    /**
     * Get the dom node of the glyph widget.
     */
    getDomNode(): HTMLElement;
    /**
     * Get the placement of the glyph widget.
     */
    getPosition(): IGlyphMarginWidgetPosition;
}
/**
 * A position for rendering glyph margin widgets.
 */
export interface IGlyphMarginWidgetPosition {
    /**
     * The glyph margin lane where the widget should be shown.
     */
    lane: GlyphMarginLane;
    /**
     * The priority order of the widget, used for determining which widget
     * to render when there are multiple.
     */
    zIndex: number;
    /**
     * The editor range that this widget applies to.
     */
    range: IRange;
}
/**
 * Type of hit element with the mouse in the editor.
 */
export declare enum MouseTargetType {
    /**
     * Mouse is on top of an unknown element.
     */
    UNKNOWN = 0,
    /**
     * Mouse is on top of the textarea used for input.
     */
    TEXTAREA = 1,
    /**
     * Mouse is on top of the glyph margin
     */
    GUTTER_GLYPH_MARGIN = 2,
    /**
     * Mouse is on top of the line numbers
     */
    GUTTER_LINE_NUMBERS = 3,
    /**
     * Mouse is on top of the line decorations
     */
    GUTTER_LINE_DECORATIONS = 4,
    /**
     * Mouse is on top of the whitespace left in the gutter by a view zone.
     */
    GUTTER_VIEW_ZONE = 5,
    /**
     * Mouse is on top of text in the content.
     */
    CONTENT_TEXT = 6,
    /**
     * Mouse is on top of empty space in the content (e.g. after line text or below last line)
     */
    CONTENT_EMPTY = 7,
    /**
     * Mouse is on top of a view zone in the content.
     */
    CONTENT_VIEW_ZONE = 8,
    /**
     * Mouse is on top of a content widget.
     */
    CONTENT_WIDGET = 9,
    /**
     * Mouse is on top of the decorations overview ruler.
     */
    OVERVIEW_RULER = 10,
    /**
     * Mouse is on top of a scrollbar.
     */
    SCROLLBAR = 11,
    /**
     * Mouse is on top of an overlay widget.
     */
    OVERLAY_WIDGET = 12,
    /**
     * Mouse is outside of the editor.
     */
    OUTSIDE_EDITOR = 13
}
export interface IBaseMouseTarget {
    /**
     * The target element
     */
    readonly element: HTMLElement | null;
    /**
     * The 'approximate' editor position
     */
    readonly position: Position | null;
    /**
     * Desired mouse column (e.g. when position.column gets clamped to text length -- clicking after text on a line).
     */
    readonly mouseColumn: number;
    /**
     * The 'approximate' editor range
     */
    readonly range: Range | null;
}
export interface IMouseTargetUnknown extends IBaseMouseTarget {
    readonly type: MouseTargetType.UNKNOWN;
}
export interface IMouseTargetTextarea extends IBaseMouseTarget {
    readonly type: MouseTargetType.TEXTAREA;
    readonly position: null;
    readonly range: null;
}
export interface IMouseTargetMarginData {
    readonly isAfterLines: boolean;
    readonly glyphMarginLeft: number;
    readonly glyphMarginWidth: number;
    readonly glyphMarginLane?: GlyphMarginLane;
    readonly lineNumbersWidth: number;
    readonly offsetX: number;
}
export interface IMouseTargetMargin extends IBaseMouseTarget {
    readonly type: MouseTargetType.GUTTER_GLYPH_MARGIN | MouseTargetType.GUTTER_LINE_NUMBERS | MouseTargetType.GUTTER_LINE_DECORATIONS;
    readonly position: Position;
    readonly range: Range;
    readonly detail: IMouseTargetMarginData;
}
export interface IMouseTargetViewZoneData {
    readonly viewZoneId: string;
    readonly positionBefore: Position | null;
    readonly positionAfter: Position | null;
    readonly position: Position;
    readonly afterLineNumber: number;
}
export interface IMouseTargetViewZone extends IBaseMouseTarget {
    readonly type: MouseTargetType.GUTTER_VIEW_ZONE | MouseTargetType.CONTENT_VIEW_ZONE;
    readonly position: Position;
    readonly range: Range;
    readonly detail: IMouseTargetViewZoneData;
}
export interface IMouseTargetContentTextData {
    readonly mightBeForeignElement: boolean;
    /**
     * @internal
     */
    readonly injectedText: InjectedText | null;
}
export interface IMouseTargetContentText extends IBaseMouseTarget {
    readonly type: MouseTargetType.CONTENT_TEXT;
    readonly position: Position;
    readonly range: Range;
    readonly detail: IMouseTargetContentTextData;
}
export interface IMouseTargetContentEmptyData {
    readonly isAfterLines: boolean;
    readonly horizontalDistanceToText?: number;
}
export interface IMouseTargetContentEmpty extends IBaseMouseTarget {
    readonly type: MouseTargetType.CONTENT_EMPTY;
    readonly position: Position;
    readonly range: Range;
    readonly detail: IMouseTargetContentEmptyData;
}
export interface IMouseTargetContentWidget extends IBaseMouseTarget {
    readonly type: MouseTargetType.CONTENT_WIDGET;
    readonly position: null;
    readonly range: null;
    readonly detail: string;
}
export interface IMouseTargetOverlayWidget extends IBaseMouseTarget {
    readonly type: MouseTargetType.OVERLAY_WIDGET;
    readonly position: null;
    readonly range: null;
    readonly detail: string;
}
export interface IMouseTargetScrollbar extends IBaseMouseTarget {
    readonly type: MouseTargetType.SCROLLBAR;
    readonly position: Position;
    readonly range: Range;
}
export interface IMouseTargetOverviewRuler extends IBaseMouseTarget {
    readonly type: MouseTargetType.OVERVIEW_RULER;
}
export interface IMouseTargetOutsideEditor extends IBaseMouseTarget {
    readonly type: MouseTargetType.OUTSIDE_EDITOR;
    readonly outsidePosition: "above" | "below" | "left" | "right";
    readonly outsideDistance: number;
}
/**
 * Target hit with the mouse in the editor.
 */
export type IMouseTarget = (IMouseTargetUnknown | IMouseTargetTextarea | IMouseTargetMargin | IMouseTargetViewZone | IMouseTargetContentText | IMouseTargetContentEmpty | IMouseTargetContentWidget | IMouseTargetOverlayWidget | IMouseTargetScrollbar | IMouseTargetOverviewRuler | IMouseTargetOutsideEditor);
/**
 * A mouse event originating from the editor.
 */
export interface IEditorMouseEvent {
    readonly event: IMouseEvent;
    readonly target: IMouseTarget;
}
export interface IPartialEditorMouseEvent {
    readonly event: IMouseEvent;
    readonly target: IMouseTarget | null;
}
/**
 * A paste event originating from the editor.
 */
export interface IPasteEvent {
    readonly range: Range;
    readonly languageId: string | null;
    readonly clipboardEvent?: ClipboardEvent;
}
/**
 * @internal
 */
export interface PastePayload {
    text: string;
    pasteOnNewLine: boolean;
    multicursorText: string[] | null;
    mode: string | null;
    clipboardEvent?: ClipboardEvent;
}
/**
 * An overview ruler
 * @internal
 */
export interface IOverviewRuler {
    getDomNode(): HTMLElement;
    dispose(): void;
    setZones(zones: OverviewRulerZone[]): void;
    setLayout(position: OverviewRulerPosition): void;
}
/**
 * Editor aria options.
 * @internal
 */
export interface IEditorAriaOptions {
    activeDescendant: string | undefined;
    role?: string;
}
export interface IDiffEditorConstructionOptions extends IDiffEditorOptions, IEditorConstructionOptions {
    /**
     * Place overflow widgets inside an external DOM node.
     * Defaults to an internal DOM node.
     */
    overflowWidgetsDomNode?: HTMLElement;
    /**
     * Aria label for original editor.
     */
    originalAriaLabel?: string;
    /**
     * Aria label for modified editor.
     */
    modifiedAriaLabel?: string;
}
/**
 * A rich code editor.
 */
export type ICodeEditor = import("monaco-editor").editor.ICodeEditor;
/**
 * @internal
 */
export interface IActiveCodeEditor extends ICodeEditor {
    /**
     * Returns the primary position of the cursor.
     */
    getPosition(): Position;
    /**
     * Returns the primary selection of the editor.
     */
    getSelection(): Selection;
    /**
     * Returns all the selections of the editor.
     */
    getSelections(): Selection[];
    /**
     * Saves current view state of the editor in a serializable object.
     */
    saveViewState(): editorCommon.ICodeEditorViewState;
    /**
     * Type the getModel() of IEditor.
     */
    getModel(): ITextModel;
    /**
     * @internal
     */
    _getViewModel(): IViewModel;
    /**
     * Get all the decorations on a line (filtering out decorations from other editors).
     */
    getLineDecorations(lineNumber: number): IModelDecoration[];
    /**
     * Returns the editor's dom node
     */
    getDomNode(): HTMLElement;
    /**
     * Get the visible position for `position`.
     * The result position takes scrolling into account and is relative to the top left corner of the editor.
     * Explanation 1: the results of this method will change for the same `position` if the user scrolls the editor.
     * Explanation 2: the results of this method will not change if the container of the editor gets repositioned.
     * Warning: the results of this method are inaccurate for positions that are outside the current editor viewport.
     */
    getScrolledVisiblePosition(position: IPosition): {
        top: number;
        left: number;
        height: number;
    };
    /**
     * Change the decorations. All decorations added through this changeAccessor
     * will get the ownerId of the editor (meaning they will not show up in other
     * editors).
     * @see {@link ITextModel.changeDecorations}
     * @internal
     */
    changeDecorations<T>(callback: (changeAccessor: IModelDecorationsChangeAccessor) => T): T;
}
/**
 * @internal
 */
export declare enum DiffEditorState {
    Idle = 0,
    ComputingDiff = 1,
    DiffComputed = 2
}
/**
 * A rich diff editor.
 */
export interface IDiffEditor extends editorCommon.IEditor {
    /**
     * Returns whether the diff editor is ignoring trim whitespace or not.
     * @internal
     */
    readonly ignoreTrimWhitespace: boolean;
    /**
     * Returns whether the diff editor is rendering side by side or inline.
     * @internal
     */
    readonly renderSideBySide: boolean;
    /**
     * Timeout in milliseconds after which diff computation is cancelled.
     * @internal
     */
    readonly maxComputationTime: number;
    /**
     * @see {@link ICodeEditor.getContainerDomNode}
     */
    getContainerDomNode(): HTMLElement;
    /**
     * An event emitted when the diff information computed by this diff editor has been updated.
     * @event
     */
    readonly onDidUpdateDiff: Event<void>;
    /**
     * An event emitted when the diff model is changed (i.e. the diff editor shows new content).
     * @event
     */
    readonly onDidChangeModel: Event<void>;
    /**
     * Saves current view state of the editor in a serializable object.
     */
    saveViewState(): editorCommon.IDiffEditorViewState | null;
    /**
     * Restores the view state of the editor from a serializable object generated by `saveViewState`.
     */
    restoreViewState(state: editorCommon.IDiffEditorViewState | null): void;
    /**
     * Type the getModel() of IEditor.
     */
    getModel(): editorCommon.IDiffEditorModel | null;
    createViewModel(model: editorCommon.IDiffEditorModel): editorCommon.IDiffEditorViewModel;
    /**
     * Sets the current model attached to this editor.
     * If the previous model was created by the editor via the value key in the options
     * literal object, it will be destroyed. Otherwise, if the previous model was set
     * via setModel, or the model key in the options literal object, the previous model
     * will not be destroyed.
     * It is safe to call setModel(null) to simply detach the current model from the editor.
     */
    setModel(model: editorCommon.IDiffEditorModel | editorCommon.IDiffEditorViewModel | null): void;
    /**
     * Get the `original` editor.
     */
    getOriginalEditor(): ICodeEditor;
    /**
     * Get the `modified` editor.
     */
    getModifiedEditor(): ICodeEditor;
    /**
     * Get the computed diff information.
     */
    getLineChanges(): ILineChange[] | null;
    /**
     * Get the computed diff information.
     * @internal
     */
    getDiffComputationResult(): IDiffComputationResult | null;
    /**
     * Update the editor's options after the editor has been created.
     */
    updateOptions(newOptions: IDiffEditorOptions): void;
    /**
     * @internal
     */
    setBoundarySashes(sashes: IBoundarySashes): void;
    /**
     * Jumps to the next or previous diff.
     */
    goToDiff(target: "next" | "previous"): void;
    /**
     * Scrolls to the first diff.
     * (Waits until the diff computation finished.)
     */
    revealFirstDiff(): unknown;
    accessibleDiffViewerNext(): void;
    accessibleDiffViewerPrev(): void;
    handleInitialized(): void;
}
/**
 *@internal
 */
export declare function isCodeEditor(thing: unknown): thing is ICodeEditor;
/**
 *@internal
 */
export declare function isDiffEditor(thing: unknown): thing is IDiffEditor;
/**
 *@internal
 */
export declare function isCompositeEditor(thing: unknown): thing is editorCommon.ICompositeCodeEditor;
/**
 *@internal
 */
export declare function getCodeEditor(thing: unknown): ICodeEditor | null;
/**
 *@internal
 */
export declare function getIEditor(thing: unknown): editorCommon.IEditor | null;
/**
 *@internal
 */
export declare function isIOverlayWidgetPositionCoordinates(thing: unknown): thing is IOverlayWidgetPositionCoordinates;
