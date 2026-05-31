import { type ViewConfigurationChangedEvent, type ViewDecorationsChangedEvent, type ViewLineMappingChangedEvent, type ViewLinesChangedEvent, type ViewLinesDeletedEvent, type ViewLinesInsertedEvent, type ViewScrollChangedEvent, type ViewThemeChangedEvent, type ViewTokensChangedEvent, type ViewZonesChangedEvent } from "../../../common/viewEvents.js";
import type { ViewportData } from "../../../common/viewLayout/viewLinesViewportData.js";
import type { ViewContext } from "../../../common/viewModel/viewContext.js";
import type { ViewLineOptions } from "../../viewParts/viewLines/viewLineOptions.js";
import { GlyphRasterizer } from "../raster/glyphRasterizer.js";
import { ViewGpuContext } from "../viewGpuContext.js";
import { BaseRenderStrategy } from "./baseRenderStrategy.js";
/**
 * A render strategy that tracks a large buffer, uploading only dirty lines as they change and
 * leveraging heavy caching. This is the most performant strategy but has limitations around long
 * lines and too many lines.
 */
export declare class FullFileRenderStrategy extends BaseRenderStrategy {
    /**
     * The hard cap for line count that can be rendered by the GPU renderer.
     */
    static readonly maxSupportedLines = 3000;
    /**
     * The hard cap for line columns that can be rendered by the GPU renderer.
     */
    static readonly maxSupportedColumns = 200;
    readonly type = "fullfile";
    readonly wgsl: string;
    private _cellBindBuffer;
    /**
     * The cell value buffers, these hold the cells and their glyphs. It's double buffers such that
     * the thread doesn't block when one is being uploaded to the GPU.
     */
    private _cellValueBuffers;
    private _activeDoubleBufferIndex;
    private readonly _upToDateLines;
    private _visibleObjectCount;
    private _finalRenderedLine;
    private _scrollOffsetBindBuffer;
    private _scrollOffsetValueBuffer;
    private _scrollInitialized;
    private readonly _queuedBufferUpdates;
    get bindGroupEntries(): GPUBindGroupEntry[];
    constructor(context: ViewContext, viewGpuContext: ViewGpuContext, device: GPUDevice, glyphRasterizer: {
        value: GlyphRasterizer;
    });
    onConfigurationChanged(e: ViewConfigurationChangedEvent): boolean;
    onDecorationsChanged(e: ViewDecorationsChangedEvent): boolean;
    onTokensChanged(e: ViewTokensChangedEvent): boolean;
    onLinesDeleted(e: ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: ViewLinesInsertedEvent): boolean;
    onLinesChanged(e: ViewLinesChangedEvent): boolean;
    onScrollChanged(e?: ViewScrollChangedEvent): boolean;
    onThemeChanged(e: ViewThemeChangedEvent): boolean;
    onLineMappingChanged(e: ViewLineMappingChangedEvent): boolean;
    onZonesChanged(e: ViewZonesChangedEvent): boolean;
    private _invalidateAllLines;
    private _invalidateLinesFrom;
    private _invalidateLineRange;
    reset(): void;
    update(viewportData: ViewportData, viewLineOptions: ViewLineOptions): number;
    draw(pass: GPURenderPassEncoder, viewportData: ViewportData): void;
    /**
     * Queue updates that need to happen on the active buffer, not just the cache. This will be
     * deferred to when the actual cell buffer is changed since the active buffer could be locked by
     * the GPU which would block the main thread.
     */
    private _queueBufferUpdate;
}
