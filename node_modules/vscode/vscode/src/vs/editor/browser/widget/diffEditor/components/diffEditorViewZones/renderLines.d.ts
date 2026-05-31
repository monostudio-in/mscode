import { ICodeEditor } from "../../../../editorBrowser.js";
import { EditorOption, FindComputedEditorOptionValueById } from "../../../../../common/config/editorOptions.js";
import { FontInfo } from "../../../../../common/config/fontInfo.js";
import { Position } from "../../../../../common/core/position.js";
import { ModelLineProjectionData } from "../../../../../common/modelLineProjectionData.js";
import { LineTokens } from "../../../../../common/tokens/lineTokens.js";
import { CharacterMapping, ForeignElementType, RenderLineOutput } from "../../../../../common/viewLayout/viewLineRenderer.js";
import { InlineDecoration } from "../../../../../common/viewModel/inlineDecorations.js";
export declare function renderLines(source: LineSource, options: RenderOptions, decorations: InlineDecoration[], domNode: HTMLElement, noExtra?: boolean): RenderLinesResult;
export declare class LineSource {
    readonly lineTokens: LineTokens[];
    readonly lineBreakData: (ModelLineProjectionData | null)[];
    readonly mightContainNonBasicASCII: boolean;
    readonly mightContainRTL: boolean;
    constructor(lineTokens: LineTokens[], lineBreakData?: (ModelLineProjectionData | null)[], mightContainNonBasicASCII?: boolean, mightContainRTL?: boolean);
}
export declare class RenderOptions {
    readonly tabSize: number;
    readonly fontInfo: FontInfo;
    readonly disableMonospaceOptimizations: boolean;
    readonly typicalHalfwidthCharacterWidth: number;
    readonly scrollBeyondLastColumn: number;
    readonly lineHeight: number;
    readonly lineDecorationsWidth: number;
    readonly stopRenderingLineAfter: number;
    readonly renderWhitespace: FindComputedEditorOptionValueById<EditorOption.renderWhitespace>;
    readonly renderControlCharacters: boolean;
    readonly fontLigatures: FindComputedEditorOptionValueById<EditorOption.fontLigatures>;
    readonly verticalScrollbarSize: number;
    readonly setWidth: boolean;
    static fromEditor(editor: ICodeEditor): RenderOptions;
    constructor(tabSize: number, fontInfo: FontInfo, disableMonospaceOptimizations: boolean, typicalHalfwidthCharacterWidth: number, scrollBeyondLastColumn: number, lineHeight: number, lineDecorationsWidth: number, stopRenderingLineAfter: number, renderWhitespace: FindComputedEditorOptionValueById<EditorOption.renderWhitespace>, renderControlCharacters: boolean, fontLigatures: FindComputedEditorOptionValueById<EditorOption.fontLigatures>, verticalScrollbarSize: number, setWidth?: boolean);
    withSetWidth(setWidth: boolean): RenderOptions;
    withScrollBeyondLastColumn(scrollBeyondLastColumn: number): RenderOptions;
}
export declare class RenderLinesResult {
    readonly heightInLines: number;
    readonly minWidthInPx: number;
    readonly viewLineCounts: number[];
    private readonly _renderOutputs;
    private readonly _source;
    constructor(heightInLines: number, minWidthInPx: number, viewLineCounts: number[], _renderOutputs: RenderLineOutputWithOffset[], _source: LineSource);
    /**
     * Returns the model position for a given DOM node and offset within that node.
     * @param domNode The span node within a view-line where the offset is located
     * @param offset The offset within the span node
     * @returns The Position in the model, or undefined if the position cannot be determined
     */
    getModelPositionAt(domNode: HTMLElement, offset: number): Position | undefined;
}
declare class RenderLineOutputWithOffset extends RenderLineOutput {
    readonly offset: number;
    constructor(characterMapping: CharacterMapping, containsForeignElements: ForeignElementType, offset: number);
}
export {};
