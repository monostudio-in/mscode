import { Disposable } from "../../../../base/common/lifecycle.js";
import type { DecorationStyleCache } from "../css/decorationStyleCache.js";
import { type IGlyphRasterizer, type IRasterizedGlyph } from "./raster.js";
export declare class GlyphRasterizer extends Disposable implements IGlyphRasterizer {
    readonly fontSize: number;
    readonly fontFamily: string;
    readonly devicePixelRatio: number;
    private readonly _decorationStyleCache;
    readonly id: number;
    get cacheKey(): string;
    private _canvas;
    private _ctx;
    private readonly _textMetrics;
    private _workGlyph;
    private _workGlyphConfig;
    private _antiAliasing;
    constructor(fontSize: number, fontFamily: string, devicePixelRatio: number, _decorationStyleCache: DecorationStyleCache);
    /**
     * Rasterizes a glyph. Note that the returned object is reused across different glyphs and
     * therefore is only safe for synchronous access.
     */
    rasterizeGlyph(chars: string, tokenMetadata: number, decorationStyleSetId: number, colorMap: string[]): Readonly<IRasterizedGlyph>;
    _rasterizeGlyph(chars: string, tokenMetadata: number, decorationStyleSetId: number, colorMap: string[]): Readonly<IRasterizedGlyph>;
    private _clearColor;
    private _findGlyphBoundingBox;
    getTextMetrics(text: string): TextMetrics;
}
