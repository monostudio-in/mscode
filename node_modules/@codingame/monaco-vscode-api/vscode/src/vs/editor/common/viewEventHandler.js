
import { Disposable } from '../../base/common/lifecycle.js';
import { ViewEventType } from './viewEvents.js';

class ViewEventHandler extends Disposable {
    constructor() {
        super();
        this._shouldRender = true;
    }
    shouldRender() {
        return this._shouldRender;
    }
    forceShouldRender() {
        this._shouldRender = true;
    }
    setShouldRender() {
        this._shouldRender = true;
    }
    onDidRender() {
        this._shouldRender = false;
    }
    onCompositionStart(e) {
        return false;
    }
    onCompositionEnd(e) {
        return false;
    }
    onConfigurationChanged(e) {
        return false;
    }
    onCursorStateChanged(e) {
        return false;
    }
    onDecorationsChanged(e) {
        return false;
    }
    onFlushed(e) {
        return false;
    }
    onFocusChanged(e) {
        return false;
    }
    onLanguageConfigurationChanged(e) {
        return false;
    }
    onLineMappingChanged(e) {
        return false;
    }
    onLinesChanged(e) {
        return false;
    }
    onLinesDeleted(e) {
        return false;
    }
    onLinesInserted(e) {
        return false;
    }
    onRevealRangeRequest(e) {
        return false;
    }
    onScrollChanged(e) {
        return false;
    }
    onThemeChanged(e) {
        return false;
    }
    onTokensChanged(e) {
        return false;
    }
    onTokensColorsChanged(e) {
        return false;
    }
    onZonesChanged(e) {
        return false;
    }
    handleEvents(events) {
        let shouldRender = false;
        for (let i = 0, len = events.length; i < len; i++) {
            const e = events[i];
            switch (e.type) {
                case ViewEventType.ViewCompositionStart:
                    if (this.onCompositionStart(e)) {
                        shouldRender = true;
                    }
                    break;
                case ViewEventType.ViewCompositionEnd:
                    if (this.onCompositionEnd(e)) {
                        shouldRender = true;
                    }
                    break;
                case ViewEventType.ViewConfigurationChanged:
                    if (this.onConfigurationChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case ViewEventType.ViewCursorStateChanged:
                    if (this.onCursorStateChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case ViewEventType.ViewDecorationsChanged:
                    if (this.onDecorationsChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case ViewEventType.ViewFlushed:
                    if (this.onFlushed(e)) {
                        shouldRender = true;
                    }
                    break;
                case ViewEventType.ViewFocusChanged:
                    if (this.onFocusChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case ViewEventType.ViewLanguageConfigurationChanged:
                    if (this.onLanguageConfigurationChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case ViewEventType.ViewLineMappingChanged:
                    if (this.onLineMappingChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case ViewEventType.ViewLinesChanged:
                    if (this.onLinesChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case ViewEventType.ViewLinesDeleted:
                    if (this.onLinesDeleted(e)) {
                        shouldRender = true;
                    }
                    break;
                case ViewEventType.ViewLinesInserted:
                    if (this.onLinesInserted(e)) {
                        shouldRender = true;
                    }
                    break;
                case ViewEventType.ViewRevealRangeRequest:
                    if (this.onRevealRangeRequest(e)) {
                        shouldRender = true;
                    }
                    break;
                case ViewEventType.ViewScrollChanged:
                    if (this.onScrollChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case ViewEventType.ViewTokensChanged:
                    if (this.onTokensChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case ViewEventType.ViewThemeChanged:
                    if (this.onThemeChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case ViewEventType.ViewTokensColorsChanged:
                    if (this.onTokensColorsChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                case ViewEventType.ViewZonesChanged:
                    if (this.onZonesChanged(e)) {
                        shouldRender = true;
                    }
                    break;
                default:
                    console.info('View received unknown event: ');
                    console.info(e);
            }
        }
        if (shouldRender) {
            this._shouldRender = true;
        }
    }
}

export { ViewEventHandler };
