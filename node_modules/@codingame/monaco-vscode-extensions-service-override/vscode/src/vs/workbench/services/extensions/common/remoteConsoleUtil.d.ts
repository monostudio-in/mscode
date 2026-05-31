import { IRemoteConsoleLog } from "../../../../base/common/console.js";
import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
export declare function logRemoteEntry(logService: ILogService, entry: IRemoteConsoleLog, label?: string | null): void;
export declare function logRemoteEntryIfError(logService: ILogService, entry: IRemoteConsoleLog, label: string): void;
