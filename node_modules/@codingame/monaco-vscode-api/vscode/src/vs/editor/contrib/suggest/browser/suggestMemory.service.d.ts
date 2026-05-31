import { IPosition } from "../../../common/core/position.js";
import { ITextModel } from "../../../common/model.js";
import { CompletionItem } from "./suggest.js";
export declare const ISuggestMemoryService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISuggestMemoryService>;
export interface ISuggestMemoryService {
    readonly _serviceBrand: undefined;
    memorize(model: ITextModel, pos: IPosition, item: CompletionItem): void;
    select(model: ITextModel, pos: IPosition, items: CompletionItem[]): number;
}
