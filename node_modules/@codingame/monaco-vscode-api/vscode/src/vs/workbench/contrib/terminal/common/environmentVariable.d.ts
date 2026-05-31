import { EnvironmentVariableScope, IEnvironmentVariableCollection } from "@codingame/monaco-vscode-xterm-common/vscode/vs/platform/terminal/common/environmentVariable";
import { ITerminalStatus } from "./terminal.js";
export interface IEnvironmentVariableCollectionWithPersistence extends IEnvironmentVariableCollection {
    readonly persistent: boolean;
}
export interface IEnvironmentVariableInfo {
    readonly requiresAction: boolean;
    getStatus(scope: EnvironmentVariableScope | undefined): ITerminalStatus;
}
