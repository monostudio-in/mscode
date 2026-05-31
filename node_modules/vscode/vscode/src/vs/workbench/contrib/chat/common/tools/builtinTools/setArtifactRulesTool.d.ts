import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { IToolData, IToolImpl, IToolInvocation, IToolResult, IToolInvocationPreparationContext, IPreparedToolInvocation } from "../languageModelToolsService.js";
import { IChatArtifactsService } from "../chatArtifactsService.service.js";
export declare const SetArtifactRulesToolId = "setArtifactRules";
export declare const SetArtifactRulesToolData: IToolData;
export declare class SetArtifactRulesTool implements IToolImpl {
    private readonly _chatArtifactsService;
    constructor(_chatArtifactsService: IChatArtifactsService);
    prepareToolInvocation(_context: IToolInvocationPreparationContext, _token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    invoke(invocation: IToolInvocation, _countTokens: never, _progress: never, _token: CancellationToken): Promise<IToolResult>;
}
