import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IWebviewViewResolver, WebviewView } from "@codingame/monaco-vscode-view-common-service-override/vscode/vs/workbench/contrib/webviewView/browser/webviewViewService";
export declare const IWebviewViewService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWebviewViewService>;
export interface IWebviewViewService {
    readonly _serviceBrand: undefined;
    /**
    * Fired when a resolver has been registered
    */
    readonly onNewResolverRegistered: Event<{
        readonly viewType: string;
    }>;
    /**
    * Register a new {@link IWebviewViewResolver webview view resolver}.
    */
    register(viewType: string, resolver: IWebviewViewResolver): IDisposable;
    /**
    * Try to resolve a webview view. The promise will not resolve until a resolver for the webview has been registered
    * and run
    */
    resolve(viewType: string, webview: WebviewView, cancellation: CancellationToken): Promise<void>;
}
