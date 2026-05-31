import { IValidatedEditorOptions, BareFontInfo } from "./fontInfo.js";
export declare function createBareFontInfoFromValidatedSettings(options: IValidatedEditorOptions, pixelRatio: number, ignoreEditorZoom: boolean): BareFontInfo;
export declare function createBareFontInfoFromRawSettings(opts: {
    fontFamily?: unknown;
    fontWeight?: unknown;
    fontSize?: unknown;
    fontLigatures?: unknown;
    fontVariations?: unknown;
    lineHeight?: unknown;
    letterSpacing?: unknown;
}, pixelRatio: number, ignoreEditorZoom?: boolean): BareFontInfo;
