import { LanguageFeatureRegistry } from "../languageFeatureRegistry.js";
import { IFeatureDebounceInformation } from "./languageFeatureDebounce.js";
export declare const ILanguageFeatureDebounceService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILanguageFeatureDebounceService>;
export interface ILanguageFeatureDebounceService {
    readonly _serviceBrand: undefined;
    for(feature: LanguageFeatureRegistry<object>, debugName: string, config?: {
        min?: number;
        max?: number;
        salt?: string;
    }): IFeatureDebounceInformation;
}
