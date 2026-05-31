import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.service.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import type { ViewportData } from "../../../common/viewLayout/viewLinesViewportData.js";
import type { ViewContext } from "../../../common/viewModel/viewContext.js";
import { ViewGpuContext } from "../../gpu/viewGpuContext.js";
import { HorizontalPosition, IViewLines, LineVisibleRanges, RenderingContext, RestrictedRenderingContext } from "../../view/renderingContext.js";
import { ViewPart } from "../../view/viewPart.js";
import type * as viewEvents from "../../../common/viewEvents.js";
/**
 * The GPU implementation of the ViewLines part.
 */
export declare class ViewLinesGpu extends ViewPart implements IViewLines {
    private readonly _viewGpuContext;
    private readonly _instantiationService;
    private readonly _logService;
    private readonly canvas;
    private _initViewportData?;
    private _lastViewportData?;
    private _lastViewLineOptions?;
    /**
     * Tracks the maximum line width seen so far for horizontal scrollbar sizing.
     * This is needed because GPU-rendered lines don't have DOM nodes to measure.
     */
    private _maxLineWidth;
    private _device;
    private _renderPassDescriptor;
    private _renderPassColorAttachment;
    private _bindGroup;
    private _pipeline;
    private _vertexBuffer;
    private _glyphStorageBuffer;
    private _atlasGpuTexture;
    private readonly _atlasGpuTextureVersions;
    private _initialized;
    private readonly _glyphRasterizer;
    private readonly _renderStrategy;
    private _rebuildBindGroup?;
    constructor(context: ViewContext, _viewGpuContext: ViewGpuContext, _instantiationService: IInstantiationService, _logService: ILogService);
    initWebgpu(): Promise<void>;
    private _refreshRenderStrategy;
    private _viewportMaxColumn;
    private _updateAtlasStorageBufferAndTexture;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onLineMappingChanged(e: viewEvents.ViewLineMappingChangedEvent): boolean;
    onRevealRangeRequest(e: viewEvents.ViewRevealRangeRequestEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onThemeChanged(e: viewEvents.ViewThemeChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    private _refreshGlyphRasterizer;
    renderText(viewportData: ViewportData): void;
    private _renderText;
    /**
     * Update the max line width based on GPU-rendered lines.
     * This is needed because GPU-rendered lines don't have DOM nodes to measure.
     */
    private _updateMaxLineWidth;
    /**
     * Compute the width of a line in CSS pixels.
     */
    private _computeLineWidth;
    linesVisibleRangesForRange(_range: Range, includeNewLines: boolean): LineVisibleRanges[] | null;
    private _visibleRangesForLineRange;
    visibleRangeForPosition(position: Position): HorizontalPosition | null;
    getLineWidth(lineNumber: number): number | undefined;
    getPositionAtCoordinate(lineNumber: number, mouseContentHorizontalOffset: number): Position | undefined;
}
