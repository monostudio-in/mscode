import type * as vscode from "vscode";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { IPreparedToolInvocation, IStreamedToolInvocation, IToolInvocation, IToolInvocationPreparationContext, IToolInvocationStreamContext, IToolResult } from "../../contrib/chat/common/tools/languageModelToolsService.js";
import { Dto, SerializableObjectWithBuffers } from "../../services/extensions/common/proxyIdentifier.js";
import { ExtHostLanguageModelToolsShape, IMainContext, IToolDataDto } from "./extHost.protocol.js";
import { ExtHostLanguageModels } from "./extHostLanguageModels.js";
export declare class ExtHostLanguageModelTools implements ExtHostLanguageModelToolsShape {
    private readonly _languageModels;
    /** A map of tools that were registered in this EH */
    private readonly _registeredTools;
    private readonly _proxy;
    private readonly _tokenCountFuncs;
    /** A map of all known tools, from other EHs or registered in vscode core */
    private readonly _allTools;
    constructor(mainContext: IMainContext, _languageModels: ExtHostLanguageModels);
    $countTokensForInvocation(callId: string, input: string, token: CancellationToken): Promise<number>;
    invokeTool(extension: IExtensionDescription, toolIdOrInfo: string | vscode.LanguageModelToolInformation, options: vscode.LanguageModelToolInvocationOptions<any>, token?: CancellationToken): Promise<vscode.LanguageModelToolResult>;
    $onDidChangeTools(tools: IToolDataDto[]): void;
    getTools(extension: IExtensionDescription): vscode.LanguageModelToolInformation[];
    $invokeTool(dto: Dto<IToolInvocation>, token: CancellationToken): Promise<Dto<IToolResult> | SerializableObjectWithBuffers<Dto<IToolResult>>>;
    private getModel;
    $handleToolStream(toolId: string, context: IToolInvocationStreamContext, token: CancellationToken): Promise<IStreamedToolInvocation | undefined>;
    $prepareToolInvocation(toolId: string, context: IToolInvocationPreparationContext, token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    registerTool(extension: IExtensionDescription, id: string, tool: vscode.LanguageModelTool<any>): IDisposable;
    registerToolDefinition(extension: IExtensionDescription, definition: vscode.LanguageModelToolDefinition, tool: vscode.LanguageModelTool<any>): IDisposable;
}
