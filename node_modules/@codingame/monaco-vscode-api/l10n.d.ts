import type { IExtensionManifest } from "./extensions.js";
declare function setAvailableLocales(locales: Set<string>): void;
declare function isLocaleAvailable(locale: string): boolean;
declare global {
    /**
     * All NLS messages produced by `localize` and `localize2` calls
     * under `src/vs` translated to the language as indicated by
     * `_VSCODE_NLS_LANGUAGE`.
     */
    var _VSCODE_NLS_MESSAGES: string[];
    /**
     * The actual language of the NLS messages (e.g. 'en', de' or 'pt-br').
     */
    var _VSCODE_NLS_LANGUAGE: string | undefined;
}
declare function registerLocalization(manifest: IExtensionManifest, language: string, main: string[], extensionTranslationsUris: Record<string, string>): void;
declare function getBuiltInExtensionTranslationsUris(language: string): Record<string, string> | undefined;
declare function getExtensionIdProvidingCurrentLocale(): string | undefined;
declare function getLocalizationManifest(): IExtensionManifest | undefined;
export { registerLocalization, getBuiltInExtensionTranslationsUris, getExtensionIdProvidingCurrentLocale, getLocalizationManifest, setAvailableLocales, isLocaleAvailable };
