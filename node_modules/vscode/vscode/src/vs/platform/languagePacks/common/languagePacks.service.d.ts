import { URI } from "../../../base/common/uri.js";
import { ILanguagePackItem } from "./languagePacks.js";
export declare const ILanguagePackService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ILanguagePackService>;
export interface ILanguagePackService {
    readonly _serviceBrand: undefined;
    getAvailableLanguages(): Promise<Array<ILanguagePackItem>>;
    getInstalledLanguages(): Promise<Array<ILanguagePackItem>>;
    getBuiltInExtensionTranslationsUri(id: string, language: string): Promise<URI | undefined>;
}
