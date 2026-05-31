import { URI } from "../../../../base/common/uri.js";
export declare const ILanguageDetectionService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILanguageDetectionService>;
export interface ILanguageDetectionService {
    readonly _serviceBrand: undefined;
    /**
    * @param languageId The languageId to check if language detection is currently enabled.
    * @returns whether or not language detection is on for this language.
    */
    isEnabledForLanguage(languageId: string): boolean;
    /**
    * @param resource The resource to detect the language for.
    * @param supportedLangs Optional. When populated, the model will only return languages from the provided list
    * @returns the language id for the given resource or undefined if the model is not confident enough.
    */
    detectLanguage(resource: URI, supportedLangs?: string[]): Promise<string | undefined>;
}
