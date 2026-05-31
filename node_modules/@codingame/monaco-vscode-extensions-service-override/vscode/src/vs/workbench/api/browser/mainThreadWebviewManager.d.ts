import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { IInstantiationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/instantiation";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
export declare class MainThreadWebviewManager extends Disposable {
    constructor(context: IExtHostContext, instantiationService: IInstantiationService);
}
