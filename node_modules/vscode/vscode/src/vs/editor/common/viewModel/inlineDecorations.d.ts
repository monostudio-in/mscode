import { IModelDecoration, InjectedTextOptions, ITextModel } from "../model.js";
import { Range } from "../core/range.js";
import { ICoordinatesConverter } from "../coordinatesConverter.js";
import { ViewModelDecoration } from "./viewModelDecoration.js";
export declare enum InlineDecorationType {
    Regular = 0,
    Before = 1,
    After = 2,
    RegularAffectingLetterSpacing = 3
}
export declare class InlineDecoration {
    readonly range: Range;
    readonly inlineClassName: string;
    readonly type: InlineDecorationType;
    constructor(range: Range, inlineClassName: string, type: InlineDecorationType);
}
/**
 * A collection of decorations in a range of lines.
 */
export interface IViewDecorationsCollection {
    /**
     * decorations in the range of lines (ungrouped).
     */
    readonly decorations: ViewModelDecoration[];
    /**
     * inline decorations (grouped by each line in the range of lines).
     */
    readonly inlineDecorations: InlineDecoration[][];
    /**
     * Whether the decorations affect the fonts.
     */
    readonly hasVariableFonts: boolean[];
}
export interface IInlineDecorationsComputer {
    /**
     * Get the inline decorations for a specific model line number, split by view line number
     */
    getInlineDecorations(modelLineNumber: number): InlineDecoration[][];
}
export interface IInlineModelDecorationsComputerContext {
    /**
     * Get model decorations for a view range
     */
    getModelDecorations(viewRange: Range, onlyMinimapDecorations: boolean, onlyMarginDecorations: boolean): IModelDecoration[];
}
export declare class InlineModelDecorationsComputer implements IInlineDecorationsComputer {
    private readonly context;
    private readonly model;
    private readonly coordinatesConverter;
    private _decorationsCache;
    constructor(context: IInlineModelDecorationsComputerContext, model: ITextModel, coordinatesConverter: ICoordinatesConverter);
    getInlineDecorations(modelLineNumber: number): InlineDecoration[][];
    getDecorations(viewRange: Range, onlyMinimapDecorations: boolean, onlyMarginDecorations: boolean): IViewDecorationsCollection;
    reset(): void;
    onModelDecorationsChanged(): void;
    onLineMappingChanged(): void;
    private _getOrCreateViewModelDecoration;
}
export interface IInjectedTextInlineDecorationsComputerContext {
    /**
     * Get the injections options for a model line number
     */
    getInjectionOptions(modelLineNumber: number): InjectedTextOptions[] | null;
    /**
     * Get the injection offsets for a model line number
     */
    getInjectionOffsets(modelLineNumber: number): number[] | null;
    /**
     * Get the break offets for a model line number
     */
    getBreakOffsets(modelLineNumber: number): number[];
    /**
     * Get the wrapped text indent length for a model line number
     */
    getWrappedTextIndentLength(modelLineNumber: number): number;
    /**
     * Get the view line number for the first output line of a model line
     */
    getBaseViewLineNumber(modelLineNumber: number): number;
}
export declare class InjectedTextInlineDecorationsComputer implements IInlineDecorationsComputer {
    private readonly context;
    constructor(context: IInjectedTextInlineDecorationsComputerContext);
    getInlineDecorations(modelLineNumber: number): InlineDecoration[][];
}
