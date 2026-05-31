

class ErrorHandler {
    constructor() {
        this.listeners = [];
        this.unexpectedErrorHandler = function(e) {
            setTimeout(() => {
                if (e.stack) {
                    if (ErrorNoTelemetry.isErrorNoTelemetry(e)) {
                        throw ( new ErrorNoTelemetry(e.message + "\n\n" + e.stack));
                    }
                    throw ( new Error(e.message + "\n\n" + e.stack));
                }
                throw e;
            }, 0);
        };
    }
    addListener(listener) {
        this.listeners.push(listener);
        return () => {
            this._removeListener(listener);
        };
    }
    emit(e) {
        this.listeners.forEach(listener => {
            listener(e);
        });
    }
    _removeListener(listener) {
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }
    setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
        this.unexpectedErrorHandler = newUnexpectedErrorHandler;
    }
    getUnexpectedErrorHandler() {
        return this.unexpectedErrorHandler;
    }
    onUnexpectedError(e) {
        this.unexpectedErrorHandler(e);
        this.emit(e);
    }
    onUnexpectedExternalError(e) {
        this.unexpectedErrorHandler(e);
    }
}
const errorHandler = ( new ErrorHandler());
function setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
    errorHandler.setUnexpectedErrorHandler(newUnexpectedErrorHandler);
}
function onBugIndicatingError(e) {
    errorHandler.onUnexpectedError(e);
    return undefined;
}
function onUnexpectedError(e) {
    if (!isCancellationError(e)) {
        errorHandler.onUnexpectedError(e);
    }
    return undefined;
}
function onUnexpectedExternalError(e) {
    if (!isCancellationError(e)) {
        errorHandler.onUnexpectedExternalError(e);
    }
    return undefined;
}
function transformErrorForSerialization(error) {
    if (error instanceof Error) {
        const {
            name,
            message,
            cause
        } = error;
        const stack = error.stacktrace || error.stack;
        return {
            $isError: true,
            name,
            message,
            stack,
            noTelemetry: ErrorNoTelemetry.isErrorNoTelemetry(error),
            cause: cause ? transformErrorForSerialization(cause) : undefined,
            code: error.code
        };
    }
    return error;
}
function transformErrorFromSerialization(data) {
    let error;
    if (data.noTelemetry) {
        error = ( new ErrorNoTelemetry());
    } else {
        error = ( new Error());
        error.name = data.name;
    }
    error.message = data.message;
    error.stack = data.stack;
    if (data.code) {
        error.code = data.code;
    }
    if (data.cause) {
        error.cause = transformErrorFromSerialization(data.cause);
    }
    return error;
}
const canceledName = "Canceled";
function isCancellationError(error) {
    if (error instanceof CancellationError) {
        return true;
    }
    return error instanceof Error && error.name === canceledName && error.message === canceledName;
}
class CancellationError extends Error {
    constructor() {
        super(canceledName);
        this.name = this.message;
    }
}
class PendingMigrationError extends Error {
    static {
        this._name = "PendingMigrationError";
    }
    static is(error) {
        return error instanceof PendingMigrationError || (error instanceof Error && error.name === PendingMigrationError._name);
    }
    constructor(message) {
        super(message);
        this.name = PendingMigrationError._name;
    }
}
function canceled() {
    const error = ( new Error(canceledName));
    error.name = error.message;
    return error;
}
function illegalArgument(name) {
    if (name) {
        return ( new Error(`Illegal argument: ${name}`));
    } else {
        return ( new Error("Illegal argument"));
    }
}
function illegalState(name) {
    if (name) {
        return ( new Error(`Illegal state: ${name}`));
    } else {
        return ( new Error("Illegal state"));
    }
}
class ReadonlyError extends TypeError {
    constructor(name) {
        super(
            name ? `${name} is read-only and cannot be changed` : "Cannot change read-only property"
        );
    }
}
function getErrorMessage(err) {
    if (!err) {
        return "Error";
    }
    if (err.message) {
        return err.message;
    }
    if (err.stack) {
        return err.stack.split("\n")[0];
    }
    return String(err);
}
class NotImplementedError extends Error {
    constructor(message) {
        super("NotImplemented");
        if (message) {
            this.message = message;
        }
    }
}
class NotSupportedError extends Error {
    constructor(message) {
        super("NotSupported");
        if (message) {
            this.message = message;
        }
    }
}
class ErrorNoTelemetry extends Error {
    constructor(msg) {
        super(msg);
        this.name = "CodeExpectedError";
    }
    static fromError(err) {
        if (err instanceof ErrorNoTelemetry) {
            return err;
        }
        const result = ( new ErrorNoTelemetry());
        result.message = err.message;
        result.stack = err.stack;
        return result;
    }
    static isErrorNoTelemetry(err) {
        return err.name === "CodeExpectedError";
    }
}
class BugIndicatingError extends Error {
    constructor(message) {
        super(message || "An unexpected bug occurred.");
        Object.setPrototypeOf(this, BugIndicatingError.prototype);
    }
}

export { BugIndicatingError, CancellationError, ErrorHandler, ErrorNoTelemetry, NotImplementedError, NotSupportedError, PendingMigrationError, ReadonlyError, canceled, canceledName, errorHandler, getErrorMessage, illegalArgument, illegalState, isCancellationError, onBugIndicatingError, onUnexpectedError, onUnexpectedExternalError, setUnexpectedErrorHandler, transformErrorForSerialization, transformErrorFromSerialization };
