import { IReader } from "../../../../../../../../base/common/observable.js";
import { ObservableCodeEditor } from "../../../../../../../browser/observableCodeEditor.js";
import { Size2D } from "../../../../../../../common/core/2d/size.js";
import { LineRange } from "../../../../../../../common/core/ranges/lineRange.js";
import { OffsetRange } from "../../../../../../../common/core/ranges/offsetRange.js";
/**
 * Layout constants used for the long-distance hint widget.
 */
export interface WidgetLayoutConstants {
    readonly previewEditorMargin: number;
    readonly widgetPadding: number;
    readonly widgetBorder: number;
    readonly lowerBarHeight: number;
    readonly minWidgetWidth: number;
}
/**
 * Represents a widget placement outline with horizontal and vertical ranges.
 */
export interface WidgetOutline {
    readonly horizontalWidgetRange: OffsetRange;
    readonly verticalWidgetRange: OffsetRange;
}
/**
 * Represents a continuous range of lines with their sizes and positioning.
 * Used to compute available space for widget placement.
 */
export interface ContinuousLineSizes {
    readonly lineRange: LineRange;
    readonly top: number;
    readonly sizes: Size2D[];
}
/**
 * Context for computing widget placement within a continuous line range.
 */
export declare class WidgetPlacementContext {
    private readonly _lineRangeInfo;
    readonly availableSpaceSizes: Size2D[];
    readonly availableSpaceHeightPrefixSums: number[];
    readonly availableSpaceSizesTransposed: Size2D[];
    constructor(_lineRangeInfo: ContinuousLineSizes, editorTrueContentWidth: number, endOfLinePadding: (lineNumber: number) => number);
    /**
     * Computes the vertical outline for a widget placed at the given line number.
     */
    getWidgetVerticalOutline(lineNumber: number, previewEditorHeight: number, layoutConstants: WidgetLayoutConstants): OffsetRange;
    /**
     * Tries to find a valid widget outline within this line range context.
     */
    tryFindWidgetOutline(targetLineNumber: number, previewEditorHeight: number, editorTrueContentRight: number, layoutConstants: WidgetLayoutConstants): WidgetOutline | undefined;
}
/**
 * Splits line size information into continuous ranges, breaking at positions where
 * the expected vertical position differs from the actual position (e.g., due to folded regions).
 */
export declare function splitIntoContinuousLineRanges(lineRange: LineRange, sizes: Size2D[], top: number, editorObs: ObservableCodeEditor, reader: IReader): ContinuousLineSizes[];
