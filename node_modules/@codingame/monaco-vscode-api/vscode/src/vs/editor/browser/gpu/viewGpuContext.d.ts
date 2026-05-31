import { type FastDomNode } from "../../../base/browser/fastDomNode.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import type { ViewportData } from "../../common/viewLayout/viewLinesViewportData.js";
import type { ViewLineOptions } from "../viewParts/viewLines/viewLineOptions.js";
import { type IObservable } from "../../../base/common/observable.js";
import { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { TextureAtlas } from "./atlas/textureAtlas.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.service.js";
import { INotificationService } from "../../../platform/notification/common/notification.service.js";
import { IThemeService } from "../../../platform/theme/common/themeService.service.js";
import { RectangleRenderer } from "./rectangleRenderer.js";
import type { ViewContext } from "../../common/viewModel/viewContext.js";
import { DecorationCssRuleExtractor } from "./css/decorationCssRuleExtractor.js";
import { DecorationStyleCache } from "./css/decorationStyleCache.js";
export declare class ViewGpuContext extends Disposable {
    private readonly _instantiationService;
    private readonly _notificationService;
    private readonly configurationService;
    private readonly _themeService;
    /**
     * The hard cap for line columns rendered by the GPU renderer.
     */
    readonly maxGpuCols = 2000;
    readonly canvas: FastDomNode<HTMLCanvasElement>;
    readonly ctx: GPUCanvasContext;
    static device: Promise<GPUDevice>;
    static deviceSync: GPUDevice | undefined;
    readonly rectangleRenderer: RectangleRenderer;
    private static readonly _decorationCssRuleExtractor;
    static get decorationCssRuleExtractor(): DecorationCssRuleExtractor;
    private static readonly _decorationStyleCache;
    static get decorationStyleCache(): DecorationStyleCache;
    private static _atlas;
    /**
     * The shared texture atlas to use across all views.
     *
     * @throws if called before the GPU device is resolved
     */
    static get atlas(): TextureAtlas;
    /**
     * The shared texture atlas to use across all views. This is a convenience alias for
     * {@link ViewGpuContext.atlas}.
     *
     * @throws if called before the GPU device is resolved
     */
    get atlas(): TextureAtlas;
    readonly canvasDevicePixelDimensions: IObservable<{
        width: number;
        height: number;
    }>;
    readonly devicePixelRatio: IObservable<number>;
    readonly contentLeft: IObservable<number>;
    constructor(context: ViewContext, _instantiationService: IInstantiationService, _notificationService: INotificationService, configurationService: IConfigurationService, _themeService: IThemeService);
    /**
     * This method determines which lines can be and are allowed to be rendered using the GPU
     * renderer. Eventually this should trend all lines, except maybe exceptional cases like
     * decorations that use class names.
     */
    canRender(options: ViewLineOptions, viewportData: ViewportData, lineNumber: number): boolean;
    /**
     * Like {@link canRender} but returns detailed information about why the line cannot be rendered.
     */
    canRenderDetailed(options: ViewLineOptions, viewportData: ViewportData, lineNumber: number): string[];
}
