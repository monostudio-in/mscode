import { IModelDecoration, IModelDecorationOptions, ITextModel } from "../model.js";
import { Range } from "../core/range.js";
export declare class ViewModelDecoration {
    _viewModelDecorationBrand: void;
    readonly range: Range;
    readonly options: IModelDecorationOptions;
    constructor(range: Range, options: IModelDecorationOptions);
}
export declare function isModelDecorationVisible(model: ITextModel, decoration: IModelDecoration): boolean;
export declare function isModelDecorationInComment(model: ITextModel, decoration: IModelDecoration): boolean;
export declare function isModelDecorationInString(model: ITextModel, decoration: IModelDecoration): boolean;
