
import { __decorate } from '../../../../../../../external/tslib/tslib.es6.js';
import { equals } from '../../../../base/common/arrays.js';
import { URI } from '../../../../base/common/uri.js';
import { es5ClassCompat } from './es5ClassCompat.js';
import { Range } from './range.js';

var DiagnosticTag;
(function(DiagnosticTag) {
    DiagnosticTag[DiagnosticTag["Unnecessary"] = 1] = "Unnecessary";
    DiagnosticTag[DiagnosticTag["Deprecated"] = 2] = "Deprecated";
})(DiagnosticTag || (DiagnosticTag = {}));
var DiagnosticSeverity;
(function(DiagnosticSeverity) {
    DiagnosticSeverity[DiagnosticSeverity["Hint"] = 3] = "Hint";
    DiagnosticSeverity[DiagnosticSeverity["Information"] = 2] = "Information";
    DiagnosticSeverity[DiagnosticSeverity["Warning"] = 1] = "Warning";
    DiagnosticSeverity[DiagnosticSeverity["Error"] = 0] = "Error";
})(DiagnosticSeverity || (DiagnosticSeverity = {}));
let DiagnosticRelatedInformation = class DiagnosticRelatedInformation {
    static is(thing) {
        if (!thing) {
            return false;
        }
        return typeof thing.message === "string" && thing.location && Range.isRange(thing.location.range) && URI.isUri(thing.location.uri);
    }
    constructor(location, message) {
        this.location = location;
        this.message = message;
    }
    static isEqual(a, b) {
        if (a === b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        return a.message === b.message && a.location.range.isEqual(b.location.range) && ( a.location.uri.toString()) === ( b.location.uri.toString());
    }
};
DiagnosticRelatedInformation = ( __decorate([es5ClassCompat], DiagnosticRelatedInformation));
let Diagnostic = class Diagnostic {
    constructor(range, message, severity = DiagnosticSeverity.Error) {
        if (!Range.isRange(range)) {
            throw ( new TypeError("range must be set"));
        }
        if (!message) {
            throw ( new TypeError("message must be set"));
        }
        this.range = range;
        this.message = message;
        this.severity = severity;
    }
    toJSON() {
        return {
            severity: DiagnosticSeverity[this.severity],
            message: this.message,
            range: this.range,
            source: this.source,
            code: this.code
        };
    }
    static isEqual(a, b) {
        if (a === b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        return a.message === b.message && a.severity === b.severity && a.code === b.code && a.severity === b.severity && a.source === b.source && a.range.isEqual(b.range) && equals(a.tags, b.tags) && equals(
            a.relatedInformation,
            b.relatedInformation,
            DiagnosticRelatedInformation.isEqual
        );
    }
};
Diagnostic = ( __decorate([es5ClassCompat], Diagnostic));

export { Diagnostic, DiagnosticRelatedInformation, DiagnosticSeverity, DiagnosticTag };
