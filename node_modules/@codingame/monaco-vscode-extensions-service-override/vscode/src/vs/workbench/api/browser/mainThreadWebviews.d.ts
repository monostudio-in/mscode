import { VSBuffer } from "@codingame/monaco-vscode-api/vscode/vs/base/common/buffer";
import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { IOpenerService } from "@codingame/monaco-vscode-api/vscode/vs/platform/opener/common/opener.service";
import { IProductService } from "@codingame/monaco-vscode-api/vscode/vs/platform/product/common/productService.service";
import { IWebview, WebviewContentOptions, WebviewExtensionDescription } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/webview/browser/webview";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import * as extHostProtocol from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
export declare class MainThreadWebviews extends Disposable implements extHostProtocol.MainThreadWebviewsShape {
    private readonly _openerService;
    private readonly _productService;
    private static readonly standardSupportedLinkSchemes;
    private readonly _proxy;
    private readonly _webviews;
    constructor(context: IExtHostContext, _openerService: IOpenerService, _productService: IProductService);
    addWebview(handle: extHostProtocol.WebviewHandle, webview: IWebview, options: {
        serializeBuffersForPostMessage: boolean;
    }): void;
    $setHtml(handle: extHostProtocol.WebviewHandle, value: string): void;
    $setOptions(handle: extHostProtocol.WebviewHandle, options: extHostProtocol.IWebviewContentOptions): void;
    $postMessage(handle: extHostProtocol.WebviewHandle, jsonMessage: string, ...buffers: VSBuffer[]): Promise<boolean>;
    private hookupWebviewEventDelegate;
    private onDidClickLink;
    private isSupportedLink;
    private tryGetWebview;
    private getWebview;
    getWebviewResolvedFailedContent(viewType: string): string;
}
export declare function reviveWebviewExtension(extensionData: extHostProtocol.WebviewExtensionDescription): WebviewExtensionDescription;
export declare function reviveWebviewContentOptions(webviewOptions: extHostProtocol.IWebviewContentOptions): WebviewContentOptions;
