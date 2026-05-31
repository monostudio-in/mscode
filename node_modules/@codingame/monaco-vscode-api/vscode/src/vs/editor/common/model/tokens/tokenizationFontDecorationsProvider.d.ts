import { Disposable } from "../../../../base/common/lifecycle.js";
import { IModelDecoration, ITextModel } from "../../model.js";
import { TokenizationTextModelPart } from "./tokenizationTextModelPart.js";
import { Range } from "../../core/range.js";
import { DecorationProvider, LineFontChangingDecoration, LineHeightChangingDecoration } from "../decorationProvider.js";
import { IFontTokenOption, IModelContentChangedEvent } from "../../textModelEvents.js";
export interface IFontTokenAnnotation {
    decorationId: string;
    fontToken: IFontTokenOption;
}
export declare class TokenizationFontDecorationProvider extends Disposable implements DecorationProvider {
    private readonly textModel;
    private readonly tokenizationTextModelPart;
    private static DECORATION_COUNT;
    private readonly _onDidChangeLineHeight;
    readonly onDidChangeLineHeight: import("../../../../base/common/event.js").Event<Set<LineHeightChangingDecoration>>;
    private readonly _onDidChangeFont;
    readonly onDidChangeFont: import("../../../../base/common/event.js").Event<Set<LineFontChangingDecoration>>;
    private _fontAnnotatedString;
    constructor(textModel: ITextModel, tokenizationTextModelPart: TokenizationTextModelPart);
    handleDidChangeContent(change: IModelContentChangedEvent): void;
    getDecorationsInRange(range: Range, ownerId?: number, filterOutValidation?: boolean, filterFontDecorations?: boolean, onlyMinimapDecorations?: boolean): IModelDecoration[];
    getAllDecorations(ownerId?: number, filterOutValidation?: boolean): IModelDecoration[];
}
