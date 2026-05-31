
import { __decorate } from '../../../../../../../external/tslib/tslib.es6.js';
import { es5ClassCompat } from './es5ClassCompat.js';
import { Location } from './location.js';
import { Range } from './range.js';

var SymbolInformation_1;
var SymbolKind;
(function(SymbolKind) {
    SymbolKind[SymbolKind["File"] = 0] = "File";
    SymbolKind[SymbolKind["Module"] = 1] = "Module";
    SymbolKind[SymbolKind["Namespace"] = 2] = "Namespace";
    SymbolKind[SymbolKind["Package"] = 3] = "Package";
    SymbolKind[SymbolKind["Class"] = 4] = "Class";
    SymbolKind[SymbolKind["Method"] = 5] = "Method";
    SymbolKind[SymbolKind["Property"] = 6] = "Property";
    SymbolKind[SymbolKind["Field"] = 7] = "Field";
    SymbolKind[SymbolKind["Constructor"] = 8] = "Constructor";
    SymbolKind[SymbolKind["Enum"] = 9] = "Enum";
    SymbolKind[SymbolKind["Interface"] = 10] = "Interface";
    SymbolKind[SymbolKind["Function"] = 11] = "Function";
    SymbolKind[SymbolKind["Variable"] = 12] = "Variable";
    SymbolKind[SymbolKind["Constant"] = 13] = "Constant";
    SymbolKind[SymbolKind["String"] = 14] = "String";
    SymbolKind[SymbolKind["Number"] = 15] = "Number";
    SymbolKind[SymbolKind["Boolean"] = 16] = "Boolean";
    SymbolKind[SymbolKind["Array"] = 17] = "Array";
    SymbolKind[SymbolKind["Object"] = 18] = "Object";
    SymbolKind[SymbolKind["Key"] = 19] = "Key";
    SymbolKind[SymbolKind["Null"] = 20] = "Null";
    SymbolKind[SymbolKind["EnumMember"] = 21] = "EnumMember";
    SymbolKind[SymbolKind["Struct"] = 22] = "Struct";
    SymbolKind[SymbolKind["Event"] = 23] = "Event";
    SymbolKind[SymbolKind["Operator"] = 24] = "Operator";
    SymbolKind[SymbolKind["TypeParameter"] = 25] = "TypeParameter";
})(SymbolKind || (SymbolKind = {}));
var SymbolTag;
(function(SymbolTag) {
    SymbolTag[SymbolTag["Deprecated"] = 1] = "Deprecated";
})(SymbolTag || (SymbolTag = {}));
let SymbolInformation = SymbolInformation_1 = class SymbolInformation {
    static validate(candidate) {
        if (!candidate.name) {
            throw ( new Error("name must not be falsy"));
        }
    }
    constructor(name, kind, rangeOrContainer, locationOrUri, containerName) {
        this.name = name;
        this.kind = kind;
        this.containerName = containerName;
        if (typeof rangeOrContainer === "string") {
            this.containerName = rangeOrContainer;
        }
        if (locationOrUri instanceof Location) {
            this.location = locationOrUri;
        } else if (rangeOrContainer instanceof Range) {
            this.location = ( new Location(locationOrUri, rangeOrContainer));
        }
        SymbolInformation_1.validate(this);
    }
    toJSON() {
        return {
            name: this.name,
            kind: SymbolKind[this.kind],
            location: this.location,
            containerName: this.containerName
        };
    }
};
SymbolInformation = SymbolInformation_1 = ( __decorate([es5ClassCompat], SymbolInformation));

export { SymbolInformation, SymbolKind, SymbolTag };
