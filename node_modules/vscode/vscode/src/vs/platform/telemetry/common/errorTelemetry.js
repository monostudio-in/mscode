
import { binarySearch } from '../../../base/common/arrays.js';
import { errorHandler, ErrorNoTelemetry, PendingMigrationError } from '../../../base/common/errors.js';
import { ListenerLeakError } from '../../../base/common/event.js';
import { DisposableStore, toDisposable } from '../../../base/common/lifecycle.js';
import { safeStringify } from '../../../base/common/objects.js';
import { FileOperationError } from '../../files/common/files.js';

var ErrorEvent;
(function(ErrorEvent) {
    function compare(a, b) {
        if (a.callstack < b.callstack) {
            return -1;
        } else if (a.callstack > b.callstack) {
            return 1;
        }
        return 0;
    }
    ErrorEvent.compare = compare;
})(ErrorEvent || (ErrorEvent = {}));
function packErrorForTelemetry(err) {
    if (!err || typeof err !== "object") {
        return {
            callstack: undefined,
            msg: safeStringify(err)
        };
    }
    const callstack = Array.isArray(err.stack) ? err.stack.join("\n") : err.stack;
    const msg = err.message ? err.message : safeStringify(err);
    return {
        callstack,
        msg
    };
}
class BaseErrorTelemetry {
    static {
        this.ERROR_FLUSH_TIMEOUT = 5 * 1000;
    }
    constructor(telemetryService, flushDelay = BaseErrorTelemetry.ERROR_FLUSH_TIMEOUT) {
        this._flushHandle = undefined;
        this._buffer = [];
        this._disposables = ( new DisposableStore());
        this._telemetryService = telemetryService;
        this._flushDelay = flushDelay;
        const unbind = errorHandler.addListener(err => this._onErrorEvent(err));
        this._disposables.add(toDisposable(unbind));
        this.installErrorListeners();
    }
    dispose() {
        clearTimeout(this._flushHandle);
        this._flushBuffer();
        this._disposables.dispose();
    }
    installErrorListeners() {}
    _onErrorEvent(err) {
        if (!err || err.code) {
            return;
        }
        if (err.detail && err.detail.stack) {
            err = err.detail;
        }
        if (ErrorNoTelemetry.isErrorNoTelemetry(err) || err instanceof FileOperationError || PendingMigrationError.is(err) || (typeof err?.message === "string" && err.message.includes("Unable to read file"))) {
            return;
        }
        const {
            callstack,
            msg
        } = packErrorForTelemetry(err);
        if (!callstack) {
            return;
        }
        const errorEvent = {
            msg,
            callstack
        };
        if (ListenerLeakError.is(err)) {
            errorEvent.kind = err.kind;
            errorEvent.listenerCount = err.listenerCount;
        }
        this._enqueue(errorEvent);
    }
    _enqueue(e) {
        const idx = binarySearch(this._buffer, e, ErrorEvent.compare);
        if (idx < 0) {
            e.count = 1;
            this._buffer.splice(~idx, 0, e);
        } else {
            if (!this._buffer[idx].count) {
                this._buffer[idx].count = 0;
            }
            this._buffer[idx].count += 1;
        }
        if (this._flushHandle === undefined) {
            this._flushHandle = setTimeout(() => {
                this._flushBuffer();
                this._flushHandle = undefined;
            }, this._flushDelay);
        }
    }
    _flushBuffer() {
        for (const error of this._buffer) {
            this._telemetryService.publicLogError2("UnhandledError", error);
        }
        this._buffer.length = 0;
    }
}

export { ErrorEvent, BaseErrorTelemetry as default, packErrorForTelemetry };
