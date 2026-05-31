import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../base/common/uri.js";
import { ITextModel } from "../../../../../editor/common/model.js";
import { IModelService } from "../../../../../editor/common/services/model.service.js";
import { Range } from "../../../../../editor/common/core/range.js";
/**
 * Can add a range highlight decoration to a model.
 * It will automatically remove it when the model has its decorations changed.
 */
export declare class RangeHighlightDecorations implements IDisposable {
    private readonly _modelService;
    private _decorationId;
    private _model;
    private readonly _modelDisposables;
    constructor(_modelService: IModelService);
    removeHighlightRange(): void;
    highlightRange(resource: URI | ITextModel, range: Range, ownerId?: number): void;
    private doHighlightRange;
    private setModel;
    private clearModelListeners;
    dispose(): void;
    private static readonly _RANGE_HIGHLIGHT_DECORATION;
}
