import { Disposable } from "../../../base/common/lifecycle.js";
import { Event } from "../../../base/common/event.js";
import { ILogger, LogLevel } from "./log.js";
import { ILogService } from "./log.service.js";
export declare class LogService extends Disposable implements ILogService {
    readonly _serviceBrand: undefined;
    private readonly logger;
    constructor(primaryLogger: ILogger, otherLoggers?: ILogger[]);
    get onDidChangeLogLevel(): Event<LogLevel>;
    setLevel(level: LogLevel): void;
    getLevel(): LogLevel;
    trace(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string | Error, ...args: unknown[]): void;
    flush(): void;
}
