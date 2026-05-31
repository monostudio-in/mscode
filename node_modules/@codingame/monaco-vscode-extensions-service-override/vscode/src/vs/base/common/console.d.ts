import { URI } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
export interface IRemoteConsoleLog {
    type: string;
    severity: string;
    arguments: string;
}
export interface IStackArgument {
    __$stack: string;
}
export interface IStackFrame {
    uri: URI;
    line: number;
    column: number;
}
export declare function isRemoteConsoleLog(obj: unknown): obj is IRemoteConsoleLog;
export declare function parse(entry: IRemoteConsoleLog): {
    args: any[];
    stack?: string;
};
export declare function getFirstFrame(entry: IRemoteConsoleLog): IStackFrame | undefined;
export declare function getFirstFrame(stack: string | undefined): IStackFrame | undefined;
export declare function log(entry: IRemoteConsoleLog, label: string): void;
