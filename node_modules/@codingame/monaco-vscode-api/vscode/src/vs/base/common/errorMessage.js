
import { coalesce } from './arrays.js';
import { isString } from './types.js';
import { localize } from '../../nls.js';

function exceptionToErrorMessage(exception, verbose) {
    if (verbose && (exception.stack || exception.stacktrace)) {
        return localize(
            112,
            "{0}: {1}",
            detectSystemErrorMessage(exception),
            stackToString(exception.stack) || stackToString(exception.stacktrace)
        );
    }
    return detectSystemErrorMessage(exception);
}
function stackToString(stack) {
    if (Array.isArray(stack)) {
        return stack.join("\n");
    }
    return stack;
}
function detectSystemErrorMessage(exception) {
    if (exception.code === "ERR_UNC_HOST_NOT_ALLOWED") {
        return `${exception.message}. Please update the 'security.allowedUNCHosts' setting if you want to allow this host.`;
    }
    if (typeof exception.code === "string" && typeof exception.errno === "number" && typeof exception.syscall === "string") {
        return localize(113, "A system error occurred ({0})", exception.message);
    }
    return exception.message || ( localize(114, "An unknown error occurred. Please consult the log for more details."));
}
function toErrorMessage(error = null, verbose = false) {
    if (!error) {
        return localize(114, "An unknown error occurred. Please consult the log for more details.");
    }
    if (Array.isArray(error)) {
        const errors = coalesce(error);
        const msg = toErrorMessage(errors[0], verbose);
        if (errors.length > 1) {
            return localize(115, "{0} ({1} errors in total)", msg, errors.length);
        }
        return msg;
    }
    if (isString(error)) {
        return error;
    }
    if (error.detail) {
        const detail = error.detail;
        if (detail.error) {
            return exceptionToErrorMessage(detail.error, verbose);
        }
        if (detail.exception) {
            return exceptionToErrorMessage(detail.exception, verbose);
        }
    }
    if (error.stack) {
        return exceptionToErrorMessage(error, verbose);
    }
    if (error.message) {
        return error.message;
    }
    return localize(114, "An unknown error occurred. Please consult the log for more details.");
}
function isErrorWithActions(obj) {
    const candidate = obj;
    return candidate instanceof Error && Array.isArray(candidate.actions);
}
function createErrorWithActions(messageOrError, actions) {
    let error;
    if (typeof messageOrError === "string") {
        error = ( new Error(messageOrError));
    } else {
        error = messageOrError;
    }
    error.actions = actions;
    return error;
}

export { createErrorWithActions, isErrorWithActions, toErrorMessage };
