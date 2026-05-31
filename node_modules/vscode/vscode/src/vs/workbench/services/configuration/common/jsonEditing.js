

var JSONEditingErrorCode;
(function (JSONEditingErrorCode) {
    JSONEditingErrorCode[JSONEditingErrorCode["ERROR_INVALID_FILE"] = 0] = "ERROR_INVALID_FILE";
})(JSONEditingErrorCode || (JSONEditingErrorCode = {}));
class JSONEditingError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}

export { JSONEditingError, JSONEditingErrorCode };
