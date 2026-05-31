import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { ILogService } from "../../../../../../platform/log/common/log.service.js";
import { IChatPlanApprovalAction } from "../../chatService/chatService.js";
import { IChatService } from "../../chatService/chatService.service.js";
import { CountTokensCallback, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolInvocationPreparationContext, IToolResult, ToolProgress } from "../languageModelToolsService.js";
export declare const ReviewPlanToolId = "vscode_reviewPlan";
export interface IReviewPlanParams {
    readonly title?: string;
    readonly plan?: string;
    readonly content: string;
    readonly actions: IChatPlanApprovalAction[];
    readonly canProvideFeedback: boolean;
}
export declare function createReviewPlanToolData(): IToolData;
export declare const ReviewPlanToolData: IToolData;
export declare class ReviewPlanTool extends Disposable implements IToolImpl {
    private readonly chatService;
    private readonly logService;
    constructor(chatService: IChatService, logService: ILogService);
    invoke(invocation: IToolInvocation, _countTokens: CountTokensCallback, _progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
    prepareToolInvocation(context: IToolInvocationPreparationContext, _token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    private toResult;
    private getRequest;
}
