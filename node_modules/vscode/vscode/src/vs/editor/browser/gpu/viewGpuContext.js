
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { localize } from '../../../nls.js';
import { createElement, getActiveWindow, addDisposableListener } from '../../../base/browser/dom.js';
import { createFastDomNode } from '../../../base/browser/fastDomNode.js';
import { Color } from '../../../base/common/color.js';
import { BugIndicatingError } from '../../../base/common/errors.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import '../../../base/common/observableInternal/index.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { TextureAtlas } from './atlas/textureAtlas.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.service.js';
import '../../../platform/notification/common/notification.js';
import { INotificationService } from '../../../platform/notification/common/notification.service.js';
import { IThemeService } from '../../../platform/theme/common/themeService.service.js';
import { GPULifecycle } from './gpuDisposable.js';
import { ensureNonNullable, observeDevicePixelDimensions } from './gpuUtils.js';
import { RectangleRenderer } from './rectangleRenderer.js';
import { DecorationCssRuleExtractor } from './css/decorationCssRuleExtractor.js';
import { Event } from '../../../base/common/event.js';
import { EditorOption } from '../../common/config/editorOptions.js';
import { DecorationStyleCache } from './css/decorationStyleCache.js';
import { InlineDecorationType } from '../../common/viewModel/inlineDecorations.js';
import Severity$1 from '../../../base/common/severity.js';
import { observableValue } from '../../../base/common/observableInternal/observables/observableValue.js';
import { runOnChange } from '../../../base/common/observableInternal/utils/runOnChange.js';

