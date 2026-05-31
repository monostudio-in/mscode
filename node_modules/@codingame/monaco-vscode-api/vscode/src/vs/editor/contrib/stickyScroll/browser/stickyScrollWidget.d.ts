import { Disposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from "../../../browser/editorBrowser.js";
import { EditorLayoutInfo } from "../../../common/config/editorOptions.js";
import { Position } from "../../../common/core/position.js";
import { CharacterMapping } from "../../../common/viewLayout/viewLineRenderer.js";
import { FoldingModel } from "../../folding/browser/foldingModel.js";
import { IViewModel } from "../../../common/viewModel.js";
export declare class StickyScrollWidgetState {
    readonly startLineNumbers: number[];
    readonly endLineNumbers: number[];
    readonly lastLineRelativePosition: number;
    readonly showEndForLine: number | null;
    constructor(startLineNumbers: number[], endLineNumbers: number[], lastLineRelativePosition: number, showEndForLine?: number | null);
    equals(other: StickyScrollWidgetState | undefined): boolean;
    static get Empty(): StickyScrollWidgetState;
}
export declare class StickyScrollWidget extends Disposable implements IOverlayWidget {
    private readonly _foldingIconStore;
    private readonly _rootDomNode;
    private readonly _lineNumbersDomNode;
    private readonly _linesDomNodeScrollable;
    private readonly _linesDomNode;
    private readonly _editor;
    private _state;
    private _renderedStickyLines;
    private _lineNumbers;
    private _lastLineRelativePosition;
    private _minContentWidthInPx;
    private _isOnGlyphMargin;
    private _height;
    get height(): number;
    private readonly _onDidChangeStickyScrollHeight;
    readonly onDidChangeStickyScrollHeight: import("../../../../base/common/event.js").Event<{
        height: number;
    }>;
    constructor(editor: ICodeEditor);
    get lineNumbers(): number[];
    get lineNumberCount(): number;
    getRenderedStickyLine(lineNumber: number): RenderedStickyLine | undefined;
    getCurrentLines(): readonly number[];
    setState(state: StickyScrollWidgetState | undefined, foldingModel: FoldingModel | undefined, rebuildFromIndexCandidate?: number): void;
    private _findRenderingData;
    private _findIndexToRebuildFrom;
    private _updateWidgetWidth;
    private _useFoldingOpacityTransition;
    private _setFoldingIconsVisibility;
    private _renderRootNode;
    private _clearWidget;
    private _setHeight;
    private _setFoldingHoverListeners;
    private _renderChildNode;
    private _updatePosition;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition | null;
    getMinContentWidthInPx(): number;
    focusLineWithIndex(index: number): void;
    /**
     * Given a leaf dom node, tries to find the editor position.
     */
    getEditorPositionFromNode(spanDomNode: HTMLElement | null): Position | null;
    getLineNumberFromChildDomNode(domNode: HTMLElement | null): number | null;
    private _getRenderedStickyLineFromChildDomNode;
    /**
     * Given a child dom node, tries to find the line number attribute that was stored in the node.
     * @returns the attribute value or null if none is found.
     */
    getLineIndexFromChildDomNode(domNode: HTMLElement | null): number | null;
    /**
     * Given a child dom node, tries to find if it is (contained in) a sticky line.
     * @returns a boolean.
     */
    isInStickyLine(domNode: HTMLElement | null): boolean;
    /**
     * Given a child dom node, tries to find if this dom node is (contained in) a sticky folding icon.
     * @returns a boolean.
     */
    isInFoldingIconDomNode(domNode: HTMLElement | null): boolean;
    /**
     * Given the dom node, finds if it or its parent sequence contains the given attribute.
     * @returns the attribute value or undefined.
     */
    private _getAttributeValue;
}
declare class RenderedStickyLine {
    readonly index: number;
    readonly lineNumber: number;
    readonly lineDomNode: HTMLElement;
    readonly lineNumberDomNode: HTMLElement;
    readonly foldingIcon: StickyFoldingIcon | undefined;
    readonly characterMapping: CharacterMapping;
    readonly scrollWidth: number;
    readonly height: number;
    constructor(editor: ICodeEditor, viewModel: IViewModel, layoutInfo: EditorLayoutInfo, foldingModel: FoldingModel | undefined, isOnGlyphMargin: boolean, index: number, lineNumber: number);
    private _renderFoldingIconForLine;
}
declare class StickyFoldingIcon {
    isCollapsed: boolean;
    foldingStartLine: number;
    foldingEndLine: number;
    dimension: number;
    domNode: HTMLElement;
    constructor(isCollapsed: boolean, foldingStartLine: number, foldingEndLine: number, dimension: number);
    setVisible(visible: boolean): void;
}
export {};
