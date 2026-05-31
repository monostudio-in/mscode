import { Disposable, DisposableStore, IDisposable } from "../../base/common/lifecycle.js";
import { DebugLocation, IObservable, IObservableWithChange, IReader, ITransaction } from "../../base/common/observable.js";
import { EditorOption, FindComputedEditorOptionValueById } from "../common/config/editorOptions.js";
import { LineRange } from "../common/core/ranges/lineRange.js";
import { OffsetRange } from "../common/core/ranges/offsetRange.js";
import { Position } from "../common/core/position.js";
import { Selection } from "../common/core/selection.js";
import { ICursorSelectionChangedEvent } from "../common/cursorEvents.js";
import { IModelDeltaDecoration, ITextModel } from "../common/model.js";
import { IModelContentChangedEvent } from "../common/textModelEvents.js";
import { ICodeEditor, IContentWidgetPosition, IEditorMouseEvent, IOverlayWidgetPosition, IPasteEvent } from "./editorBrowser.js";
import { Point } from "../common/core/2d/point.js";
/**
 * Returns a facade for the code editor that provides observables for various states/events.
*/
export declare function observableCodeEditor(editor: ICodeEditor): ObservableCodeEditor;
export declare class ObservableCodeEditor extends Disposable {
    readonly editor: ICodeEditor;
    private static readonly _map;
    /**
     * Make sure that editor is not disposed yet!
    */
    static get(editor: ICodeEditor): ObservableCodeEditor;
    private _updateCounter;
    private _currentTransaction;
    private _beginUpdate;
    private _endUpdate;
    private constructor();
    /**
     * Batches the transactions started by observableFromEvent.
     *
     * If the callback causes the editor to fire an event that updates
     * an observable value backed by observableFromEvent (such as scrollTop etc.),
     * then all such updates will be part of the same transaction.
    */
    transaction<T>(cb: (tx: ITransaction) => T): T;
    forceUpdate(): void;
    forceUpdate<T>(cb: (tx: ITransaction) => T): T;
    private _forceUpdate;
    private readonly _model;
    readonly model: IObservable<ITextModel | null>;
    readonly isReadonly: IObservable<boolean>;
    private readonly _versionId;
    readonly versionId: IObservableWithChange<number | null, IModelContentChangedEvent | undefined>;
    private readonly _selections;
    readonly selections: IObservableWithChange<Selection[] | null, ICursorSelectionChangedEvent | undefined>;
    readonly positions: IObservable<readonly Position[] | null>;
    readonly isFocused: IObservable<boolean>;
    readonly isTextFocused: IObservable<boolean>;
    readonly inComposition: IObservable<boolean>;
    readonly value: import("../../base/common/observable.js").ISettableObservable<string, void>;
    readonly valueIsEmpty: IObservableWithChange<boolean, void>;
    readonly cursorSelection: IObservable<Selection | null>;
    readonly cursorPosition: IObservable<Position | null>;
    readonly cursorLineNumber: IObservableWithChange<number | null, void>;
    readonly onDidType: import("../../base/common/observable.js").IObservableSignal<string>;
    readonly onDidPaste: import("../../base/common/observable.js").IObservableSignal<IPasteEvent>;
    readonly scrollTop: IObservable<number>;
    readonly scrollLeft: IObservable<number>;
    readonly layoutInfo: IObservable<import("../common/config/editorOptions.js").EditorLayoutInfo>;
    readonly layoutInfoContentLeft: IObservable<number>;
    readonly layoutInfoDecorationsLeft: IObservable<number>;
    readonly layoutInfoWidth: IObservable<number>;
    readonly layoutInfoHeight: IObservable<number>;
    readonly layoutInfoMinimap: IObservable<import("../common/config/editorOptions.js").EditorMinimapLayoutInfo>;
    readonly layoutInfoVerticalScrollbarWidth: IObservable<number>;
    readonly contentWidth: IObservable<number>;
    readonly contentHeight: IObservable<number>;
    readonly domNode: IObservableWithChange<HTMLElement | null, void>;
    getOption<T extends EditorOption>(id: T, debugLocation?: DebugLocation): IObservable<FindComputedEditorOptionValueById<T>>;
    setDecorations(decorations: IObservable<IModelDeltaDecoration[]>): IDisposable;
    private _widgetCounter;
    createOverlayWidget(widget: IObservableOverlayWidget): IDisposable;
    createContentWidget(widget: IObservableContentWidget): IDisposable;
    observeLineOffsetRange(lineRange: IObservable<LineRange>, store: DisposableStore): IObservable<OffsetRange>;
    /**
     * Uses an approximation if the exact position cannot be determined.
     */
    getLeftOfPosition(position: Position, reader: IReader | undefined): number;
    observePosition(position: IObservable<Position | null>, store: DisposableStore): IObservable<Point | null>;
    readonly openedPeekWidgets: import("../../base/common/observable.js").ISettableObservable<number, void>;
    isTargetHovered(predicate: (target: IEditorMouseEvent) => boolean, store: DisposableStore): IObservable<boolean>;
    observeLineHeightForPosition(position: IObservable<Position> | Position): IObservable<number>;
    observeLineHeightForPosition(position: IObservable<null>): IObservable<null>;
    observeLineHeightForLine(lineNumber: IObservable<number> | number): IObservable<number>;
    observeLineHeightForLine(lineNumber: IObservable<null>): IObservable<null>;
    observeLineHeightsForLineRange(lineNumber: IObservable<LineRange> | LineRange): IObservable<number[]>;
    private readonly _onDidChangeViewZones;
    private readonly _onDidHiddenAreasChanged;
    private readonly _onDidLineHeightChanged;
    /**
     * Tracks whether getWidthOfLine returned 0, indicating the editor may be hidden.
     * When resize happens and this flag is set, we reset cached line widths.
     */
    private _sawZeroLineWidth;
    /**
     * Fires when the editor container resizes.
     * This is lazily created only when someone subscribes to it.
     * Useful for detecting when a parent element's display changes from 'none' to 'block'.
     */
    private readonly _onDidContainerResize;
    /**
     * Get the width of a line in pixels.
     * Reading the returned value depends on layoutInfo, value, scrollTop, and container resize events.
     * The container resize dependency ensures correct values when the editor becomes visible after being hidden.
     */
    getWidthOfLine(lineNumber: number, reader: IReader | undefined): number;
    /**
     * Get the vertical position (top offset) for the line's bottom w.r.t. to the first line.
     */
    observeTopForLineNumber(lineNumber: number): IObservable<number>;
    /**
     * Get the vertical position (top offset) for the line's bottom w.r.t. to the first line.
     */
    observeBottomForLineNumber(lineNumber: number): IObservable<number>;
}
interface IObservableOverlayWidget {
    get domNode(): HTMLElement;
    readonly position: IObservable<IOverlayWidgetPosition | null>;
    readonly minContentWidthInPx: IObservable<number>;
    get allowEditorOverflow(): boolean;
}
interface IObservableContentWidget {
    get domNode(): HTMLElement;
    readonly position: IObservable<IContentWidgetPosition | null>;
    get allowEditorOverflow(): boolean;
}
export {};
