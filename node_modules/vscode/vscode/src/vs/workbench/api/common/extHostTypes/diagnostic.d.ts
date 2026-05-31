import { Location } from "./location.js";
import { Range } from "./range.js";
export declare enum DiagnosticTag {
    Unnecessary = 1,
    Deprecated = 2
}
export declare enum DiagnosticSeverity {
    Hint = 3,
    Information = 2,
    Warning = 1,
    Error = 0
}
export declare class DiagnosticRelatedInformation {
    static is(thing: unknown): thing is DiagnosticRelatedInformation;
    location: Location;
    message: string;
    constructor(location: Location, message: string);
    static isEqual(a: DiagnosticRelatedInformation, b: DiagnosticRelatedInformation): boolean;
}
export declare class Diagnostic {
    range: Range;
    message: string;
    severity: DiagnosticSeverity;
    source?: string;
    code?: string | number;
    relatedInformation?: DiagnosticRelatedInformation[];
    tags?: DiagnosticTag[];
    constructor(range: Range, message: string, severity?: DiagnosticSeverity);
    toJSON(): {
        severity: string;
        message: string;
        range: Range;
        source?: string;
        code?: string | number;
    };
    static isEqual(a: Diagnostic | undefined, b: Diagnostic | undefined): boolean;
}
