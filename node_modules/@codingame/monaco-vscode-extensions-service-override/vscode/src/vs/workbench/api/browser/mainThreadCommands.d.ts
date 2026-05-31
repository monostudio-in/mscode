import { ICommandService } from "@codingame/monaco-vscode-api/vscode/vs/platform/commands/common/commands.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IExtensionService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions.service";
import { SerializableObjectWithBuffers } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/proxyIdentifier";
import { MainThreadCommandsShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
export declare class MainThreadCommands implements MainThreadCommandsShape {
    private readonly _commandService;
    private readonly _extensionService;
    private readonly _commandRegistrations;
    private readonly _generateCommandsDocumentationRegistration;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, _commandService: ICommandService, _extensionService: IExtensionService);
    dispose(): void;
    private _generateCommandsDocumentation;
    $registerCommand(id: string): void;
    $unregisterCommand(id: string): void;
    $fireCommandActivationEvent(id: string): void;
    $executeCommand<T>(id: string, args: unknown[] | SerializableObjectWithBuffers<unknown[]>, retry: boolean): Promise<T | undefined>;
    $getCommands(): Promise<string[]>;
}