var ViewGpuContext_1;
let ViewGpuContext = class ViewGpuContext extends Disposable {
    static {
        ViewGpuContext_1 = this;
    }
    static {
        this._decorationCssRuleExtractor = ( new DecorationCssRuleExtractor());
    }
    static get decorationCssRuleExtractor() {
        return ViewGpuContext_1._decorationCssRuleExtractor;
    }
    static {
        this._decorationStyleCache = ( new DecorationStyleCache());
    }
    static get decorationStyleCache() {
        return ViewGpuContext_1._decorationStyleCache;
    }
    static get atlas() {
        if (!ViewGpuContext_1._atlas) {
            throw ( new BugIndicatingError("Cannot call ViewGpuContext.textureAtlas before device is resolved"));
        }
        return ViewGpuContext_1._atlas;
    }
    get atlas() {
        return ViewGpuContext_1.atlas;
    }
    constructor(
        context,
        _instantiationService,
        _notificationService,
        configurationService,
        _themeService
    ) {
        super();
        this._instantiationService = _instantiationService;
        this._notificationService = _notificationService;
        this.configurationService = configurationService;
        this._themeService = _themeService;
        this.maxGpuCols = 2000;
        this.canvas = createFastDomNode(createElement("canvas"));
        this.canvas.setClassName("editorCanvas");
        this._register(
            Event.runAndSubscribe(configurationService.onDidChangeConfiguration, e => {
                if (!e || e.affectsConfiguration("editor.scrollbar.verticalScrollbarSize")) {
                    const verticalScrollbarSize = configurationService.getValue("editor").scrollbar?.verticalScrollbarSize ?? 14;
                    this.canvas.domNode.style.boxSizing = "border-box";
                    this.canvas.domNode.style.paddingRight = `${verticalScrollbarSize}px`;
                }
            })
        );
        this.ctx = ensureNonNullable(this.canvas.domNode.getContext("webgpu"));
        if (!ViewGpuContext_1.device) {
            ViewGpuContext_1.device = GPULifecycle.requestDevice(message => {
                const choices = [{
                    label: ( localize(160, "Use DOM-based rendering")),
                    run: () => this.configurationService.updateValue("editor.experimentalGpuAcceleration", "off")
                }];
                this._notificationService.prompt(Severity$1.Warning, message, choices);
            }).then(ref => {
                ViewGpuContext_1.deviceSync = ref.object;
                if (!ViewGpuContext_1._atlas) {
                    ViewGpuContext_1._atlas = this._instantiationService.createInstance(
                        TextureAtlas,
                        ref.object.limits.maxTextureDimension2D,
                        undefined,
                        ViewGpuContext_1.decorationStyleCache
                    );
                }
                return ref.object;
            });
        }
        const dprObs = observableValue(this, getActiveWindow().devicePixelRatio);
        this._register(addDisposableListener(getActiveWindow(), "resize", () => {
            dprObs.set(getActiveWindow().devicePixelRatio, undefined);
        }));
        this.devicePixelRatio = dprObs;
        this._register(runOnChange(this.devicePixelRatio, () => ViewGpuContext_1.atlas?.clear()));
        this._register(this._themeService.onDidColorThemeChange(() => {
            ViewGpuContext_1.decorationCssRuleExtractor.clear();
            ViewGpuContext_1.atlas?.clear();
        }));
        const canvasDevicePixelDimensions = observableValue(this, {
            width: this.canvas.domNode.width,
            height: this.canvas.domNode.height
        });
        this._register(
            observeDevicePixelDimensions(this.canvas.domNode, getActiveWindow(), (width, height) => {
                this.canvas.domNode.width = width;
                this.canvas.domNode.height = height;
                canvasDevicePixelDimensions.set({
                    width,
                    height
                }, undefined);
            })
        );
        this.canvasDevicePixelDimensions = canvasDevicePixelDimensions;
        const contentLeft = observableValue(this, 0);
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            contentLeft.set(
                context.configuration.options.get(EditorOption.layoutInfo).contentLeft,
                undefined
            );
        }));
        this.contentLeft = contentLeft;
        this.rectangleRenderer = this._register(this._instantiationService.createInstance(
            RectangleRenderer,
            context,
            this.contentLeft,
            this.devicePixelRatio,
            this.canvas.domNode,
            this.ctx,
            ViewGpuContext_1.device
        ));
    }
    canRender(options, viewportData, lineNumber) {
        const data = viewportData.getViewLineRenderingData(lineNumber);
        if (data.containsRTL || data.maxColumn > this.maxGpuCols) {
            return false;
        }
        if (data.inlineDecorations.length > 0) {
            let supported = true;
            for (const decoration of data.inlineDecorations) {
                if (decoration.type !== InlineDecorationType.Regular) {
                    supported = false;
                    break;
                }
                const styleRules = ViewGpuContext_1._decorationCssRuleExtractor.getStyleRules(this.canvas.domNode, decoration.inlineClassName);
                supported &&= styleRules.every(rule => {
                    if (rule.selectorText.includes(":")) {
                        return false;
                    }
                    for (const r of rule.style) {
                        if (!supportsCssRule(r, rule.style)) {
                            return false;
                        }
                    }
                    return true;
                });
                if (!supported) {
                    break;
                }
            }
            return supported;
        }
        return true;
    }
    canRenderDetailed(options, viewportData, lineNumber) {
        const data = viewportData.getViewLineRenderingData(lineNumber);
        const reasons = [];
        if (data.containsRTL) {
            reasons.push("containsRTL");
        }
        if (data.maxColumn > this.maxGpuCols) {
            reasons.push("maxColumn > maxGpuCols");
        }
        if (data.inlineDecorations.length > 0) {
            let supported = true;
            const problemTypes = [];
            const problemSelectors = [];
            const problemRules = [];
            for (const decoration of data.inlineDecorations) {
                if (decoration.type !== InlineDecorationType.Regular) {
                    problemTypes.push(decoration.type);
                    supported = false;
                    continue;
                }
                const styleRules = ViewGpuContext_1._decorationCssRuleExtractor.getStyleRules(this.canvas.domNode, decoration.inlineClassName);
                supported &&= styleRules.every(rule => {
                    if (rule.selectorText.includes(":")) {
                        problemSelectors.push(rule.selectorText);
                        return false;
                    }
                    for (const r of rule.style) {
                        if (!supportsCssRule(r, rule.style)) {
                            problemRules.push(`${r}: ${rule.style[r]}`);
                            return false;
                        }
                    }
                    return true;
                });
                if (!supported) {
                    continue;
                }
            }
            if (problemTypes.length > 0) {
                reasons.push(`inlineDecorations with unsupported types (${( problemTypes.map(e => `\`${e}\``)).join(", ")})`);
            }
            if (problemRules.length > 0) {
                reasons.push(`inlineDecorations with unsupported CSS rules (${( problemRules.map(e => `\`${e}\``)).join(", ")})`);
            }
            if (problemSelectors.length > 0) {
                reasons.push(`inlineDecorations with unsupported CSS selectors (${( problemSelectors.map(e => `\`${e}\``)).join(", ")})`);
            }
        }
        return reasons;
    }
};
ViewGpuContext = ViewGpuContext_1 = ( __decorate([( __param(1, IInstantiationService)), ( __param(2, INotificationService)), ( __param(3, IConfigurationService)), ( __param(4, IThemeService))], ViewGpuContext));
const gpuSupportedDecorationCssRules = [
    "color",
    "font-weight",
    "opacity",
    "text-decoration",
    "text-decoration-color",
    "text-decoration-line",
    "text-decoration-style",
    "text-decoration-thickness"
];
function supportsCssRule(rule, style) {
    if (!gpuSupportedDecorationCssRules.includes(rule)) {
        return false;
    }
    switch (rule) {
    case "text-decoration":
    case "text-decoration-line":
        {
            const value = style.getPropertyValue(rule);
            return value === "line-through";
        }
    case "text-decoration-color":
        {
            const value = style.getPropertyValue(rule);
            if (/^var\(--[^,]+,\s*(?:initial|inherit)\)$/.test(value)) {
                return true;
            }
            return Color.Format.CSS.parse(value) !== null;
        }
    case "text-decoration-style":
        {
            const value = style.getPropertyValue(rule);
            return value === "initial";
        }
    case "text-decoration-thickness":
        {
            const value = style.getPropertyValue(rule);
            return value === "initial" || /^\d+(\.\d+)?px$/.test(value);
        }
    default:
        return true;
    }
}

export { ViewGpuContext };
