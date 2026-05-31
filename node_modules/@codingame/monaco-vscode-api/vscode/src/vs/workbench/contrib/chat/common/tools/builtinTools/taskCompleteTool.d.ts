import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolInvocationPreparationContext, IToolResult, ToolProgress, CountTokensCallback } from "../languageModelToolsService.js";
export declare const TaskCompleteToolId = "task_complete";
/**
 * Message sent to the agent when the session goes idle without task completion.
 */
export declare const AUTOPILOT_CONTINUATION_MESSAGE: string;
export declare const TaskCompleteToolData: IToolData;
export declare class TaskCompleteTool implements IToolImpl {
    prepareToolInvocation(_context: IToolInvocationPreparationContext, _token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    invoke(invocation: IToolInvocation, _countTokens: CountTokensCallback, _progress: ToolProgress, _token: CancellationToken): Promise<IToolResult>;
}
