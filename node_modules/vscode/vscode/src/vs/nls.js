

function getNLSMessages() {
    return globalThis._VSCODE_NLS_MESSAGES;
}
function getNLSLanguage() {
    return globalThis._VSCODE_NLS_LANGUAGE;
}
const isPseudo = getNLSLanguage() === "pseudo" || (typeof document !== "undefined" && document.location && typeof document.location.hash === "string" && document.location.hash.indexOf("pseudo=true") >= 0);
function _format(message, args) {
    let result;
    if (args.length === 0) {
        result = message;
    } else {
        result = message.replace(/\{(\d+)\}/g, (match, rest) => {
            const index = rest[0];
            const arg = args[index];
            let result = match;
            if (typeof arg === "string") {
                result = arg;
            } else if (typeof arg === "number" || typeof arg === "boolean" || arg === void 0 || arg === null) {
                result = String(arg);
            }
            return result;
        });
    }
    if (isPseudo) {
        result = "［" + result.replace(/[aouei]/g, "$&$&") + "］";
    }
    return result;
}
let initialized = false;
function isInitialized() {
    return initialized;
}
function localize(data , message , ...args) {
    if (typeof data === "number") {
        return _format(lookupMessage(data, message), args);
    }
    return _format(message, args);
}
function lookupMessage(index, fallback) {
    initialized = true;
    const message = getNLSMessages()?.[index];
    if (typeof message !== "string") {
        if (typeof fallback === "string") {
            return fallback;
        }
        throw ( new Error(`!!! NLS MISSING: ${index} !!!`));
    }
    return message;
}
function localize2(data , originalMessage, ...args) {
    let message;
    if (typeof data === "number") {
        message = lookupMessage(data, originalMessage);
    } else {
        message = originalMessage;
    }
    const value = _format(message, args);
    return {
        value,
        original: originalMessage === message ? value : _format(originalMessage, args)
    };
}

export { getNLSLanguage, getNLSMessages, isInitialized, localize, localize2 };
