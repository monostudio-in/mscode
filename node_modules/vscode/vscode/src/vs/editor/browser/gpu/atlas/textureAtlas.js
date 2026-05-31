
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { getActiveWindow } from '../../../../base/browser/dom.js';
import { CharCode } from '../../../../base/common/charCode.js';
import { BugIndicatingError } from '../../../../base/common/errors.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable, MutableDisposable, toDisposable, dispose } from '../../../../base/common/lifecycle.js';
import { NKeyMap } from '../../../../base/common/map.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.service.js';
import { MetadataConsts } from '../../../common/encodedTokenAttributes.js';
import { GlyphRasterizer } from '../raster/glyphRasterizer.js';
import { IdleTaskQueue } from '../taskQueue.js';
import { TextureAtlasPage } from './textureAtlasPage.js';

var TextureAtlas_1;
let TextureAtlas = class TextureAtlas extends Disposable {
    static {
        TextureAtlas_1 = this;
    }
    static {
        this.maximumPageCount = 16;
    }
    get pages() {
        return this._pages;
    }
    constructor(
        _maxTextureSize,
        options,
        _decorationStyleCache,
        _themeService,
        _instantiationService
    ) {
        super();
        this._maxTextureSize = _maxTextureSize;
        this._decorationStyleCache = _decorationStyleCache;
        this._themeService = _themeService;
        this._instantiationService = _instantiationService;
        this._warmUpTask = this._register(( new MutableDisposable()));
        this._warmedUpRasterizers = ( new Set());
        this._pages = [];
        this._glyphPageIndex = ( new NKeyMap());
        this._onDidDeleteGlyphs = this._register(( new Emitter()));
        this.onDidDeleteGlyphs = this._onDidDeleteGlyphs.event;
        this._allocatorType = options?.allocatorType ?? "slab";
        this._register(Event.runAndSubscribe(this._themeService.onDidColorThemeChange, () => {
            if (this._colorMap) {
                this.clear();
            }
            this._colorMap = this._themeService.getColorTheme().tokenColorMap;
        }));
        const dprFactor = Math.max(1, Math.floor(getActiveWindow().devicePixelRatio));
        this.pageSize = Math.min(1024 * dprFactor, this._maxTextureSize);
        this._initFirstPage();
        this._register(toDisposable(() => dispose(this._pages)));
    }
    _initFirstPage() {
        const firstPage = this._instantiationService.createInstance(TextureAtlasPage, 0, this.pageSize, this._allocatorType);
        this._pages.push(firstPage);
        const nullRasterizer = ( new GlyphRasterizer(1, "", 1, this._decorationStyleCache));
        firstPage.getGlyph(nullRasterizer, "", 0, 0);
        nullRasterizer.dispose();
    }
    clear() {
        for (const page of this._pages) {
            page.dispose();
        }
        this._pages.length = 0;
        this._glyphPageIndex.clear();
        this._warmedUpRasterizers.clear();
        this._warmUpTask.clear();
        this._initFirstPage();
        this._onDidDeleteGlyphs.fire();
    }
    getGlyph(rasterizer, chars, tokenMetadata, decorationStyleSetId, x) {
        tokenMetadata &= ~(MetadataConsts.LANGUAGEID_MASK | MetadataConsts.TOKEN_TYPE_MASK | MetadataConsts.BALANCED_BRACKETS_MASK);
        tokenMetadata |= Math.floor((x % 1) * 10);
        if (!( this._warmedUpRasterizers.has(rasterizer.id))) {
            this._warmUpAtlas(rasterizer);
            this._warmedUpRasterizers.add(rasterizer.id);
        }
        return this._tryGetGlyph(
            this._glyphPageIndex.get(chars, tokenMetadata, decorationStyleSetId, rasterizer.cacheKey) ?? 0,
            rasterizer,
            chars,
            tokenMetadata,
            decorationStyleSetId
        );
    }
    _tryGetGlyph(pageIndex, rasterizer, chars, tokenMetadata, decorationStyleSetId) {
        this._glyphPageIndex.set(pageIndex, chars, tokenMetadata, decorationStyleSetId, rasterizer.cacheKey);
        return (this._pages[pageIndex].getGlyph(rasterizer, chars, tokenMetadata, decorationStyleSetId) ?? (pageIndex + 1 < this._pages.length ? this._tryGetGlyph(pageIndex + 1, rasterizer, chars, tokenMetadata, decorationStyleSetId) : undefined) ?? this._getGlyphFromNewPage(rasterizer, chars, tokenMetadata, decorationStyleSetId));
    }
    _getGlyphFromNewPage(rasterizer, chars, tokenMetadata, decorationStyleSetId) {
        if (this._pages.length >= TextureAtlas_1.maximumPageCount) {
            throw ( new Error(
                `Attempt to create a texture atlas page past the limit ${TextureAtlas_1.maximumPageCount}`
            ));
        }
        this._pages.push(
            this._instantiationService.createInstance(TextureAtlasPage, this._pages.length, this.pageSize, this._allocatorType)
        );
        this._glyphPageIndex.set(
            this._pages.length - 1,
            chars,
            tokenMetadata,
            decorationStyleSetId,
            rasterizer.cacheKey
        );
        return this._pages[this._pages.length - 1].getGlyph(rasterizer, chars, tokenMetadata, decorationStyleSetId);
    }
    getUsagePreview() {
        return Promise.all(( this._pages.map(e => e.getUsagePreview())));
    }
    getStats() {
        return ( this._pages.map(e => e.getStats()));
    }
    _warmUpAtlas(rasterizer) {
        const colorMap = this._colorMap;
        if (!colorMap) {
            throw ( new BugIndicatingError("Cannot warm atlas without color map"));
        }
        this._warmUpTask.value?.clear();
        const taskQueue = this._warmUpTask.value = this._instantiationService.createInstance(IdleTaskQueue);
        for (let code = CharCode.A; code <= CharCode.Z; code++) {
            for (const fgColor of ( colorMap.keys())) {
                taskQueue.enqueue(() => {
                    for (let x = 0; x < 1; x += 0.1) {
                        this.getGlyph(
                            rasterizer,
                            String.fromCharCode(code),
                            (fgColor << MetadataConsts.FOREGROUND_OFFSET) & MetadataConsts.FOREGROUND_MASK,
                            0,
                            x
                        );
                    }
                });
            }
        }
        for (let code = CharCode.a; code <= CharCode.z; code++) {
            for (const fgColor of ( colorMap.keys())) {
                taskQueue.enqueue(() => {
                    for (let x = 0; x < 1; x += 0.1) {
                        this.getGlyph(
                            rasterizer,
                            String.fromCharCode(code),
                            (fgColor << MetadataConsts.FOREGROUND_OFFSET) & MetadataConsts.FOREGROUND_MASK,
                            0,
                            x
                        );
                    }
                });
            }
        }
        for (let code = CharCode.ExclamationMark; code <= CharCode.Tilde; code++) {
            for (const fgColor of ( colorMap.keys())) {
                taskQueue.enqueue(() => {
                    for (let x = 0; x < 1; x += 0.1) {
                        this.getGlyph(
                            rasterizer,
                            String.fromCharCode(code),
                            (fgColor << MetadataConsts.FOREGROUND_OFFSET) & MetadataConsts.FOREGROUND_MASK,
                            0,
                            x
                        );
                    }
                });
            }
        }
    }
};
TextureAtlas = TextureAtlas_1 = ( __decorate([( __param(3, IThemeService)), ( __param(4, IInstantiationService))], TextureAtlas));

export { TextureAtlas };
