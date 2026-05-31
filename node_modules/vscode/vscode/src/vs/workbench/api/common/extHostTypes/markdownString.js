
import { __decorate } from '../../../../../../../external/tslib/tslib.es6.js';
import { MarkdownString as MarkdownString$1 } from '../../../../base/common/htmlContent.js';
import { es5ClassCompat } from './es5ClassCompat.js';

var MarkdownString_1;
let MarkdownString = MarkdownString_1 = class MarkdownString {
    #delegate;
    static isMarkdownString(thing) {
        if (thing instanceof MarkdownString_1) {
            return true;
        }
        if (!thing || typeof thing !== "object") {
            return false;
        }
        return thing.appendCodeblock && thing.appendMarkdown && thing.appendText && (thing.value !== undefined);
    }
    constructor(value, supportThemeIcons = false) {
        this.#delegate = ( new MarkdownString$1(value, {
            supportThemeIcons
        }));
    }
    get value() {
        return this.#delegate.value;
    }
    set value(value) {
        this.#delegate.value = value;
    }
    get isTrusted() {
        return this.#delegate.isTrusted;
    }
    set isTrusted(value) {
        this.#delegate.isTrusted = value;
    }
    get supportThemeIcons() {
        return this.#delegate.supportThemeIcons;
    }
    set supportThemeIcons(value) {
        this.#delegate.supportThemeIcons = value;
    }
    get supportHtml() {
        return this.#delegate.supportHtml;
    }
    set supportHtml(value) {
        this.#delegate.supportHtml = value;
    }
    get supportAlertSyntax() {
        return this.#delegate.supportAlertSyntax;
    }
    set supportAlertSyntax(value) {
        this.#delegate.supportAlertSyntax = value;
    }
    get baseUri() {
        return this.#delegate.baseUri;
    }
    set baseUri(value) {
        this.#delegate.baseUri = value;
    }
    appendText(value) {
        this.#delegate.appendText(value);
        return this;
    }
    appendMarkdown(value) {
        this.#delegate.appendMarkdown(value);
        return this;
    }
    appendCodeblock(value, language) {
        this.#delegate.appendCodeblock(language ?? "", value);
        return this;
    }
};
MarkdownString = MarkdownString_1 = ( __decorate([es5ClassCompat], MarkdownString));

export { MarkdownString };
