
import { isInitialized } from './vscode/src/vs/nls.js';

const extensionTranslationsUri = {};
let currentLocaleExtensionId;
let availableLocales = new Set();
function setAvailableLocales(locales) {
    availableLocales = locales;
}
function isLocaleAvailable(locale) {
    return availableLocales.has(locale);
}
let localizationManifest;
function registerLocalization(manifest, language, main, extensionTranslationsUris) {
    if (isInitialized()) {
        console.error('Some parts of VSCode are already initialized, make sure the language pack is loaded before anything else or some translations will be missing');
    }
    globalThis._VSCODE_NLS_MESSAGES = main;
    globalThis._VSCODE_NLS_LANGUAGE = language;
    extensionTranslationsUri[language] = extensionTranslationsUris;
    currentLocaleExtensionId = `${manifest.publisher}.${manifest.name}`;
    localizationManifest = manifest;
}
function getBuiltInExtensionTranslationsUris(language) {
    return extensionTranslationsUri[language];
}
function getExtensionIdProvidingCurrentLocale() {
    return currentLocaleExtensionId;
}
function getLocalizationManifest() {
    return localizationManifest;
}

export { getBuiltInExtensionTranslationsUris, getExtensionIdProvidingCurrentLocale, getLocalizationManifest, isLocaleAvailable, registerLocalization, setAvailableLocales };
