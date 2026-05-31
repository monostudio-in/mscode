import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { IMeteredConnectionService } from "@codingame/monaco-vscode-api/vscode/vs/platform/meteredConnection/common/meteredConnection.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { MainThreadMeteredConnectionShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
export declare class MainThreadMeteredConnection extends Disposable implements MainThreadMeteredConnectionShape {
    private readonly meteredConnectionService;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, meteredConnectionService: IMeteredConnectionService);
}
