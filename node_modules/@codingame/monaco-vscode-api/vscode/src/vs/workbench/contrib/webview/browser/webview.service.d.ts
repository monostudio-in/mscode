import { Event } from "../../../../base/common/event.js";
import { IWebview, WebviewInitInfo, IWebviewElement, IOverlayWebview } from "./webview.js";
export declare const IWebviewService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWebviewService>;
export interface IWebviewService {
    readonly _serviceBrand: undefined;
    /**
    * The currently focused webview.
    */
    readonly activeWebview: IWebview | undefined;
    /**
    * All webviews.
    */
    readonly webviews: Iterable<IWebview>;
    /**
    * Fired when the currently focused webview changes.
    */
    readonly onDidChangeActiveWebview: Event<IWebview | undefined>;
    /**
    * Create a basic webview dom element.
    */
    createWebviewElement(initInfo: WebviewInitInfo): IWebviewElement;
    /**
    * Create a lazily created webview element that is overlaid on top of another element.
    *
    * Allows us to avoid re-parenting the webview (which destroys its contents) when
    * moving webview around the workbench.
    */
    createWebviewOverlay(initInfo: WebviewInitInfo): IOverlayWebview;
}
