
import { getActiveWindow } from '../../../base/browser/dom.js';
import { mainWindow } from '../../../base/browser/window.js';
import { Event } from '../../../base/common/event.js';
import { MutableDisposable } from '../../../base/common/lifecycle.js';
import { EditorOption } from '../../common/config/editorOptions.js';
import { ViewEventHandler } from '../../common/viewEventHandler.js';
import { GPULifecycle } from './gpuDisposable.js';
import { observeDevicePixelDimensions, quadVertices } from './gpuUtils.js';
import { createObjectCollectionBuffer } from './objectCollectionBuffer.js';
import { rectangleRendererWgsl, RectangleRendererBindingId } from './rectangleRenderer.wgsl.js';

class RectangleRenderer extends ViewEventHandler {
    constructor(_context, _contentLeft, _devicePixelRatio, _canvas, _ctx, device) {
        super();
        this._context = _context;
        this._contentLeft = _contentLeft;
        this._devicePixelRatio = _devicePixelRatio;
        this._canvas = _canvas;
        this._ctx = _ctx;
        this._shapeBindBuffer = this._register(( new MutableDisposable()));
        this._initialized = false;
        this._shapeCollection = this._register(createObjectCollectionBuffer([{
            name: "x"
        }, {
            name: "y"
        }, {
            name: "width"
        }, {
            name: "height"
        }, {
            name: "red"
        }, {
            name: "green"
        }, {
            name: "blue"
        }, {
            name: "alpha"
        }], 32));
        this._context.addEventHandler(this);
        this._initWebgpu(device);
    }
    async _initWebgpu(device) {
        this._device = await device;
        if (this._store.isDisposed) {
            return;
        }
        const presentationFormat = mainWindow.navigator.gpu.getPreferredCanvasFormat();
        this._ctx.configure({
            device: this._device,
            format: presentationFormat,
            alphaMode: "premultiplied"
        });
        this._renderPassColorAttachment = {
            view: null,
            loadOp: "load",
            storeOp: "store"
        };
        this._renderPassDescriptor = {
            label: "Monaco rectangle renderer render pass",
            colorAttachments: [this._renderPassColorAttachment]
        };
        let layoutInfoUniformBuffer;
        {
            let Info;
            (function(Info) {
                Info[Info["FloatsPerEntry"] = 6] = "FloatsPerEntry";
                Info[Info["BytesPerEntry"] = 24] = "BytesPerEntry";
                Info[Info["Offset_CanvasWidth____"] = 0] = "Offset_CanvasWidth____";
                Info[Info["Offset_CanvasHeight___"] = 1] = "Offset_CanvasHeight___";
                Info[Info["Offset_ViewportOffsetX"] = 2] = "Offset_ViewportOffsetX";
                Info[Info["Offset_ViewportOffsetY"] = 3] = "Offset_ViewportOffsetY";
                Info[Info["Offset_ViewportWidth__"] = 4] = "Offset_ViewportWidth__";
                Info[Info["Offset_ViewportHeight_"] = 5] = "Offset_ViewportHeight_";
            })(Info || (Info = {}));
            const bufferValues = ( new Float32Array(Info.FloatsPerEntry));
            const updateBufferValues = (
                canvasDevicePixelWidth = this._canvas.width,
                canvasDevicePixelHeight = this._canvas.height
            ) => {
                bufferValues[Info.Offset_CanvasWidth____] = canvasDevicePixelWidth;
                bufferValues[Info.Offset_CanvasHeight___] = canvasDevicePixelHeight;
                bufferValues[Info.Offset_ViewportOffsetX] = Math.ceil(
                    this._context.configuration.options.get(EditorOption.layoutInfo).contentLeft * getActiveWindow().devicePixelRatio
                );
                bufferValues[Info.Offset_ViewportOffsetY] = 0;
                bufferValues[Info.Offset_ViewportWidth__] = bufferValues[Info.Offset_CanvasWidth____] - bufferValues[Info.Offset_ViewportOffsetX];
                bufferValues[Info.Offset_ViewportHeight_] = bufferValues[Info.Offset_CanvasHeight___] - bufferValues[Info.Offset_ViewportOffsetY];
                return bufferValues;
            };
            layoutInfoUniformBuffer = this._register(GPULifecycle.createBuffer(this._device, {
                label: "Monaco rectangle renderer uniform buffer",
                size: Info.BytesPerEntry,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            }, () => updateBufferValues())).object;
            this._register(observeDevicePixelDimensions(this._canvas, getActiveWindow(), (w, h) => {
                this._device.queue.writeBuffer(layoutInfoUniformBuffer, 0, updateBufferValues(w, h));
            }));
        }
        const scrollOffsetBufferSize = 2;
        this._scrollOffsetBindBuffer = this._register(GPULifecycle.createBuffer(this._device, {
            label: "Monaco rectangle renderer scroll offset buffer",
            size: scrollOffsetBufferSize * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })).object;
        this._scrollOffsetValueBuffer = ( new Float32Array(scrollOffsetBufferSize));
        const createShapeBindBuffer = () => {
            return GPULifecycle.createBuffer(this._device, {
                label: "Monaco rectangle renderer shape buffer",
                size: this._shapeCollection.buffer.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
            });
        };
        this._shapeBindBuffer.value = createShapeBindBuffer();
        this._register(Event.runAndSubscribe(this._shapeCollection.onDidChangeBuffer, () => {
            this._shapeBindBuffer.value = createShapeBindBuffer();
            if (this._pipeline) {
                this._updateBindGroup(this._pipeline, layoutInfoUniformBuffer);
            }
        }));
        this._vertexBuffer = this._register(GPULifecycle.createBuffer(this._device, {
            label: "Monaco rectangle renderer vertex buffer",
            size: quadVertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        }, quadVertices)).object;
        const module = this._device.createShaderModule({
            label: "Monaco rectangle renderer shader module",
            code: rectangleRendererWgsl
        });
        this._pipeline = this._device.createRenderPipeline({
            label: "Monaco rectangle renderer render pipeline",
            layout: "auto",
            vertex: {
                module,
                buffers: [{
                    arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
                    attributes: [
                    {
                        shaderLocation: 0,
                        offset: 0,
                        format: "float32x2"
                    }]
                }]
            },
            fragment: {
                module,
                targets: [{
                    format: presentationFormat,
                    blend: {
                        color: {
                            srcFactor: "src-alpha",
                            dstFactor: "one-minus-src-alpha"
                        },
                        alpha: {
                            srcFactor: "src-alpha",
                            dstFactor: "one-minus-src-alpha"
                        }
                    }
                }]
            }
        });
        this._updateBindGroup(this._pipeline, layoutInfoUniformBuffer);
        this._initialized = true;
    }
    _updateBindGroup(pipeline, layoutInfoUniformBuffer) {
        this._bindGroup = this._device.createBindGroup({
            label: "Monaco rectangle renderer bind group",
            layout: pipeline.getBindGroupLayout(0),
            entries: [{
                binding: RectangleRendererBindingId.Shapes,
                resource: {
                    buffer: this._shapeBindBuffer.value.object
                }
            }, {
                binding: RectangleRendererBindingId.LayoutInfoUniform,
                resource: {
                    buffer: layoutInfoUniformBuffer
                }
            }, {
                binding: RectangleRendererBindingId.ScrollOffset,
                resource: {
                    buffer: this._scrollOffsetBindBuffer
                }
            }]
        });
    }
    register(x, y, width, height, red, green, blue, alpha) {
        return this._shapeCollection.createEntry({
            x,
            y,
            width,
            height,
            red,
            green,
            blue,
            alpha
        });
    }
    onScrollChanged(e) {
        if (this._device) {
            const dpr = getActiveWindow().devicePixelRatio;
            this._scrollOffsetValueBuffer[0] = this._context.viewLayout.getCurrentScrollLeft() * dpr;
            this._scrollOffsetValueBuffer[1] = this._context.viewLayout.getCurrentScrollTop() * dpr;
            this._device.queue.writeBuffer(this._scrollOffsetBindBuffer, 0, this._scrollOffsetValueBuffer);
        }
        return true;
    }
    _update() {
        if (!this._device) {
            return;
        }
        const shapes = this._shapeCollection;
        if (shapes.dirtyTracker.isDirty) {
            this._device.queue.writeBuffer(
                this._shapeBindBuffer.value.object,
                0,
                shapes.buffer,
                shapes.dirtyTracker.dataOffset,
                shapes.dirtyTracker.dirtySize * shapes.view.BYTES_PER_ELEMENT
            );
            shapes.dirtyTracker.clear();
        }
    }
    draw(viewportData) {
        if (!this._initialized) {
            return;
        }
        this._update();
        const encoder = this._device.createCommandEncoder({
            label: "Monaco rectangle renderer command encoder"
        });
        this._renderPassColorAttachment.view = this._ctx.getCurrentTexture().createView();
        const pass = encoder.beginRenderPass(this._renderPassDescriptor);
        pass.setPipeline(this._pipeline);
        pass.setVertexBuffer(0, this._vertexBuffer);
        pass.setBindGroup(0, this._bindGroup);
        const contentLeft = Math.ceil(this._contentLeft.get() * this._devicePixelRatio.get());
        pass.setScissorRect(contentLeft, 0, this._canvas.width - contentLeft, this._canvas.height);
        pass.draw(quadVertices.length / 2, this._shapeCollection.entryCount);
        pass.end();
        const commandBuffer = encoder.finish();
        this._device.queue.submit([commandBuffer]);
    }
}

export { RectangleRenderer };
