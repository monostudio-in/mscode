import { DisposableStore } from "../../../base/common/lifecycle.js";
import { ITelemetryService } from "./telemetry.service.js";
export type ErrorEventFragment = {
    owner: "lramos15, sbatten";
    comment: "Whenever an error in VS Code is thrown.";
    callstack: {
        classification: "CallstackOrException";
        purpose: "PerformanceAndHealth";
        comment: "The callstack of the error.";
    };
    msg?: {
        classification: "CallstackOrException";
        purpose: "PerformanceAndHealth";
        comment: "The message of the error. Normally the first line int the callstack.";
    };
    file?: {
        classification: "CallstackOrException";
        purpose: "PerformanceAndHealth";
        comment: "The file the error originated from.";
    };
    line?: {
        classification: "CallstackOrException";
        purpose: "PerformanceAndHealth";
        comment: "The line the error originate on.";
    };
    column?: {
        classification: "CallstackOrException";
        purpose: "PerformanceAndHealth";
        comment: "The column of the line which the error orginated on.";
    };
    uncaught_error_name?: {
        classification: "CallstackOrException";
        purpose: "PerformanceAndHealth";
        comment: "If the error is uncaught what is the error type";
    };
    uncaught_error_msg?: {
        classification: "CallstackOrException";
        purpose: "PerformanceAndHealth";
        comment: "If the error is uncaught this is just msg but for uncaught errors.";
    };
    count?: {
        classification: "CallstackOrException";
        purpose: "PerformanceAndHealth";
        comment: "How many times this error has been thrown";
    };
};
export interface ErrorEvent {
    callstack: string;
    msg?: string;
    file?: string;
    line?: number;
    column?: number;
    uncaught_error_name?: string;
    uncaught_error_msg?: string;
    count?: number;
}
export declare namespace ErrorEvent {
    function compare(a: ErrorEvent, b: ErrorEvent): 1 | 0 | -1;
}
/**
 * Extracts a callstack and message from an error object for telemetry.
 * Handles the `Array.isArray(err.stack)` workaround from workerServer.ts
 * and falls back to {@link safeStringify} when no message is available.
 */
export declare function packErrorForTelemetry(err: any): {
    callstack: string | undefined;
    msg: string;
};
export default abstract class BaseErrorTelemetry {
    static ERROR_FLUSH_TIMEOUT: number;
    private _telemetryService;
    private _flushDelay;
    private _flushHandle;
    private _buffer;
    protected readonly _disposables: DisposableStore;
    constructor(telemetryService: ITelemetryService, flushDelay?: number);
    dispose(): void;
    protected installErrorListeners(): void;
    private _onErrorEvent;
    protected _enqueue(e: ErrorEvent): void;
    private _flushBuffer;
}
