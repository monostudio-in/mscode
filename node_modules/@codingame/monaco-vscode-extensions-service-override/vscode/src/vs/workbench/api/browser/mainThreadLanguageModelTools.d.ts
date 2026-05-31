import { CancellationToken } from "@codingame/monaco-vscode-api/vscode/vs/base/common/cancellation";
import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { ExtensionIdentifier } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensions/common/extensions";
import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { IProductService } from "@codingame/monaco-vscode-api/vscode/vs/platform/product/common/productService.service";
import { IToolInvocation, IToolProgressStep, IToolResult } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/chat/common/tools/languageModelToolsService";
import { ILanguageModelToolsService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/chat/common/tools/languageModelToolsService.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { Dto, SerializableObjectWithBuffers } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/proxyIdentifier";
import { IToolDataDto, IToolDefinitionDto, MainThreadLanguageModelToolsShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
export declare class MainThreadLanguageModelTools extends Disposable implements MainThreadLanguageModelToolsShape {
    private readonly _languageModelToolsService;
    private readonly _logService;
    private readonly _productService;
    private readonly _proxy;
    private readonly _tools;
    private readonly _runningToolCalls;
    constructor(extHostContext: IExtHostContext, _languageModelToolsService: ILanguageModelToolsService, _logService: ILogService, _productService: IProductService);
    private getToolDtos;
    $getTools(): Promise<IToolDataDto[]>;
    $invokeTool(dto: Dto<IToolInvocation>, token?: CancellationToken): Promise<Dto<IToolResult> | SerializableObjectWithBuffers<Dto<IToolResult>>>;
    $acceptToolProgress(callId: string, progress: IToolProgressStep): void;
    $countTokensForInvocation(callId: string, input: string, token: CancellationToken): Promise<number>;
    $registerTool(id: string, hasHandleToolStream: boolean): void;
    $registerToolWithDefinition(extensionId: ExtensionIdentifier, definition: IToolDefinitionDto, hasHandleToolStream: boolean): void;
    $unregisterTool(name: string): void;
}
