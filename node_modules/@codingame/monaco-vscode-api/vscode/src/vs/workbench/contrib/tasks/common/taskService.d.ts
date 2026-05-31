import { IStringDictionary } from "../../../../base/common/collections.js";
import type { SingleOrMany } from "../../../../base/common/types.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IWorkspaceFolder } from "../../../../platform/workspace/common/workspace.js";
import { ConfiguringTask, ContributedTask, ITaskSet } from "./tasks.js";
export type { Task } from "./tasks.js";
export type { ITaskSummary, ITaskTerminateResponse as TaskTerminateResponse } from "@codingame/monaco-vscode-task-service-override/vscode/vs/workbench/contrib/tasks/common/taskSystem";
export declare const CustomExecutionSupportedContext: RawContextKey<boolean>;
export declare const ShellExecutionSupportedContext: RawContextKey<boolean>;
export declare const TaskCommandsRegistered: RawContextKey<boolean>;
export declare const ProcessExecutionSupportedContext: RawContextKey<boolean>;
export declare const ServerlessWebContext: RawContextKey<boolean>;
export declare const TasksAvailableContext: RawContextKey<boolean>;
export declare const TaskExecutionSupportedContext: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
export interface ITaskProvider {
    provideTasks(validTypes: IStringDictionary<boolean>): Promise<ITaskSet>;
    resolveTask(task: ConfiguringTask): Promise<ContributedTask | undefined>;
}
export interface IProblemMatcherRunOptions {
    attachProblemMatcher?: boolean;
}
export interface ICustomizationProperties {
    group?: string | {
        kind?: string;
        isDefault?: boolean;
    };
    problemMatcher?: SingleOrMany<string>;
    isBackground?: boolean;
    color?: string;
    icon?: string;
    inAgents?: boolean;
}
export interface ITaskFilter {
    version?: string;
    type?: string;
    task?: string;
}
interface IWorkspaceTaskResult {
    set: ITaskSet | undefined;
    configurations: {
        byIdentifier: IStringDictionary<ConfiguringTask>;
    } | undefined;
    hasErrors: boolean;
}
export interface IWorkspaceFolderTaskResult extends IWorkspaceTaskResult {
    workspaceFolder: IWorkspaceFolder;
}
export interface ITaskTerminalStatus {
    terminalId: number;
    status: string;
}
