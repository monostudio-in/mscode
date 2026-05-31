import { Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
import { ILogger, type DidChangeLoggersEvent, type ILoggerOptions, type ILoggerResource, type LogLevel } from "./log.js";
export declare const ILogService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ILogService>;
export interface ILogService extends ILogger {
    readonly _serviceBrand: undefined;
}
export declare const ILoggerService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ILoggerService>;
export interface ILoggerService {
    readonly _serviceBrand: undefined;
    /**
    * Creates a logger for the given resource, or gets one if it already exists.
    *
    * This will also register the logger with the logger service.
    */
    createLogger(resource: URI, options?: ILoggerOptions): ILogger;
    /**
    * Creates a logger with the given id in the logs folder, or gets one if it already exists.
    *
    * This will also register the logger with the logger service.
    */
    createLogger(id: string, options?: Omit<ILoggerOptions, "id">): ILogger;
    /**
    * Gets an existing logger, if any.
    */
    getLogger(resourceOrId: URI | string): ILogger | undefined;
    /**
    * An event which fires when the log level of a logger has changed
    */
    readonly onDidChangeLogLevel: Event<LogLevel | [
        URI,
        LogLevel
    ]>;
    /**
    * Set default log level.
    */
    setLogLevel(level: LogLevel): void;
    /**
    * Set log level for a logger.
    */
    setLogLevel(resource: URI, level: LogLevel): void;
    /**
    * Get log level for a logger or the default log level.
    */
    getLogLevel(resource?: URI): LogLevel;
    /**
    * An event which fires when the visibility of a logger has changed
    */
    readonly onDidChangeVisibility: Event<[
        URI,
        boolean
    ]>;
    /**
    * Set the visibility of a logger.
    */
    setVisibility(resourceOrId: URI | string, visible: boolean): void;
    /**
    * An event which fires when the logger resources are changed
    */
    readonly onDidChangeLoggers: Event<DidChangeLoggersEvent>;
    /**
    * Register a logger with the logger service.
    *
    * Note that this will not create a logger, but only register it.
    *
    * Use `createLogger` to create a logger and register it.
    *
    * Use it when you want to register a logger that is not created by the logger service.
    */
    registerLogger(resource: ILoggerResource): void;
    /**
    * Deregister the logger for the given resource.
    */
    deregisterLogger(idOrResource: URI | string): void;
    /**
    * Get all registered loggers
    */
    getRegisteredLoggers(): Iterable<ILoggerResource>;
    /**
    * Get the registered logger for the given resource.
    */
    getRegisteredLogger(resource: URI): ILoggerResource | undefined;
}
