import { type ViewConfigurationChangedEvent, type ViewDecorationsChangedEvent, type ViewLineMappingChangedEvent, type ViewLinesChangedEvent, type ViewLinesDeletedEvent, type ViewLinesInsertedEvent, type ViewScrollChangedEvent, type ViewThemeChangedEvent, type ViewTokensChangedEvent, type ViewZonesChangedEvent } from "../../../common/viewEvents.js";
import type { ViewportData } from "../../../common/viewLayout/viewLinesViewportData.js";
import type { ViewContext } from "../../../common/viewModel/viewContext.js";
import type { ViewLineOptions } from "../../viewParts/viewLines/viewLineOptions.js";
import { GlyphRasterizer } from "../raster/glyphRasterizer.js";
import { ViewGpuContext } from "../viewGpuContext.js";
import { BaseRenderStrategy } from "./baseRenderStrategy.js";
/**
 * A render strategy that uploads the content of the entire viewport every frame.
 */
export declare class ViewportRenderStrategy extends BaseRenderStrategy {
    /**
     * The hard cap for line columns that can be rendered by the GPU renderer.
     */
    static readonly maxSupportedColumns = 2000;
    readonly type = "viewport";
    readonly wgsl: string;
    private _cellBindBufferLineCapacity;
    private _cellBindBuffer;
    /**
     * The cell value buffers, these hold the cells and their glyphs. It's double buffers such that
     * the thread doesn't block when one is being uploaded to the GPU.
     */
    private _cellValueBuffers;
    private _activeDoubleBufferIndex;
    private _visibleObjectCount;
    private _lastViewportLineCount;
    private _scrollOffsetBindBuffer;
    private _scrollOffsetValueBuffer;
    private _scrollInitialized;
    get bindGroupEntries(): GPUBindGroupEntry[];
    private readonly _onDidChangeBindGroupEntries;
    readonly onDidChangeBindGroupEntries: import("../../../../base/common/event.js").Event<void>;
    constructor(context: ViewContext, viewGpuContext: ViewGpuContext, device: GPUDevice, glyphRasterizer: {
        value: GlyphRasterizer;
    });
    private _rebuildCellBuffer;
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
    reset(): void;
    update(viewportData: ViewportData, viewLineOptions: ViewLineOptions): number;
    draw(pass: GPURenderPassEncoder, viewportData: ViewportData): void;
}
