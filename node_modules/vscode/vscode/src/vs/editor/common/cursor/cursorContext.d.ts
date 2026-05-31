import { ITextModel } from "../model.js";
import { CursorConfiguration, ICursorSimpleModel } from "../cursorCommon.js";
import { ICoordinatesConverter } from "../coordinatesConverter.js";
export declare class CursorContext {
    _cursorContextBrand: void;
    readonly model: ITextModel;
    readonly viewModel: ICursorSimpleModel;
    readonly coordinatesConverter: ICoordinatesConverter;
    readonly cursorConfig: CursorConfiguration;
    constructor(model: ITextModel, viewModel: ICursorSimpleModel, coordinatesConverter: ICoordinatesConverter, cursorConfig: CursorConfiguration);
}
