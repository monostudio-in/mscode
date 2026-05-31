import { UriComponents } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { IOpenerService } from "@codingame/monaco-vscode-api/vscode/vs/platform/opener/common/opener.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IOpenUriOptions, MainThreadWindowShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IHostService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/host/browser/host.service";
import { IUserActivityService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/userActivity/common/userActivityService.service";
export declare class MainThreadWindow implements MainThreadWindowShape {
    private readonly hostService;
    private readonly openerService;
    private readonly userActivityService;
    private readonly proxy;
    private readonly disposables;
    constructor(extHostContext: IExtHostContext, hostService: IHostService, openerService: IOpenerService, userActivityService: IUserActivityService);
    dispose(): void;
    registerNativeHandle(): void;
    $getInitialState(): Promise<{
        isFocused: boolean;
        isActive: boolean;
    }>;
    $openUri(uriComponents: UriComponents, uriString: string | undefined, options: IOpenUriOptions): Promise<boolean>;
    $asExternalUri(uriComponents: UriComponents, options: IOpenUriOptions): Promise<UriComponents>;
}
