import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { GroupIdentifier } from "../../../common/editor.js";
import { IEditorGroup } from "../../../services/editor/common/editorGroupsService.js";
import { ACTIVE_GROUP_TYPE, SIDE_GROUP_TYPE } from "../../../services/editor/common/editorService.js";
import { WebviewInitInfo } from "../../webview/browser/webview.js";
import { WebviewInput, WebviewIconPath } from "./webviewEditorInput.js";
import { IWebViewShowOptions, WebviewResolver } from "./webviewWorkbenchService.js";
export declare const IWebviewWorkbenchService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWebviewWorkbenchService>;
/**
* Service responsible for showing and managing webview editors in the workbench.
*/
export interface IWebviewWorkbenchService {
    readonly _serviceBrand: undefined;
    /**
    * Event fired when focus switches to a different webview editor.
    *
    * Fires `undefined` if focus switches to a non-webview editor.
    */
    readonly onDidChangeActiveWebviewEditor: Event<WebviewInput | undefined>;
    /**
    * Create a new webview editor and open it in the workbench.
    */
    openWebview(webviewInitInfo: WebviewInitInfo, viewType: string, title: string, iconPath: WebviewIconPath | undefined, showOptions: IWebViewShowOptions): WebviewInput;
    /**
    * Open a webview that is being restored from serialization.
    */
    openRevivedWebview(options: {
        webviewInitInfo: WebviewInitInfo;
        viewType: string;
        title: string;
        iconPath: WebviewIconPath | undefined;
        state: any;
        group: number | undefined;
    }): WebviewInput;
    /**
    * Reveal an already opened webview editor in the workbench.
    */
    revealWebview(webview: WebviewInput, group: IEditorGroup | GroupIdentifier | ACTIVE_GROUP_TYPE | SIDE_GROUP_TYPE, preserveFocus: boolean): void;
    /**
    * Register a new {@link WebviewResolver}.
    *
    * If there are any webviews awaiting revival that this resolver can handle, they will be resolved by it.
    */
    registerResolver(resolver: WebviewResolver): IDisposable;
    /**
    * Check if a webview should be serialized across window reloads.
    */
    shouldPersist(input: WebviewInput): boolean;
    /**
    * Try to resolve a webview. This will block until a resolver is registered for the webview.
    */
    resolveWebview(webview: WebviewInput, token: CancellationToken): Promise<void>;
}
