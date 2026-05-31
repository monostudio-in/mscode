import { MainThreadUrlsShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IURLService } from "@codingame/monaco-vscode-api/vscode/vs/platform/url/common/url.service";
import { URI, UriComponents } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { IExtensionUrlHandler } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/browser/extensionUrlHandler.service";
import { ExtensionIdentifier } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensions/common/extensions";
import { ITrustedDomainService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/url/browser/trustedDomainService";
export declare class MainThreadUrls extends Disposable implements MainThreadUrlsShape {
    private readonly urlService;
    private readonly extensionUrlHandler;
    private readonly proxy;
    private readonly handlers;
    constructor(context: IExtHostContext, trustedDomainService: ITrustedDomainService, urlService: IURLService, extensionUrlHandler: IExtensionUrlHandler);
    $registerUriHandler(handle: number, extensionId: ExtensionIdentifier, extensionDisplayName: string): Promise<void>;
    $unregisterUriHandler(handle: number): Promise<void>;
    $createAppUri(uri: UriComponents): Promise<URI>;
    dispose(): void;
}
