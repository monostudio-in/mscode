
import { registerCss } from '../../../../../../../css.js';
import { DynamicViewOverlay } from '../../view/dynamicViewOverlay.js';
import { ViewLineOptions } from '../viewLines/viewLineOptions.js';
import * as gpuMark from './gpuMark.css';

registerCss(gpuMark);
class GpuMarkOverlay extends DynamicViewOverlay {
    static {
        this.CLASS_NAME = "gpu-mark";
    }
    constructor(context, _viewGpuContext) {
        super();
        this._viewGpuContext = _viewGpuContext;
        this._context = context;
        this._renderResult = null;
        this._context.addEventHandler(this);
    }
    dispose() {
        this._context.removeEventHandler(this);
        this._renderResult = null;
        super.dispose();
    }
    onConfigurationChanged(e) {
        return true;
    }
    onCursorStateChanged(e) {
        return true;
    }
    onFlushed(e) {
        return true;
    }
    onLinesChanged(e) {
        return true;
    }
    onLinesDeleted(e) {
        return true;
    }
    onLinesInserted(e) {
        return true;
    }
    onScrollChanged(e) {
        return e.scrollTopChanged;
    }
    onZonesChanged(e) {
        return true;
    }
    onDecorationsChanged(e) {
        return true;
    }
    prepareRender(ctx) {
        const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
        const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
        const viewportData = ctx.viewportData;
        const options = ( new ViewLineOptions(this._context.configuration, this._context.theme.type));
        const output = [];
        for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
            const lineIndex = lineNumber - visibleStartLineNumber;
            const cannotRenderReasons = this._viewGpuContext.canRenderDetailed(options, viewportData, lineNumber);
            output[lineIndex] = cannotRenderReasons.length ? `<div class="${GpuMarkOverlay.CLASS_NAME}" title="Cannot render on GPU: ${cannotRenderReasons.join(", ")}"></div>` : "";
        }
        this._renderResult = output;
    }
    render(startLineNumber, lineNumber) {
        if (!this._renderResult) {
            return "";
        }
        const lineIndex = lineNumber - startLineNumber;
        if (lineIndex < 0 || lineIndex >= this._renderResult.length) {
            return "";
        }
        return this._renderResult[lineIndex];
    }
}

export { GpuMarkOverlay };
