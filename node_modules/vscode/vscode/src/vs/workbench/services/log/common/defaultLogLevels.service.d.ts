import { Event } from "../../../../base/common/event.js";
import { LogLevel } from "../../../../platform/log/common/log.js";
import { DefaultLogLevels } from "@codingame/monaco-vscode-log-service-override/vscode/vs/workbench/services/log/common/defaultLogLevels";
export declare const IDefaultLogLevelsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IDefaultLogLevelsService>;
export interface IDefaultLogLevelsService {
    readonly _serviceBrand: undefined;
    readonly defaultLogLevels: DefaultLogLevels;
    readonly onDidChangeDefaultLogLevels: Event<DefaultLogLevels>;
    getDefaultLogLevel(extensionId?: string): LogLevel;
    setDefaultLogLevel(logLevel: LogLevel, extensionId?: string): Promise<void>;
}
