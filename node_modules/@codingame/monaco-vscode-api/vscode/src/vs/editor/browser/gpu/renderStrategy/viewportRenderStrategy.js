
import { getActiveWindow } from '../../../../base/browser/dom.js';
import { Color } from '../../../../base/common/color.js';
import { BugIndicatingError } from '../../../../base/common/errors.js';
import { Emitter } from '../../../../base/common/event.js';
import { CursorColumns } from '../../../common/core/cursorColumns.js';
import { createContentSegmenter } from '../contentSegmenter.js';
import { BindingId } from '../gpu.js';
import { GPULifecycle } from '../gpuDisposable.js';
import { quadVertices } from '../gpuUtils.js';
import { ViewGpuContext } from '../viewGpuContext.js';
import { BaseRenderStrategy } from './baseRenderStrategy.js';
import { fullFileRenderStrategyWgsl } from './fullFileRenderStrategy.wgsl.js';

var Constants;
(function(Constants) {
    Constants[Constants["IndicesPerCell"] = 6] = "IndicesPerCell";
    Constants[Constants["CellBindBufferCapacityIncrement"] = 32] = "CellBindBufferCapacityIncrement";
    Constants[Constants["CellBindBufferInitialCapacity"] = 63] = "CellBindBufferInitialCapacity";
})(Constants || (Constants = {}));
var CellBufferInfo;
(function(CellBufferInfo) {
    CellBufferInfo[CellBufferInfo["FloatsPerEntry"] = 6] = "FloatsPerEntry";
    CellBufferInfo[CellBufferInfo["BytesPerEntry"] = 24] = "BytesPerEntry";
    CellBufferInfo[CellBufferInfo["Offset_X"] = 0] = "Offset_X";
    CellBufferInfo[CellBufferInfo["Offset_Y"] = 1] = "Offset_Y";
    CellBufferInfo[CellBufferInfo["Offset_Unused1"] = 2] = "Offset_Unused1";
    CellBufferInfo[CellBufferInfo["Offset_Unused2"] = 3] = "Offset_Unused2";
    CellBufferInfo[CellBufferInfo["GlyphIndex"] = 4] = "GlyphIndex";
    CellBufferInfo[CellBufferInfo["TextureIndex"] = 5] = "TextureIndex";
})(CellBufferInfo || (CellBufferInfo = {}));
class ViewportRenderStrategy extends BaseRenderStrategy {
    static {
        this.maxSupportedColumns = 2000;
    }
    get bindGroupEntries() {
        return [{
            binding: BindingId.Cells,
            resource: {
                buffer: this._cellBindBuffer
            }
        }, {
            binding: BindingId.ScrollOffset,
            resource: {
                buffer: this._scrollOffsetBindBuffer
            }
        }];
    }
    constructor(context, viewGpuContext, device, glyphRasterizer) {
        super(context, viewGpuContext, device, glyphRasterizer);
        this.type = "viewport";
        this.wgsl = fullFileRenderStrategyWgsl;
        this._cellBindBufferLineCapacity = Constants.CellBindBufferInitialCapacity;
        this._activeDoubleBufferIndex = 0;
        this._visibleObjectCount = 0;
        this._lastViewportLineCount = 0;
        this._scrollInitialized = false;
        this._onDidChangeBindGroupEntries = this._register(( new Emitter()));
        this.onDidChangeBindGroupEntries = this._onDidChangeBindGroupEntries.event;
        this._rebuildCellBuffer(this._cellBindBufferLineCapacity);
        const scrollOffsetBufferSize = 2;
        this._scrollOffsetBindBuffer = this._register(GPULifecycle.createBuffer(this._device, {
            label: "Monaco scroll offset buffer",
            size: scrollOffsetBufferSize * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })).object;
        this._scrollOffsetValueBuffer = ( new Float32Array(scrollOffsetBufferSize));
    }
    _rebuildCellBuffer(lineCount) {
        this._cellBindBuffer?.destroy();
        const lineCountWithIncrement = (Math.floor(lineCount / Constants.CellBindBufferCapacityIncrement) + 1) * Constants.CellBindBufferCapacityIncrement;
        const bufferSize = lineCountWithIncrement * ViewportRenderStrategy.maxSupportedColumns * Constants.IndicesPerCell * Float32Array.BYTES_PER_ELEMENT;
        this._cellBindBuffer = this._register(GPULifecycle.createBuffer(this._device, {
            label: "Monaco full file cell buffer",
            size: bufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })).object;
        this._cellValueBuffers = [( new ArrayBuffer(bufferSize)), ( new ArrayBuffer(bufferSize))];
        this._cellBindBufferLineCapacity = lineCountWithIncrement;
        this._lastViewportLineCount = 0;
        this._onDidChangeBindGroupEntries.fire();
    }
    onConfigurationChanged(e) {
        return true;
    }
    onDecorationsChanged(e) {
        return true;
    }
    onTokensChanged(e) {
        return true;
    }
    onLinesDeleted(e) {
        return true;
    }
    onLinesInserted(e) {
        return true;
    }
    onLinesChanged(e) {
        return true;
    }
    onScrollChanged(e) {
        if (this._store.isDisposed) {
            return false;
        }
        const dpr = getActiveWindow().devicePixelRatio;
        this._scrollOffsetValueBuffer[0] = (e?.scrollLeft ?? this._context.viewLayout.getCurrentScrollLeft()) * dpr;
        this._scrollOffsetValueBuffer[1] = (e?.scrollTop ?? this._context.viewLayout.getCurrentScrollTop()) * dpr;
        this._device.queue.writeBuffer(this._scrollOffsetBindBuffer, 0, this._scrollOffsetValueBuffer);
        return true;
    }
    onThemeChanged(e) {
        return true;
    }
    onLineMappingChanged(e) {
        return true;
    }
    onZonesChanged(e) {
        return true;
    }
    reset() {
        for (const bufferIndex of [0, 1]) {
            const buffer = ( new Float32Array(this._cellValueBuffers[bufferIndex]));
            buffer.fill(0, 0, buffer.length);
            this._device.queue.writeBuffer(this._cellBindBuffer, 0, buffer.buffer, 0, buffer.byteLength);
        }
        this._lastViewportLineCount = 0;
    }
    update(viewportData, viewLineOptions) {
        let chars = "";
        let segment;
        let charWidth = 0;
        let y = 0;
        let x = 0;
        let absoluteOffsetX = 0;
        let absoluteOffsetY = 0;
        let tabXOffset = 0;
        let glyph;
        let cellIndex = 0;
        let tokenStartIndex = 0;
        let tokenEndIndex = 0;
        let tokenMetadata = 0;
        let decorationStyleSetBold;
        let decorationStyleSetColor;
        let decorationStyleSetOpacity;
        let decorationStyleSetStrikethrough;
        let decorationStyleSetStrikethroughThickness;
        let decorationStyleSetStrikethroughColor;
        let lineData;
        let decoration;
        let fillStartIndex = 0;
        let fillEndIndex = 0;
        let tokens;
        const dpr = getActiveWindow().devicePixelRatio;
        let contentSegmenter;
        if (!this._scrollInitialized) {
            this.onScrollChanged();
            this._scrollInitialized = true;
        }
        if (this._cellBindBufferLineCapacity < viewportData.endLineNumber - viewportData.startLineNumber + 1) {
            this._rebuildCellBuffer(viewportData.endLineNumber - viewportData.startLineNumber + 1);
        }
        const cellBuffer = ( new Float32Array(this._cellValueBuffers[this._activeDoubleBufferIndex]));
        cellBuffer.fill(0);
        const lineIndexCount = ViewportRenderStrategy.maxSupportedColumns * Constants.IndicesPerCell;
        for (y = viewportData.startLineNumber; y <= viewportData.endLineNumber; y++) {
            if (!this._viewGpuContext.canRender(viewLineOptions, viewportData, y)) {
                continue;
            }
            lineData = viewportData.getViewLineRenderingData(y);
            tabXOffset = 0;
            contentSegmenter = createContentSegmenter(lineData, viewLineOptions);
            charWidth = viewLineOptions.spaceWidth * dpr;
            absoluteOffsetX = (lineData.minColumn - 1) * charWidth;
            tokens = lineData.tokens;
            tokenStartIndex = lineData.minColumn - 1;
            tokenEndIndex = 0;
            for (let tokenIndex = 0, tokensLen = tokens.getCount(); tokenIndex < tokensLen; tokenIndex++) {
                tokenEndIndex = tokens.getEndOffset(tokenIndex);
                if (tokenEndIndex <= tokenStartIndex) {
                    continue;
                }
                tokenMetadata = tokens.getMetadata(tokenIndex);
                for (x = tokenStartIndex; x < tokenEndIndex; x++) {
                    if (x > ViewportRenderStrategy.maxSupportedColumns) {
                        break;
                    }
                    segment = contentSegmenter.getSegmentAtIndex(x);
                    if (segment === undefined) {
                        continue;
                    }
                    chars = segment;
                    if (!(lineData.isBasicASCII && viewLineOptions.useMonospaceOptimizations)) {
                        charWidth = this.glyphRasterizer.getTextMetrics(chars).width;
                    }
                    decorationStyleSetColor = undefined;
                    decorationStyleSetBold = undefined;
                    decorationStyleSetOpacity = undefined;
                    decorationStyleSetStrikethrough = undefined;
                    decorationStyleSetStrikethroughThickness = undefined;
                    decorationStyleSetStrikethroughColor = undefined;
                    for (decoration of lineData.inlineDecorations) {
                        if ((y < decoration.range.startLineNumber || y > decoration.range.endLineNumber) || (y === decoration.range.startLineNumber && x < decoration.range.startColumn - 1) || (y === decoration.range.endLineNumber && x >= decoration.range.endColumn - 1)) {
                            continue;
                        }
                        const rules = ViewGpuContext.decorationCssRuleExtractor.getStyleRules(this._viewGpuContext.canvas.domNode, decoration.inlineClassName);
                        for (const rule of rules) {
                            for (const r of rule.style) {
                                const value = rule.styleMap.get(r)?.toString() ?? "";
                                switch (r) {
                                case "color":
                                    {
                                        const parsedColor = Color.Format.CSS.parse(value);
                                        if (!parsedColor) {
                                            throw ( new BugIndicatingError("Invalid color format " + value));
                                        }
                                        decorationStyleSetColor = parsedColor.toNumber32Bit();
                                        break;
                                    }
                                case "font-weight":
                                    {
                                        const parsedValue = parseCssFontWeight(value);
                                        if (parsedValue >= 400) {
                                            decorationStyleSetBold = true;
                                        } else {
                                            decorationStyleSetBold = false;
                                        }
                                        break;
                                    }
                                case "opacity":
                                    {
                                        const parsedValue = parseCssOpacity(value);
                                        decorationStyleSetOpacity = parsedValue;
                                        break;
                                    }
                                case "text-decoration":
                                case "text-decoration-line":
                                    {
                                        if (value === "line-through") {
                                            decorationStyleSetStrikethrough = true;
                                        }
                                        break;
                                    }
                                case "text-decoration-thickness":
                                    {
                                        const match = value.match(/^(\d+(?:\.\d+)?)px$/);
                                        if (match) {
                                            decorationStyleSetStrikethroughThickness = parseFloat(match[1]);
                                        }
                                        break;
                                    }
                                case "text-decoration-color":
                                    {
                                        let colorValue = value;
                                        const varMatch = value.match(/^var\((--[^,]+),\s*(?:initial|inherit)\)$/);
                                        if (varMatch) {
                                            colorValue = ViewGpuContext.decorationCssRuleExtractor.resolveCssVariable(this._viewGpuContext.canvas.domNode, varMatch[1]);
                                        }
                                        const parsedColor = Color.Format.CSS.parse(colorValue);
                                        if (parsedColor) {
                                            decorationStyleSetStrikethroughColor = parsedColor.toNumber32Bit();
                                        }
                                        break;
                                    }
                                case "text-decoration-style":
                                    {
                                        break;
                                    }
                                default:
                                    throw ( new BugIndicatingError("Unexpected inline decoration style"));
                                }
                            }
                        }
                    }
                    if (chars === " " || chars === "\t") {
                        cellIndex = ((y - 1) * ViewportRenderStrategy.maxSupportedColumns + x) * Constants.IndicesPerCell;
                        cellBuffer.fill(0, cellIndex, cellIndex + CellBufferInfo.FloatsPerEntry);
                        if (chars === "\t") {
                            const offsetBefore = x + tabXOffset;
                            tabXOffset = CursorColumns.nextRenderTabStop(x + tabXOffset, lineData.tabSize);
                            absoluteOffsetX += charWidth * (tabXOffset - offsetBefore);
                            tabXOffset -= x + 1;
                        } else {
                            absoluteOffsetX += charWidth;
                        }
                        continue;
                    }
                    const decorationStyleSetId = ViewGpuContext.decorationStyleCache.getOrCreateEntry(
                        decorationStyleSetColor,
                        decorationStyleSetBold,
                        decorationStyleSetOpacity,
                        decorationStyleSetStrikethrough,
                        decorationStyleSetStrikethroughThickness,
                        decorationStyleSetStrikethroughColor
                    );
                    glyph = this._viewGpuContext.atlas.getGlyph(
                        this.glyphRasterizer,
                        chars,
                        tokenMetadata,
                        decorationStyleSetId,
                        absoluteOffsetX
                    );
                    absoluteOffsetY = Math.round(
                    viewportData.relativeVerticalOffset[y - viewportData.startLineNumber] * dpr +
                    Math.floor(
                        (viewportData.lineHeight * dpr - (glyph.fontBoundingBoxAscent + glyph.fontBoundingBoxDescent)) / 2
                    ) +
                    glyph.fontBoundingBoxAscent);
                    cellIndex = ((y - viewportData.startLineNumber) * ViewportRenderStrategy.maxSupportedColumns + x) * Constants.IndicesPerCell;
                    cellBuffer[cellIndex + CellBufferInfo.Offset_X] = Math.floor(absoluteOffsetX);
                    cellBuffer[cellIndex + CellBufferInfo.Offset_Y] = absoluteOffsetY;
                    cellBuffer[cellIndex + CellBufferInfo.GlyphIndex] = glyph.glyphIndex;
                    cellBuffer[cellIndex + CellBufferInfo.TextureIndex] = glyph.pageIndex;
                    absoluteOffsetX += charWidth;
                }
                tokenStartIndex = tokenEndIndex;
            }
            fillStartIndex = ((y - viewportData.startLineNumber) * ViewportRenderStrategy.maxSupportedColumns + tokenEndIndex) * Constants.IndicesPerCell;
            fillEndIndex = ((y - viewportData.startLineNumber) * ViewportRenderStrategy.maxSupportedColumns) * Constants.IndicesPerCell;
            cellBuffer.fill(0, fillStartIndex, fillEndIndex);
        }
        const visibleObjectCount = (viewportData.endLineNumber - viewportData.startLineNumber + 1) * lineIndexCount;
        const viewportLineCount = viewportData.endLineNumber - viewportData.startLineNumber + 1;
        this._device.queue.writeBuffer(
            this._cellBindBuffer,
            0,
            cellBuffer.buffer,
            0,
            visibleObjectCount * Float32Array.BYTES_PER_ELEMENT
        );
        if (viewportLineCount < this._lastViewportLineCount) {
            const staleLineCount = this._lastViewportLineCount - viewportLineCount;
            const staleStartOffset = visibleObjectCount * Float32Array.BYTES_PER_ELEMENT;
            const staleByteCount = staleLineCount * lineIndexCount * Float32Array.BYTES_PER_ELEMENT;
            this._device.queue.writeBuffer(
                this._cellBindBuffer,
                staleStartOffset,
                cellBuffer.buffer,
                visibleObjectCount * Float32Array.BYTES_PER_ELEMENT,
                staleByteCount
            );
        }
        this._lastViewportLineCount = viewportLineCount;
        this._activeDoubleBufferIndex = this._activeDoubleBufferIndex ? 0 : 1;
        this._visibleObjectCount = visibleObjectCount;
        return visibleObjectCount;
    }
    draw(pass, viewportData) {
        if (this._visibleObjectCount <= 0) {
            throw ( new BugIndicatingError("Attempt to draw 0 objects"));
        }
        pass.draw(quadVertices.length / 2, this._visibleObjectCount);
    }
}
function parseCssFontWeight(value) {
    switch (value) {
    case "lighter":
    case "normal":
        return 400;
    case "bolder":
    case "bold":
        return 700;
    }
    return parseInt(value);
}
function parseCssOpacity(value) {
    if (value.endsWith("%")) {
        return parseFloat(value.substring(0, value.length - 1)) / 100;
    }
    if (value.match(/^\d+(?:\.\d*)/)) {
        return parseFloat(value);
    }
    return 1;
}

export { ViewportRenderStrategy };
