
import { __decorate } from '../../../../../../../external/tslib/tslib.es6.js';
import { es5ClassCompat } from './es5ClassCompat.js';

var CodeActionKind_1;
let CodeActionKind = class CodeActionKind {
    static {
        CodeActionKind_1 = this;
    }
    static {
        this.sep = ".";
    }
    constructor(value) {
        this.value = value;
    }
    append(parts) {
        return ( new CodeActionKind_1(this.value ? this.value + CodeActionKind_1.sep + parts : parts));
    }
    intersects(other) {
        return this.contains(other) || other.contains(this);
    }
    contains(other) {
        return this.value === other.value || other.value.startsWith(this.value + CodeActionKind_1.sep);
    }
};
CodeActionKind = CodeActionKind_1 = ( __decorate([es5ClassCompat], CodeActionKind));
CodeActionKind.Empty = ( new CodeActionKind(""));
CodeActionKind.QuickFix = CodeActionKind.Empty.append("quickfix");
CodeActionKind.Refactor = CodeActionKind.Empty.append("refactor");
CodeActionKind.RefactorExtract = CodeActionKind.Refactor.append("extract");
CodeActionKind.RefactorInline = CodeActionKind.Refactor.append("inline");
CodeActionKind.RefactorMove = CodeActionKind.Refactor.append("move");
CodeActionKind.RefactorRewrite = CodeActionKind.Refactor.append("rewrite");
CodeActionKind.Source = CodeActionKind.Empty.append("source");
CodeActionKind.SourceOrganizeImports = CodeActionKind.Source.append("organizeImports");
CodeActionKind.SourceFixAll = CodeActionKind.Source.append("fixAll");
CodeActionKind.Notebook = CodeActionKind.Empty.append("notebook");

export { CodeActionKind };
