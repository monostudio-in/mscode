import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { MainThreadSecretStateShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { ISecretStorageService } from "@codingame/monaco-vscode-api/vscode/vs/platform/secrets/common/secrets.service";
import { IBrowserWorkbenchEnvironmentService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/browser/environmentService.service";
export declare class MainThreadSecretState extends Disposable implements MainThreadSecretStateShape {
    private readonly secretStorageService;
    private readonly logService;
    private readonly _proxy;
    private readonly _sequencer;
    constructor(extHostContext: IExtHostContext, secretStorageService: ISecretStorageService, logService: ILogService, environmentService: IBrowserWorkbenchEnvironmentService);
    $getPassword(extensionId: string, key: string): Promise<string | undefined>;
    private doGetPassword;
    $setPassword(extensionId: string, key: string, value: string): Promise<void>;
    private doSetPassword;
    $deletePassword(extensionId: string, key: string): Promise<void>;
    private doDeletePassword;
    $getKeys(extensionId: string): Promise<string[]>;
    private doGetKeys;
    private getKey;
    private parseKey;
}
