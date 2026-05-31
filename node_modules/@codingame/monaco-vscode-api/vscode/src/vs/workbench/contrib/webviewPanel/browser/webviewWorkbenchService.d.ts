import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.service.js";
import { GroupIdentifier } from "../../../common/editor.js";
import { IEditorGroup } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.service.js";
import { ACTIVE_GROUP_TYPE, SIDE_GROUP_TYPE } from "../../../services/editor/common/editorService.js";
import { IEditorService } from "../../../services/editor/common/editorService.service.js";
import { IOverlayWebview, WebviewInitInfo } from "../../webview/browser/webview.js";
import { IWebviewService } from "../../webview/browser/webview.service.js";
import { WebviewIconPath, WebviewInput, WebviewInputInitInfo } from "./webviewEditorInput.js";
import { IWebviewWorkbenchService } from "./webviewWorkbenchService.service.js";
export interface IWebViewShowOptions {
    readonly group?: IEditorGroup | GroupIdentifier | ACTIVE_GROUP_TYPE | SIDE_GROUP_TYPE;
    readonly preserveFocus?: boolean;
}
/**
 * Handles filling in the content of webview before it can be shown to the user.
 */
export interface WebviewResolver {
    /**
     * Returns true if the resolver can resolve the given webview.
     */
    canResolve(webview: WebviewInput): boolean;
    /**
     * Resolves the webview.
     */
    resolveWebview(webview: WebviewInput, token: CancellationToken): Promise<void>;
}
export declare class LazilyResolvedWebviewEditorInput extends WebviewInput {
    private readonly _webviewWorkbenchService;
    private _resolved;
    private _resolvePromise?;
    constructor(init: WebviewInputInitInfo, webview: IOverlayWebview, themeService: IThemeService, _webviewWorkbenchService: IWebviewWorkbenchService);
    dispose(): void;
    resolve(): Promise<IDisposable | null>;
    protected transfer(other: LazilyResolvedWebviewEditorInput): WebviewInput | undefined;
}
export declare class WebviewEditorService extends Disposable implements IWebviewWorkbenchService {
    private readonly _editorService;
    private readonly _instantiationService;
    private readonly _webviewService;
    readonly _serviceBrand: undefined;
    private readonly _revivers;
    private readonly _revivalPool;
    constructor(editorGroupsService: IEditorGroupsService, _editorService: IEditorService, _instantiationService: IInstantiationService, _webviewService: IWebviewService);
    private _activeWebview;
    private readonly _onDidChangeActiveWebviewEditor;
    readonly onDidChangeActiveWebviewEditor: import("../../../../base/common/event.js").Event<WebviewInput | undefined>;
    private getWebviewId;
    private updateActiveWebview;
    openWebview(webviewInitInfo: WebviewInitInfo, viewType: string, title: string, iconPath: WebviewIconPath | undefined, showOptions: IWebViewShowOptions): WebviewInput;
    revealWebview(webview: WebviewInput, group: IEditorGroup | GroupIdentifier | ACTIVE_GROUP_TYPE | SIDE_GROUP_TYPE, preserveFocus: boolean): void;
    private findTopLevelEditorForWebview;
    openRevivedWebview(options: {
        webviewInitInfo: WebviewInitInfo;
        viewType: string;
        title: string;
        iconPath: WebviewIconPath | undefined;
        state: any;
        group: number | undefined;
    }): WebviewInput;
    registerResolver(reviver: WebviewResolver): IDisposable;
    shouldPersist(webview: WebviewInput): boolean;
    private tryRevive;
    resolveWebview(webview: WebviewInput, token: CancellationToken): Promise<void>;
}
