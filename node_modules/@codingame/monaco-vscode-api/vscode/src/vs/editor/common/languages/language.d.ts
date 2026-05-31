import { Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
export interface ILanguageExtensionPoint {
    id: string;
    extensions?: string[];
    filenames?: string[];
    filenamePatterns?: string[];
    firstLine?: string;
    aliases?: string[];
    mimetypes?: string[];
    configuration?: URI;
    /**
     * @internal
     */
    icon?: ILanguageIcon;
}
export interface ILanguageSelection {
    readonly languageId: string;
    readonly onDidChange: Event<string>;
}
export interface ILanguageNameIdPair {
    readonly languageName: string;
    readonly languageId: string;
}
export interface ILanguageIcon {
    readonly light: URI;
    readonly dark: URI;
}
