import { CancellationToken } from "../../../../base/common/cancellation.js";
import { ITextModel } from "../../../common/model.js";
import { OutlineModel } from "./outlineModel.js";
export declare const IOutlineModelService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IOutlineModelService>;
export interface IOutlineModelService {
    _serviceBrand: undefined;
    getOrCreate(model: ITextModel, token: CancellationToken): Promise<OutlineModel>;
    getDebounceValue(textModel: ITextModel): number;
    getCachedModels(): Iterable<OutlineModel>;
}
