import { IDisposable } from "../../../base/common/lifecycle.js";
import { Range } from "../core/range.js";
import { IEditorConfiguration } from "../config/editorConfiguration.js";
import { ITextModel } from "../model.js";
import { IViewModelLines } from "./viewModelLines.js";
import { ViewModelDecoration } from "./viewModelDecoration.js";
import { IViewDecorationsCollection } from "./inlineDecorations.js";
import { ICoordinatesConverter } from "../coordinatesConverter.js";
export declare class ViewModelDecorations implements IDisposable {
    private readonly editorId;
    private readonly configuration;
    private readonly _linesCollection;
    private readonly _inlineDecorationsComputer;
    private _cachedModelDecorationsResolver;
    private _cachedModelDecorationsResolverViewRange;
    constructor(editorId: number, model: ITextModel, configuration: IEditorConfiguration, linesCollection: IViewModelLines, coordinatesConverter: ICoordinatesConverter);
    private _clearCachedModelDecorationsResolver;
    dispose(): void;
    reset(): void;
    onModelDecorationsChanged(): void;
    onLineMappingChanged(): void;
    getMinimapDecorationsInRange(range: Range): ViewModelDecoration[];
    getDecorationsViewportData(viewRange: Range): IViewDecorationsCollection;
    getDecorationsOnLine(lineNumber: number, onlyMinimapDecorations?: boolean, onlyMarginDecorations?: boolean): IViewDecorationsCollection;
}
