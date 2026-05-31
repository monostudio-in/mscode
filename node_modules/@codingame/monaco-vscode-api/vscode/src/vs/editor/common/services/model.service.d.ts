import { Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
import { ILanguageSelection } from "../languages/language.js";
import { ITextBufferFactory, ITextModel, ITextModelCreationOptions } from "../model.js";
import { TextModelEditSource } from "../textModelEditSource.js";
export declare const IModelService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IModelService>;
export interface IModelService {
    readonly _serviceBrand: undefined;
    createModel(value: string | ITextBufferFactory, languageSelection: ILanguageSelection | null, resource?: URI, isForSimpleWidget?: boolean): ITextModel;
    updateModel(model: ITextModel, value: string | ITextBufferFactory, reason?: TextModelEditSource): void;
    destroyModel(resource: URI): void;
    getModels(): ITextModel[];
    getCreationOptions(language: string, resource: URI, isForSimpleWidget: boolean): ITextModelCreationOptions;
    getModel(resource: URI): ITextModel | null;
    readonly onModelAdded: Event<ITextModel>;
    readonly onModelRemoved: Event<ITextModel>;
    readonly onModelLanguageChanged: Event<{
        readonly model: ITextModel;
        readonly oldLanguageId: string;
    }>;
}
