
import { getActiveWindow } from '../../../../base/browser/dom.js';
import { Color } from '../../../../base/common/color.js';
import { BugIndicatingError } from '../../../../base/common/errors.js';
import { CursorColumns } from '../../../common/core/cursorColumns.js';
import { ViewEventType } from '../../../common/viewEvents.js';
import { createContentSegmenter } from '../contentSegmenter.js';
import { fullFileRenderStrategyWgsl } from './fullFileRenderStrategy.wgsl.js';
import { BindingId } from '../gpu.js';
import { GPULifecycle } from '../gpuDisposable.js';
import { quadVertices } from '../gpuUtils.js';
import { ViewGpuContext } from '../viewGpuContext.js';
import { BaseRenderStrategy } from './baseRenderStrategy.js';

var Constants;
(function(Constants) {
    Constants[Constants["IndicesPerCell"] = 6] = "IndicesPerCell";
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
class FullFileRenderStrategy extends BaseRenderStrategy {
    static {
        this.maxSupportedLines = 3000;
    }
    static {
        this.maxSupportedColumns = 200;
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
        this.type = "fullfile";
        this.wgsl = fullFileRenderStrategyWgsl;
        this._activeDoubleBufferIndex = 0;
        this._upToDateLines = [( new Set()), ( new Set())];
        this._visibleObjectCount = 0;
        this._finalRenderedLine = 0;
        this._scrollInitialized = false;
        this._queuedBufferUpdates = [[], []];
        const bufferSize = FullFileRenderStrategy.maxSupportedLines * FullFileRenderStrategy.maxSupportedColumns * Constants.IndicesPerCell * Float32Array.BYTES_PER_ELEMENT;
        this._cellBindBuffer = this._register(GPULifecycle.createBuffer(this._device, {
            label: "Monaco full file cell buffer",
            size: bufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })).object;
        this._cellValueBuffers = [( new ArrayBuffer(bufferSize)), ( new ArrayBuffer(bufferSize))];
        const scrollOffsetBufferSize = 2;
        this._scrollOffsetBindBuffer = this._register(GPULifecycle.createBuffer(this._device, {
            label: "Monaco scroll offset buffer",
            size: scrollOffsetBufferSize * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })).object;
        this._scrollOffsetValueBuffer = ( new Float32Array(scrollOffsetBufferSize));
    }
    onConfigurationChanged(e) {
        this._invalidateAllLines();
        this._queueBufferUpdate(e);
        return true;
    }
    onDecorationsChanged(e) {
        this._invalidateAllLines();
        return true;
    }
    onTokensChanged(e) {
        for (const range of e.ranges) {
            this._invalidateLineRange(range.fromLineNumber, range.toLineNumber);
        }
        return true;
    }
    onLinesDeleted(e) {
        this._invalidateLinesFrom(e.fromLineNumber);
        this._queueBufferUpdate(e);
        return true;
    }
    onLinesInserted(e) {
        this._invalidateLinesFrom(e.fromLineNumber);
        return true;
    }
    onLinesChanged(e) {
        this._invalidateLineRange(e.fromLineNumber, e.fromLineNumber + e.count);
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
        this._invalidateAllLines();
        return true;
    }
    onLineMappingChanged(e) {
        this._invalidateAllLines();
        this._queueBufferUpdate(e);
        return true;
    }
    onZonesChanged(e) {
        this._invalidateAllLines();
        this._queueBufferUpdate(e);
        return true;
    }
    _invalidateAllLines() {
        this._upToDateLines[0].clear();
        this._upToDateLines[1].clear();
    }
    _invalidateLinesFrom(lineNumber) {
        for (const i of [0, 1]) {
            const upToDateLines = this._upToDateLines[i];
            for (const upToDateLine of upToDateLines) {
                if (upToDateLine >= lineNumber) {
                    upToDateLines.delete(upToDateLine);
                }
            }
        }
    }
    _invalidateLineRange(fromLineNumber, toLineNumber) {
        for (let i = fromLineNumber; i <= toLineNumber; i++) {
            this._upToDateLines[0].delete(i);
            this._upToDateLines[1].delete(i);
        }
    }
    reset() {
        this._invalidateAllLines();
        for (const bufferIndex of [0, 1]) {
            const buffer = ( new Float32Array(this._cellValueBuffers[bufferIndex]));
            buffer.fill(0, 0, buffer.length);
            this._device.queue.writeBuffer(this._cellBindBuffer, 0, buffer.buffer, 0, buffer.byteLength);
        }
        this._finalRenderedLine = 0;
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
        const cellBuffer = ( new Float32Array(this._cellValueBuffers[this._activeDoubleBufferIndex]));
        const lineIndexCount = FullFileRenderStrategy.maxSupportedColumns * Constants.IndicesPerCell;
        const upToDateLines = this._upToDateLines[this._activeDoubleBufferIndex];
        let dirtyLineStart = 3000;
        let dirtyLineEnd = 0;
        const queuedBufferUpdates = this._queuedBufferUpdates[this._activeDoubleBufferIndex];
        while (queuedBufferUpdates.length) {
            const e = queuedBufferUpdates.shift();
            switch (e.type) {
            case ViewEventType.ViewConfigurationChanged:
            case ViewEventType.ViewLineMappingChanged:
            case ViewEventType.ViewZonesChanged:
                {
                    cellBuffer.fill(0);
                    dirtyLineStart = 1;
                    dirtyLineEnd = Math.max(dirtyLineEnd, this._finalRenderedLine);
                    this._finalRenderedLine = 0;
                    break;
                }
            case ViewEventType.ViewLinesDeleted:
                {
                    const deletedLineContentStartIndex = (e.fromLineNumber - 1) * FullFileRenderStrategy.maxSupportedColumns * Constants.IndicesPerCell;
                    const deletedLineContentEndIndex = (e.toLineNumber) * FullFileRenderStrategy.maxSupportedColumns * Constants.IndicesPerCell;
                    const nullContentStartIndex = (this._finalRenderedLine - (e.toLineNumber - e.fromLineNumber + 1)) * FullFileRenderStrategy.maxSupportedColumns * Constants.IndicesPerCell;
                    cellBuffer.set(
                        cellBuffer.subarray(deletedLineContentEndIndex),
                        deletedLineContentStartIndex
                    );
                    cellBuffer.fill(0, nullContentStartIndex);
                    dirtyLineStart = Math.min(dirtyLineStart, e.fromLineNumber);
                    dirtyLineEnd = Math.max(dirtyLineEnd, this._finalRenderedLine);
                    this._finalRenderedLine -= e.toLineNumber - e.fromLineNumber + 1;
                    break;
                }
            }
        }
        for (y = viewportData.startLineNumber; y <= viewportData.endLineNumber; y++) {
            if (!this._viewGpuContext.canRender(viewLineOptions, viewportData, y)) {
                fillStartIndex = ((y - 1) * FullFileRenderStrategy.maxSupportedColumns) * Constants.IndicesPerCell;
                fillEndIndex = (y * FullFileRenderStrategy.maxSupportedColumns) * Constants.IndicesPerCell;
                cellBuffer.fill(0, fillStartIndex, fillEndIndex);
                dirtyLineStart = Math.min(dirtyLineStart, y);
                dirtyLineEnd = Math.max(dirtyLineEnd, y);
                continue;
            }
            if (( upToDateLines.has(y))) {
                continue;
            }
            dirtyLineStart = Math.min(dirtyLineStart, y);
            dirtyLineEnd = Math.max(dirtyLineEnd, y);
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
                    if (x > FullFileRenderStrategy.maxSupportedColumns) {
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
                        cellIndex = ((y - 1) * FullFileRenderStrategy.maxSupportedColumns + x) * Constants.IndicesPerCell;
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
                    cellIndex = ((y - 1) * FullFileRenderStrategy.maxSupportedColumns + x) * Constants.IndicesPerCell;
                    cellBuffer[cellIndex + CellBufferInfo.Offset_X] = Math.floor(absoluteOffsetX);
                    cellBuffer[cellIndex + CellBufferInfo.Offset_Y] = absoluteOffsetY;
                    cellBuffer[cellIndex + CellBufferInfo.GlyphIndex] = glyph.glyphIndex;
                    cellBuffer[cellIndex + CellBufferInfo.TextureIndex] = glyph.pageIndex;
                    absoluteOffsetX += charWidth;
                }
                tokenStartIndex = tokenEndIndex;
            }
            fillStartIndex = ((y - 1) * FullFileRenderStrategy.maxSupportedColumns + tokenEndIndex) * Constants.IndicesPerCell;
            fillEndIndex = (y * FullFileRenderStrategy.maxSupportedColumns) * Constants.IndicesPerCell;
            cellBuffer.fill(0, fillStartIndex, fillEndIndex);
            upToDateLines.add(y);
        }
        const visibleObjectCount = (viewportData.endLineNumber - viewportData.startLineNumber + 1) * lineIndexCount;
        dirtyLineStart = Math.min(dirtyLineStart, FullFileRenderStrategy.maxSupportedLines);
        dirtyLineEnd = Math.min(dirtyLineEnd, FullFileRenderStrategy.maxSupportedLines);
        if (dirtyLineStart <= dirtyLineEnd) {
            this._device.queue.writeBuffer(
                this._cellBindBuffer,
                (dirtyLineStart - 1) * lineIndexCount * Float32Array.BYTES_PER_ELEMENT,
                cellBuffer.buffer,
                (dirtyLineStart - 1) * lineIndexCount * Float32Array.BYTES_PER_ELEMENT,
                (dirtyLineEnd - dirtyLineStart + 1) * lineIndexCount * Float32Array.BYTES_PER_ELEMENT
            );
        }
        this._finalRenderedLine = Math.max(this._finalRenderedLine, dirtyLineEnd);
        this._activeDoubleBufferIndex = this._activeDoubleBufferIndex ? 0 : 1;
        this._visibleObjectCount = visibleObjectCount;
        return visibleObjectCount;
    }
    draw(pass, viewportData) {
        if (this._visibleObjectCount <= 0) {
            throw ( new BugIndicatingError("Attempt to draw 0 objects"));
        }
        pass.draw(
            quadVertices.length / 2,
            this._visibleObjectCount,
            undefined,
            (viewportData.startLineNumber - 1) * FullFileRenderStrategy.maxSupportedColumns
        );
    }
    _queueBufferUpdate(e) {
        this._queuedBufferUpdates[0].push(e);
        this._queuedBufferUpdates[1].push(e);
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

export { FullFileRenderStrategy };
