import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IRemoteAuthorityResolverService } from "@codingame/monaco-vscode-api/vscode/vs/platform/remote/common/remoteAuthorityResolver.service";
import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { IWorkbenchEnvironmentService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/common/environmentService.service";
export declare class MainThreadRemoteConnectionData extends Disposable {
    protected readonly _environmentService: IWorkbenchEnvironmentService;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, _environmentService: IWorkbenchEnvironmentService, remoteAuthorityResolverService: IRemoteAuthorityResolverService);
}
