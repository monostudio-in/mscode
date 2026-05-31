import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { IToolData, IToolImpl, IToolInvocation, IToolResult, IToolInvocationPreparationContext, IPreparedToolInvocation } from "../languageModelToolsService.js";
import { ILogService } from "../../../../../../platform/log/common/log.service.js";
import { ITelemetryService } from "../../../../../../platform/telemetry/common/telemetry.service.js";
import { IChatTodoListService } from "../chatTodoListService.service.js";
export declare const ManageTodoListToolToolId = "manage_todo_list";
export declare function createManageTodoListToolData(): IToolData;
export declare const ManageTodoListToolData: IToolData;
export declare class ManageTodoListTool extends Disposable implements IToolImpl {
    private readonly chatTodoListService;
    private readonly logService;
    private readonly telemetryService;
    constructor(chatTodoListService: IChatTodoListService, logService: ILogService, telemetryService: ITelemetryService);
    invoke(invocation: IToolInvocation, _countTokens: any, _progress: any, _token: CancellationToken): Promise<IToolResult>;
    prepareToolInvocation(context: IToolInvocationPreparationContext, _token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    private generatePastTenseMessage;
    private handleRead;
    private handleReadOperation;
    private handleWriteOperation;
    private calculateStatusCounts;
    private formatTodoListAsMarkdownTaskList;
    private calculateTodoChanges;
}
