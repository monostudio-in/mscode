import { EditorOption, FindComputedEditorOptionValueById } from "./editorOptions.js";
/**
 * Determined from empirical observations.
 * @internal
 */
export declare const GOLDEN_LINE_HEIGHT_RATIO: number;
/**
 * @internal
 */
export declare const MINIMUM_LINE_HEIGHT = 8;
/**
 * @internal
 */
export interface IValidatedEditorOptions {
    get<T extends EditorOption>(id: T): FindComputedEditorOptionValueById<T>;
}
export declare class BareFontInfo {
    readonly _bareFontInfoBrand: void;
    /**
     * @internal
     */
    static _create(fontFamily: string, fontWeight: string, fontSize: number, fontFeatureSettings: string, fontVariationSettings: string, lineHeight: number, letterSpacing: number, pixelRatio: number, ignoreEditorZoom: boolean): BareFontInfo;
    readonly pixelRatio: number;
    readonly fontFamily: string;
    readonly fontWeight: string;
    readonly fontSize: number;
    readonly fontFeatureSettings: string;
    readonly fontVariationSettings: string;
    readonly lineHeight: number;
    readonly letterSpacing: number;
    /**
     * @internal
     */
    protected constructor(opts: {
        pixelRatio: number;
        fontFamily: string;
        fontWeight: string;
        fontSize: number;
        fontFeatureSettings: string;
        fontVariationSettings: string;
        lineHeight: number;
        letterSpacing: number;
    });
    /**
     * @internal
     */
    getId(): string;
    /**
     * @internal
     */
    getMassagedFontFamily(): string;
    private static _wrapInQuotes;
}
export declare const SERIALIZED_FONT_INFO_VERSION = 2;
export declare class FontInfo extends BareFontInfo {
    readonly _editorStylingBrand: void;
    readonly version: number;
    readonly isTrusted: boolean;
    readonly isMonospace: boolean;
    readonly typicalHalfwidthCharacterWidth: number;
    readonly typicalFullwidthCharacterWidth: number;
    readonly canUseHalfwidthRightwardsArrow: boolean;
    readonly spaceWidth: number;
    readonly middotWidth: number;
    readonly wsmiddotWidth: number;
    readonly maxDigitWidth: number;
    /**
     * @internal
     */
    constructor(opts: {
        pixelRatio: number;
        fontFamily: string;
        fontWeight: string;
        fontSize: number;
        fontFeatureSettings: string;
        fontVariationSettings: string;
        lineHeight: number;
        letterSpacing: number;
        isMonospace: boolean;
        typicalHalfwidthCharacterWidth: number;
        typicalFullwidthCharacterWidth: number;
        canUseHalfwidthRightwardsArrow: boolean;
        spaceWidth: number;
        middotWidth: number;
        wsmiddotWidth: number;
        maxDigitWidth: number;
    }, isTrusted: boolean);
    /**
     * @internal
     */
    equals(other: FontInfo): boolean;
}
/**
 * @internal
 */
export declare const FONT_VARIATION_OFF = "normal";
/**
 * @internal
 */
export declare const FONT_VARIATION_TRANSLATE = "translate";
/**
 * @internal
 */
export declare const DEFAULT_WINDOWS_FONT_FAMILY = "Consolas, 'Courier New', monospace";
/**
 * @internal
 */
export declare const DEFAULT_MAC_FONT_FAMILY = "Menlo, Monaco, 'Courier New', monospace";
/**
 * @internal
 */
export declare const DEFAULT_LINUX_FONT_FAMILY = "'Droid Sans Mono', monospace";
/**
 * @internal
 */
export declare const EDITOR_FONT_DEFAULTS: {
    fontFamily: string;
    fontWeight: string;
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
};
