
import { ViewEventHandler } from '../../../common/viewEventHandler.js';

class BaseRenderStrategy extends ViewEventHandler {
    get glyphRasterizer() { return this._glyphRasterizer.value; }
    constructor(_context, _viewGpuContext, _device, _glyphRasterizer) {
        super();
        this._context = _context;
        this._viewGpuContext = _viewGpuContext;
        this._device = _device;
        this._glyphRasterizer = _glyphRasterizer;
        this._context.addEventHandler(this);
    }
}

export { BaseRenderStrategy };
