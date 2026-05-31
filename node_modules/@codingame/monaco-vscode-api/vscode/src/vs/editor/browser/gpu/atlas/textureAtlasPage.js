
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { NKeyMap } from '../../../../base/common/map.js';
import { LogLevel } from '../../../../platform/log/common/log.js';
import { ILogService } from '../../../../platform/log/common/log.service.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.service.js';
import { TextureAtlasShelfAllocator } from './textureAtlasShelfAllocator.js';
import { TextureAtlasSlabAllocator } from './textureAtlasSlabAllocator.js';

var TextureAtlasPage_1;
let TextureAtlasPage = class TextureAtlasPage extends Disposable {
    static {
        TextureAtlasPage_1 = this;
    }
    get version() {
        return this._version;
    }
    static {
        this.maximumGlyphCount = 5_000;
    }
    get usedArea() {
        return this._usedArea;
    }
    get source() {
        return this._canvas;
    }
    get glyphs() {
        return ( this._glyphInOrderSet.values());
    }
    constructor(textureIndex, pageSize, allocatorType, _logService, themeService) {
        super();
        this._logService = _logService;
        this._version = 0;
        this._usedArea = {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
        };
        this._glyphMap = ( new NKeyMap());
        this._glyphInOrderSet = ( new Set());
        this._canvas = ( new OffscreenCanvas(pageSize, pageSize));
        this._colorMap = themeService.getColorTheme().tokenColorMap;
        switch (allocatorType) {
        case "shelf":
            this._allocator = ( new TextureAtlasShelfAllocator(this._canvas, textureIndex));
            break;
        case "slab":
            this._allocator = ( new TextureAtlasSlabAllocator(this._canvas, textureIndex));
            break;
        default:
            this._allocator = allocatorType(this._canvas, textureIndex);
            break;
        }
        this._register(toDisposable(() => {
            this._canvas.width = 1;
            this._canvas.height = 1;
        }));
    }
    getGlyph(rasterizer, chars, tokenMetadata, decorationStyleSetId) {
        return this._glyphMap.get(chars, tokenMetadata, decorationStyleSetId, rasterizer.cacheKey) ?? this._createGlyph(rasterizer, chars, tokenMetadata, decorationStyleSetId);
    }
    _createGlyph(rasterizer, chars, tokenMetadata, decorationStyleSetId) {
        if (this._glyphInOrderSet.size >= TextureAtlasPage_1.maximumGlyphCount) {
            return undefined;
        }
        const rasterizedGlyph = rasterizer.rasterizeGlyph(chars, tokenMetadata, decorationStyleSetId, this._colorMap);
        const glyph = this._allocator.allocate(rasterizedGlyph);
        if (glyph === undefined) {
            return undefined;
        }
        this._glyphMap.set(glyph, chars, tokenMetadata, decorationStyleSetId, rasterizer.cacheKey);
        this._glyphInOrderSet.add(glyph);
        this._version++;
        this._usedArea.right = Math.max(this._usedArea.right, glyph.x + glyph.w - 1);
        this._usedArea.bottom = Math.max(this._usedArea.bottom, glyph.y + glyph.h - 1);
        if (this._logService.getLevel() === LogLevel.Trace) {
            this._logService.trace("New glyph", {
                chars,
                tokenMetadata,
                decorationStyleSetId,
                rasterizedGlyph,
                glyph
            });
        }
        return glyph;
    }
    getUsagePreview() {
        return this._allocator.getUsagePreview();
    }
    getStats() {
        return this._allocator.getStats();
    }
};
TextureAtlasPage = TextureAtlasPage_1 = ( __decorate([( __param(3, ILogService)), ( __param(4, IThemeService))], TextureAtlasPage));

export { TextureAtlasPage };
