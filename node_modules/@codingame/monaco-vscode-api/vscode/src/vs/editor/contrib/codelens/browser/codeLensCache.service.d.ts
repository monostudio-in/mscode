import { ITextModel } from "../../../common/model.js";
import { CodeLensModel } from "./codelens.js";
export declare const ICodeLensCache: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ICodeLensCache>;
export interface ICodeLensCache {
    readonly _serviceBrand: undefined;
    put(model: ITextModel, data: CodeLensModel): void;
    get(model: ITextModel): CodeLensModel | undefined;
    delete(model: ITextModel): void;
}
