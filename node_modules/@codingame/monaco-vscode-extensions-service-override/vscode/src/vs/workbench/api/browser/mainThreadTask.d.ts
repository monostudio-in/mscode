import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { IWorkspaceContextService } from "@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspace.service";
import { ITaskService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/tasks/common/taskService.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { MainThreadTaskShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { ITaskExecutionDTO, ITaskDTO, ITaskHandleDTO, ITaskFilterDTO, ITaskSystemInfoDTO, ITaskProblemMatcherStarted, ITaskProblemMatcherEnded } from "../common/shared/tasks.js";
import { IConfigurationResolverService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/configurationResolver/common/configurationResolver.service";
export interface ITaskProblemMatcherStartedDto {
    execution: ITaskExecutionDTO;
}
export declare namespace TaskProblemMatcherStartedDto {
    function from(value: ITaskProblemMatcherStarted): ITaskProblemMatcherStartedDto;
}
export interface ITaskProblemMatcherEndedDto {
    execution: ITaskExecutionDTO;
    hasErrors: boolean;
}
export declare namespace TaskProblemMatcherEndedDto {
    function from(value: ITaskProblemMatcherEnded): ITaskProblemMatcherEndedDto;
}
export declare class MainThreadTask extends Disposable implements MainThreadTaskShape {
    private readonly _taskService;
    private readonly _workspaceContextServer;
    private readonly _configurationResolverService;
    private readonly _extHostContext;
    private readonly _proxy;
    private readonly _providers;
    constructor(extHostContext: IExtHostContext, _taskService: ITaskService, _workspaceContextServer: IWorkspaceContextService, _configurationResolverService: IConfigurationResolverService);
    dispose(): void;
    $createTaskId(taskDTO: ITaskDTO): Promise<string>;
    $registerTaskProvider(handle: number, type: string): Promise<void>;
    $unregisterTaskProvider(handle: number): Promise<void>;
    $fetchTasks(filter?: ITaskFilterDTO): Promise<ITaskDTO[]>;
    private getWorkspace;
    $getTaskExecution(value: ITaskHandleDTO | ITaskDTO): Promise<ITaskExecutionDTO>;
    $executeTask(value: ITaskHandleDTO | ITaskDTO): Promise<ITaskExecutionDTO>;
    $customExecutionComplete(id: string, result?: number): Promise<void>;
    $terminateTask(id: string): Promise<void>;
    $registerTaskSystem(key: string, info: ITaskSystemInfoDTO): void;
    $registerSupportedExecutions(custom?: boolean, shell?: boolean, process?: boolean): Promise<void>;
}
