
import { FileOperationError, FileOperationResult } from '../../../../platform/files/common/files.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { isUndefinedOrNull, areFunctions } from '../../../../base/common/types.js';

var TextFileOperationResult;
(function (TextFileOperationResult) {
    TextFileOperationResult[TextFileOperationResult["FILE_IS_BINARY"] = 0] = "FILE_IS_BINARY";
})(TextFileOperationResult || (TextFileOperationResult = {}));
class TextFileOperationError extends FileOperationError {
    static isTextFileOperationError(obj) {
        return obj instanceof Error && !isUndefinedOrNull(obj.textFileOperationResult);
    }
    constructor(message, textFileOperationResult, options) {
        super(message, FileOperationResult.FILE_OTHER_ERROR);
        this.textFileOperationResult = textFileOperationResult;
        this.options = options;
    }
}
var TextFileEditorModelState;
(function (TextFileEditorModelState) {
    TextFileEditorModelState[TextFileEditorModelState["SAVED"] = 0] = "SAVED";
    TextFileEditorModelState[TextFileEditorModelState["DIRTY"] = 1] = "DIRTY";
    TextFileEditorModelState[TextFileEditorModelState["PENDING_SAVE"] = 2] = "PENDING_SAVE";
    TextFileEditorModelState[TextFileEditorModelState["CONFLICT"] = 3] = "CONFLICT";
    TextFileEditorModelState[TextFileEditorModelState["ORPHAN"] = 4] = "ORPHAN";
    TextFileEditorModelState[TextFileEditorModelState["ERROR"] = 5] = "ERROR";
})(TextFileEditorModelState || (TextFileEditorModelState = {}));
var TextFileResolveReason;
(function (TextFileResolveReason) {
    TextFileResolveReason[TextFileResolveReason["EDITOR"] = 1] = "EDITOR";
    TextFileResolveReason[TextFileResolveReason["REFERENCE"] = 2] = "REFERENCE";
    TextFileResolveReason[TextFileResolveReason["OTHER"] = 3] = "OTHER";
})(TextFileResolveReason || (TextFileResolveReason = {}));
var EncodingMode;
(function (EncodingMode) {
    EncodingMode[EncodingMode["Encode"] = 0] = "Encode";
    EncodingMode[EncodingMode["Decode"] = 1] = "Decode";
})(EncodingMode || (EncodingMode = {}));
function isTextFileEditorModel(model) {
    const candidate = model;
    return areFunctions(candidate.setEncoding, candidate.getEncoding, candidate.save, candidate.revert, candidate.isDirty, candidate.getLanguageId);
}
function stringToSnapshot(value) {
    let done = false;
    return {
        read() {
            if (!done) {
                done = true;
                return value;
            }
            return null;
        }
    };
}
function toBufferOrReadable(value) {
    if (typeof value === 'undefined') {
        return undefined;
    }
    if (typeof value === 'string') {
        return VSBuffer.fromString(value);
    }
    return {
        read: () => {
            const chunk = value.read();
            if (typeof chunk === 'string') {
                return VSBuffer.fromString(chunk);
            }
            return null;
        }
    };
}

export { EncodingMode, TextFileEditorModelState, TextFileOperationError, TextFileOperationResult, TextFileResolveReason, isTextFileEditorModel, stringToSnapshot, toBufferOrReadable };
