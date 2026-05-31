

var IndentConsts;
(function (IndentConsts) {
    IndentConsts[IndentConsts["INCREASE_MASK"] = 1] = "INCREASE_MASK";
    IndentConsts[IndentConsts["DECREASE_MASK"] = 2] = "DECREASE_MASK";
    IndentConsts[IndentConsts["INDENT_NEXTLINE_MASK"] = 4] = "INDENT_NEXTLINE_MASK";
    IndentConsts[IndentConsts["UNINDENT_MASK"] = 8] = "UNINDENT_MASK";
})(IndentConsts || (IndentConsts = {}));
function resetGlobalRegex(reg) {
    if (reg.global) {
        reg.lastIndex = 0;
    }
    return true;
}
class IndentRulesSupport {
    constructor(indentationRules) {
        this._indentationRules = indentationRules;
    }
    shouldIncrease(text) {
        if (this._indentationRules) {
            if (this._indentationRules.increaseIndentPattern && resetGlobalRegex(this._indentationRules.increaseIndentPattern) && this._indentationRules.increaseIndentPattern.test(text)) {
                return true;
            }
        }
        return false;
    }
    shouldDecrease(text) {
        if (this._indentationRules && this._indentationRules.decreaseIndentPattern && resetGlobalRegex(this._indentationRules.decreaseIndentPattern) && this._indentationRules.decreaseIndentPattern.test(text)) {
            return true;
        }
        return false;
    }
    shouldIndentNextLine(text) {
        if (this._indentationRules && this._indentationRules.indentNextLinePattern && resetGlobalRegex(this._indentationRules.indentNextLinePattern) && this._indentationRules.indentNextLinePattern.test(text)) {
            return true;
        }
        return false;
    }
    shouldIgnore(text) {
        if (this._indentationRules && this._indentationRules.unIndentedLinePattern && resetGlobalRegex(this._indentationRules.unIndentedLinePattern) && this._indentationRules.unIndentedLinePattern.test(text)) {
            return true;
        }
        return false;
    }
    getIndentMetadata(text) {
        let ret = 0;
        if (this.shouldIncrease(text)) {
            ret += IndentConsts.INCREASE_MASK;
        }
        if (this.shouldDecrease(text)) {
            ret += IndentConsts.DECREASE_MASK;
        }
        if (this.shouldIndentNextLine(text)) {
            ret += IndentConsts.INDENT_NEXTLINE_MASK;
        }
        if (this.shouldIgnore(text)) {
            ret += IndentConsts.UNINDENT_MASK;
        }
        return ret;
    }
}

export { IndentConsts, IndentRulesSupport };
