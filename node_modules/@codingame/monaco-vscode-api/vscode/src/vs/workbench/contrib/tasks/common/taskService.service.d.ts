import { Action } from "../../../../base/common/actions.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { SingleOrMany } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { IMarkerData } from "../../../../platform/markers/common/markers.js";
import { IWorkspace, IWorkspaceFolder } from "../../../../platform/workspace/common/workspace.js";
import { ITaskEvent, Task, TaskRunSource, ConfiguringTask, ITaskIdentifier, TaskSorter, ContributedTask, CustomTask } from "./tasks.js";
import { IProblemMatcherRunOptions, ITaskFilter, IWorkspaceFolderTaskResult, ITaskProvider } from "./taskService.js";
import { ITaskSummary, ITaskTerminateResponse, ITaskSystemInfo } from "@codingame/monaco-vscode-task-service-override/vscode/vs/workbench/contrib/tasks/common/taskSystem";
export declare const ITaskService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITaskService>;
export interface ITaskService {
    readonly _serviceBrand: undefined;
    readonly onDidStateChange: Event<ITaskEvent>;
    /** Fired when task providers are registered or unregistered */
    readonly onDidChangeTaskProviders: Event<void>;
    isReconnected: boolean;
    readonly onDidReconnectToTasks: Event<void>;
    supportsMultipleTaskExecutions: boolean;
    configureAction(): Action;
    run(task: Task | undefined, options?: IProblemMatcherRunOptions, runSource?: TaskRunSource): Promise<ITaskSummary | undefined>;
    inTerminal(): boolean;
    getActiveTasks(): Promise<Task[]>;
    getBusyTasks(): Promise<Task[]>;
    terminate(task: Task): Promise<ITaskTerminateResponse>;
    tasks(filter?: ITaskFilter): Promise<Task[]>;
    rerun(terminalInstanceId: number): void;
    /**
    * Gets tasks currently known to the task system. Unlike {@link tasks},
    * this does not activate extensions or prompt for workspace trust.
    */
    getKnownTasks(filter?: ITaskFilter): Promise<Task[]>;
    taskTypes(): string[];
    getWorkspaceTasks(runSource?: TaskRunSource): Promise<Map<string, IWorkspaceFolderTaskResult>>;
    getSavedTasks(type: "persistent" | "historical"): Promise<(Task | ConfiguringTask)[]>;
    removeRecentlyUsedTask(taskRecentlyUsedKey: string): void;
    getTerminalsForTasks(tasks: SingleOrMany<Task>): URI[] | undefined;
    getTaskProblems(instanceId: number): Map<string, {
        resources: URI[];
        markers: IMarkerData[];
    }> | undefined;
    /**
    * @param alias The task's name, label or defined identifier.
    */
    getTask(workspaceFolder: IWorkspace | IWorkspaceFolder | string, alias: string | ITaskIdentifier, compareId?: boolean): Promise<Task | undefined>;
    tryResolveTask(configuringTask: ConfiguringTask): Promise<Task | undefined>;
    createSorter(): TaskSorter;
    getTaskDescription(task: Task | ConfiguringTask): string | undefined;
    customize(task: ContributedTask | CustomTask | ConfiguringTask, properties?: {}, openConfig?: boolean): Promise<void>;
    openConfig(task: CustomTask | ConfiguringTask | undefined): Promise<boolean>;
    registerTaskProvider(taskProvider: ITaskProvider, type: string): IDisposable;
    registerTaskSystem(scheme: string, taskSystemInfo: ITaskSystemInfo): void;
    readonly onDidChangeTaskSystemInfo: Event<void>;
    readonly onDidChangeTaskConfig: Event<void>;
    readonly hasTaskSystemInfo: boolean;
    registerSupportedExecutions(custom?: boolean, shell?: boolean, process?: boolean): void;
    extensionCallbackTaskComplete(task: Task, result: number | undefined): Promise<void>;
}
