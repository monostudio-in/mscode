export interface IDecorationStyleSet {
    /**
     * A 24-bit number representing `color`.
     */
    color: number | undefined;
    /**
     * Whether the text should be rendered in bold.
     */
    bold: boolean | undefined;
    /**
     * A number between 0 and 1 representing the opacity of the text.
     */
    opacity: number | undefined;
    /**
     * Whether the text should be rendered with a strikethrough.
     */
    strikethrough: boolean | undefined;
    /**
     * The thickness of the strikethrough line in pixels (CSS pixels, not device pixels).
     */
    strikethroughThickness: number | undefined;
    /**
     * A 32-bit number representing the strikethrough color.
     */
    strikethroughColor: number | undefined;
}
export interface IDecorationStyleCacheEntry extends IDecorationStyleSet {
    /**
     * A unique identifier for this set of styles.
     */
    id: number;
}
export declare class DecorationStyleCache {
    private _nextId;
    private readonly _cacheById;
    private readonly _cacheByStyle;
    getOrCreateEntry(color: number | undefined, bold: boolean | undefined, opacity: number | undefined, strikethrough: boolean | undefined, strikethroughThickness: number | undefined, strikethroughColor: number | undefined): number;
    getStyleSet(id: number): IDecorationStyleSet | undefined;
}
