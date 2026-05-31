
import { registerCss } from '../../../../../../../css.js';
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { $, addDisposableListener, EventType } from '../../../../base/browser/dom.js';
import { disposableTimeout } from '../../../../base/common/async.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { Disposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { noBreakWhitespace } from '../../../../base/common/strings.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import * as inlineProgressWidget from './inlineProgressWidget.css';
import { ContentWidgetPositionPreference } from '../../../browser/editorBrowser.js';
import { EditorOption } from '../../../common/config/editorOptions.js';
import { Range } from '../../../common/core/range.js';
import { TrackedRangeStickiness } from '../../../common/model.js';
import { ModelDecorationOptions } from '../../../common/model/textModel.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';

registerCss(inlineProgressWidget);
const inlineProgressDecoration = ModelDecorationOptions.register({
    description: "inline-progress-widget",
    stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
    showIfCollapsed: true,
    after: {
        content: noBreakWhitespace,
        inlineClassName: "inline-editor-progress-decoration",
        inlineClassNameAffectsLetterSpacing: true
    }
});
class InlineProgressWidget extends Disposable {
    static {
        this.baseId = "editor.widget.inlineProgressWidget";
    }
    constructor(typeId, editor, range, title, delegate) {
        super();
        this.typeId = typeId;
        this.editor = editor;
        this.range = range;
        this.delegate = delegate;
        this.allowEditorOverflow = false;
        this.suppressMouseDown = true;
        this.create(title);
        this.editor.addContentWidget(this);
        this.editor.layoutContentWidget(this);
    }
    create(title) {
        this.domNode = $(".inline-progress-widget");
        this.domNode.role = "button";
        this.domNode.title = title;
        const iconElement = $("span.icon");
        this.domNode.append(iconElement);
        iconElement.classList.add(...ThemeIcon.asClassNameArray(Codicon.loading), "codicon-modifier-spin");
        const updateSize = () => {
            const lineHeight = this.editor.getOption(EditorOption.lineHeight);
            this.domNode.style.height = `${lineHeight}px`;
            this.domNode.style.width = `${Math.ceil(0.8 * lineHeight)}px`;
        };
        updateSize();
        this._register(this.editor.onDidChangeConfiguration(c => {
            if (c.hasChanged(EditorOption.fontSize) || c.hasChanged(EditorOption.lineHeight)) {
                updateSize();
            }
        }));
        this._register(addDisposableListener(this.domNode, EventType.CLICK, e => {
            this.delegate.cancel();
        }));
    }
    getId() {
        return InlineProgressWidget.baseId + "." + this.typeId;
    }
    getDomNode() {
        return this.domNode;
    }
    getPosition() {
        return {
            position: {
                lineNumber: this.range.startLineNumber,
                column: this.range.startColumn
            },
            preference: [ContentWidgetPositionPreference.EXACT]
        };
    }
    dispose() {
        super.dispose();
        this.editor.removeContentWidget(this);
    }
}
let InlineProgressManager = class InlineProgressManager extends Disposable {
    constructor(id, _editor, _instantiationService) {
        super();
        this.id = id;
        this._editor = _editor;
        this._instantiationService = _instantiationService;
        this._showDelay = 500;
        this._showPromise = this._register(( new MutableDisposable()));
        this._currentWidget = this._register(( new MutableDisposable()));
        this._operationIdPool = 0;
        this._currentDecorations = _editor.createDecorationsCollection();
    }
    dispose() {
        super.dispose();
        this._currentDecorations.clear();
    }
    async showWhile(position, title, promise, delegate, delayOverride) {
        const operationId = this._operationIdPool++;
        this._currentOperation = operationId;
        this.clear();
        this._showPromise.value = disposableTimeout(() => {
            const range = Range.fromPositions(position);
            const decorationIds = this._currentDecorations.set([{
                range: range,
                options: inlineProgressDecoration
            }]);
            if (decorationIds.length > 0) {
                this._currentWidget.value = this._instantiationService.createInstance(InlineProgressWidget, this.id, this._editor, range, title, delegate);
            }
        }, delayOverride ?? this._showDelay);
        try {
            return await promise;
        } finally {
            if (this._currentOperation === operationId) {
                this.clear();
                this._currentOperation = undefined;
            }
        }
    }
    clear() {
        this._showPromise.clear();
        this._currentDecorations.clear();
        this._currentWidget.clear();
    }
};
InlineProgressManager = ( __decorate([( __param(2, IInstantiationService))], InlineProgressManager));

export { InlineProgressManager };
