
import { registerCss } from '../../../../../../../css.js';
import * as iPadShowKeyboard from './iPadShowKeyboard.css';
import { createElement, addDisposableListener } from '../../../../base/browser/dom.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { OverlayWidgetPositionPreference } from '../../../browser/editorBrowser.js';
import { registerEditorContribution, EditorContributionInstantiation } from '../../../browser/editorExtensions.js';
import { EditorOption } from '../../../common/config/editorOptions.js';
import { isIOS } from '../../../../base/common/platform.js';

registerCss(iPadShowKeyboard);
class IPadShowKeyboard extends Disposable {
    static {
        this.ID = "editor.contrib.iPadShowKeyboard";
    }
    constructor(editor) {
        super();
        this.editor = editor;
        this.widget = null;
        if (isIOS) {
            this._register(editor.onDidChangeConfiguration(() => this.update()));
            this.update();
        }
    }
    update() {
        const shouldHaveWidget = (!this.editor.getOption(EditorOption.readOnly));
        if (!this.widget && shouldHaveWidget) {
            this.widget = ( new ShowKeyboardWidget(this.editor));
        } else if (this.widget && !shouldHaveWidget) {
            this.widget.dispose();
            this.widget = null;
        }
    }
    dispose() {
        super.dispose();
        if (this.widget) {
            this.widget.dispose();
            this.widget = null;
        }
    }
}
class ShowKeyboardWidget extends Disposable {
    static {
        this.ID = "editor.contrib.ShowKeyboardWidget";
    }
    constructor(editor) {
        super();
        this.editor = editor;
        this._domNode = createElement("textarea");
        this._domNode.className = "iPadShowKeyboard";
        this._register(addDisposableListener(this._domNode, "touchstart", e => {
            this.editor.focus();
        }));
        this._register(addDisposableListener(this._domNode, "focus", e => {
            this.editor.focus();
        }));
        this.editor.addOverlayWidget(this);
    }
    dispose() {
        this.editor.removeOverlayWidget(this);
        super.dispose();
    }
    getId() {
        return ShowKeyboardWidget.ID;
    }
    getDomNode() {
        return this._domNode;
    }
    getPosition() {
        return {
            preference: OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER
        };
    }
}
registerEditorContribution(
    IPadShowKeyboard.ID,
    IPadShowKeyboard,
    EditorContributionInstantiation.Eventually
);

export { IPadShowKeyboard };
