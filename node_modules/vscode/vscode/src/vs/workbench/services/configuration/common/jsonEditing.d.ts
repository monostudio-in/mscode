import { JSONPath } from "../../../../base/common/json.js";
export declare enum JSONEditingErrorCode {
    /**
     * Error when trying to write to a file that contains JSON errors.
     */
    ERROR_INVALID_FILE = 0
}
export declare class JSONEditingError extends Error {
    code: JSONEditingErrorCode;
    constructor(message: string, code: JSONEditingErrorCode);
}
export interface IJSONValue {
    path: JSONPath;
    value: unknown;
}
