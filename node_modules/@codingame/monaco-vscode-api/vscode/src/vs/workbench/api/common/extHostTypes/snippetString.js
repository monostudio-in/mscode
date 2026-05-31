
import { __decorate } from '../../../../../../../external/tslib/tslib.es6.js';
import { es5ClassCompat } from './es5ClassCompat.js';

var SnippetString_1;
let SnippetString = SnippetString_1 = class SnippetString {
    static isSnippetString(thing) {
        if (thing instanceof SnippetString_1) {
            return true;
        }
        if (!thing || typeof thing !== "object") {
            return false;
        }
        return typeof thing.value === "string";
    }
    static _escape(value) {
        return value.replace(/\$|}|\\/g, "\\$&");
    }
    constructor(value) {
        this._tabstop = 1;
        this.value = value || "";
    }
    appendText(string) {
        this.value += SnippetString_1._escape(string);
        return this;
    }
    appendTabstop(number = this._tabstop++) {
        this.value += "$";
        this.value += number;
        return this;
    }
    appendPlaceholder(value, number = this._tabstop++) {
        if (typeof value === "function") {
            const nested = ( new SnippetString_1());
            nested._tabstop = this._tabstop;
            value(nested);
            this._tabstop = nested._tabstop;
            value = nested.value;
        } else {
            value = SnippetString_1._escape(value);
        }
        this.value += "${";
        this.value += number;
        this.value += ":";
        this.value += value;
        this.value += "}";
        return this;
    }
    appendChoice(values, number = this._tabstop++) {
        const value = ( values.map(s => s.replaceAll(/[|\\,]/g, "\\$&"))).join(",");
        this.value += "${";
        this.value += number;
        this.value += "|";
        this.value += value;
        this.value += "|}";
        return this;
    }
    appendVariable(name, defaultValue) {
        if (typeof defaultValue === "function") {
            const nested = ( new SnippetString_1());
            nested._tabstop = this._tabstop;
            defaultValue(nested);
            this._tabstop = nested._tabstop;
            defaultValue = nested.value;
        } else if (typeof defaultValue === "string") {
            defaultValue = defaultValue.replace(/\$|}/g, "\\$&");
        }
        this.value += "${";
        this.value += name;
        if (defaultValue) {
            this.value += ":";
            this.value += defaultValue;
        }
        this.value += "}";
        return this;
    }
};
SnippetString = SnippetString_1 = ( __decorate([es5ClassCompat], SnippetString));

export { SnippetString };
