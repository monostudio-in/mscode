import { ViewEventHandler } from "../../../common/viewEventHandler.js";
import type { ViewportData } from "../../../common/viewLayout/viewLinesViewportData.js";
import type { ViewContext } from "../../../common/viewModel/viewContext.js";
import type { ViewLineOptions } from "../../viewParts/viewLines/viewLineOptions.js";
import type { IGpuRenderStrategy } from "../gpu.js";
import { GlyphRasterizer } from "../raster/glyphRasterizer.js";
import type { ViewGpuContext } from "../viewGpuContext.js";
export declare abstract class BaseRenderStrategy extends ViewEventHandler implements IGpuRenderStrategy {
    protected readonly _context: ViewContext;
    protected readonly _viewGpuContext: ViewGpuContext;
    protected readonly _device: GPUDevice;
    protected readonly _glyphRasterizer: {
        value: GlyphRasterizer;
    };
    get glyphRasterizer(): GlyphRasterizer;
    abstract type: string;
    abstract wgsl: string;
    abstract bindGroupEntries: GPUBindGroupEntry[];
    constructor(_context: ViewContext, _viewGpuContext: ViewGpuContext, _device: GPUDevice, _glyphRasterizer: {
        value: GlyphRasterizer;
    });
    abstract reset(): void;
    abstract update(viewportData: ViewportData, viewLineOptions: ViewLineOptions): number;
    abstract draw(pass: GPURenderPassEncoder, viewportData: ViewportData): void;
}
