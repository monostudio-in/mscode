import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { ILoggerOptions, ILoggerResource, LogLevel } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log";
import { ILoggerService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { MainThreadLoggerShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { UriComponents, UriDto } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
export declare class MainThreadLoggerService implements MainThreadLoggerShape {
    private readonly loggerService;
    private readonly disposables;
    constructor(extHostContext: IExtHostContext, loggerService: ILoggerService);
    $log(file: UriComponents, messages: [
        LogLevel,
        string
    ][]): void;
    $createLogger(file: UriComponents, options?: ILoggerOptions): Promise<void>;
    $registerLogger(logResource: UriDto<ILoggerResource>): Promise<void>;
    $deregisterLogger(resource: UriComponents): Promise<void>;
    $setVisibility(resource: UriComponents, visible: boolean): Promise<void>;
    $flush(file: UriComponents): void;
    dispose(): void;
}
