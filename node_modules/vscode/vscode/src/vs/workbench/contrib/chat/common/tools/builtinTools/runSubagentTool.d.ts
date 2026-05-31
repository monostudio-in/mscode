import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { Event } from "../../../../../../base/common/event.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.service.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../../../platform/log/common/log.service.js";
import { IProductService } from "../../../../../../platform/product/common/productService.service.js";
import { IChatService } from "../../chatService/chatService.service.js";
import { ILanguageModelsService } from "../../languageModels.service.js";
import { IChatAgentService } from "../../participants/chatAgents.service.js";
import { IPromptsService } from "../../promptSyntax/service/promptsService.service.js";
import { CountTokensCallback, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolInvocationPreparationContext, IToolResult, ToolProgress } from "../languageModelToolsService.js";
import { ILanguageModelToolsService } from "../languageModelToolsService.service.js";
export interface IRunSubagentToolInputParams {
    prompt: string;
    description: string;
    agentName?: string;
    model?: string;
}
export declare const RUN_SUBAGENT_MAX_NESTING_DEPTH = 5;
export declare class RunSubagentTool extends Disposable implements IToolImpl {
    private readonly chatAgentService;
    private readonly chatService;
    private readonly languageModelToolsService;
    private readonly languageModelsService;
    private readonly logService;
    private readonly configurationService;
    private readonly promptsService;
    private readonly instantiationService;
    private readonly productService;
    static readonly Id = "runSubagent";
    private readonly _onDidUpdateToolData;
    readonly onDidUpdateToolData: Event<void>;
    /** Hack to port data between prepare/invoke */
    private readonly _resolvedModels;
    /** Tracks the current subagent nesting depth per session to detect and limit recursion. */
    private readonly _sessionDepth;
    constructor(chatAgentService: IChatAgentService, chatService: IChatService, languageModelToolsService: ILanguageModelToolsService, languageModelsService: ILanguageModelsService, logService: ILogService, configurationService: IConfigurationService, promptsService: IPromptsService, instantiationService: IInstantiationService, productService: IProductService);
    getToolData(): IToolData;
    invoke(invocation: IToolInvocation, _countTokens: CountTokensCallback, _progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
    private getSubAgentByName;
    /**
     * Checks if a model exceeds the main model's cost tier based on multiplier.
     * @returns An object with `exceeds: true` and a reason string if blocked, or `exceeds: false` if allowed.
     */
    private checkMultiplierConstraint;
    /**
     * Returns information about available models for error messages.
     * Includes which models are unavailable due to multiplier restrictions.
     */
    private getAvailableModelsInfo;
    /**
     * Resolves the model to be used by a subagent.
     * @param explicitModelQualifiedName Optional explicit model specified by the caller.
     *        If provided and not found or not allowed, throws an error with available models.
     * @throws Error if the requested model is not found or exceeds the main model's cost tier.
     */
    private resolveSubagentModel;
    prepareToolInvocation(context: IToolInvocationPreparationContext, _token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
}
