
import { __decorate, __param } from '../../../../../external/tslib/tslib.es6.js';
import { Emitter } from '../../base/common/event.js';
import { Disposable, DisposableStore } from '../../base/common/lifecycle.js';
import { isEqual } from '../../base/common/resources.js';
import { isCodeEditor, isCompositeEditor, OverlayWidgetPositionPreference } from '../../editor/browser/editorBrowser.js';
import { EmbeddedCodeEditorWidget } from '../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js';
import { EditorOption } from '../../editor/common/config/editorOptions.js';
import { CursorChangeReason } from '../../editor/common/cursorEvents.js';
import { TrackedRangeStickiness } from '../../editor/common/model.js';
import { ModelDecorationOptions } from '../../editor/common/model/textModel.js';
import { FloatingClickWidget, AbstractFloatingClickMenu } from '../../platform/actions/browser/floatingMenu.js';
import { MenuId } from '../../platform/actions/common/actions.js';
import { IMenuService } from '../../platform/actions/common/actions.service.js';
import { IContextKeyService } from '../../platform/contextkey/common/contextkey.service.js';
import { IInstantiationService } from '../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../platform/keybinding/common/keybinding.service.js';
import { IEditorService } from '../services/editor/common/editorService.service.js';

var RangeHighlightDecorations_1;
let RangeHighlightDecorations = class RangeHighlightDecorations extends Disposable {
    static {
        RangeHighlightDecorations_1 = this;
    }
    constructor(editorService) {
        super();
        this.editorService = editorService;
        this._onHighlightRemoved = this._register(( new Emitter()));
        this.onHighlightRemoved = this._onHighlightRemoved.event;
        this.rangeHighlightDecorationId = null;
        this.editor = null;
        this.editorDisposables = this._register(( new DisposableStore()));
    }
    removeHighlightRange() {
        if (this.editor && this.rangeHighlightDecorationId) {
            const decorationId = this.rangeHighlightDecorationId;
            this.editor.changeDecorations(accessor => {
                accessor.removeDecoration(decorationId);
            });
            this._onHighlightRemoved.fire();
        }
        this.rangeHighlightDecorationId = null;
    }
    highlightRange(range, editor) {
        editor = editor ?? this.getEditor(range);
        if (isCodeEditor(editor)) {
            this.doHighlightRange(editor, range);
        } else if (isCompositeEditor(editor) && isCodeEditor(editor.activeCodeEditor)) {
            this.doHighlightRange(editor.activeCodeEditor, range);
        }
    }
    doHighlightRange(editor, selectionRange) {
        this.removeHighlightRange();
        editor.changeDecorations(changeAccessor => {
            this.rangeHighlightDecorationId = changeAccessor.addDecoration(
                selectionRange.range,
                this.createRangeHighlightDecoration(selectionRange.isWholeLine)
            );
        });
        this.setEditor(editor);
    }
    getEditor(resourceRange) {
        const resource = this.editorService.activeEditor?.resource;
        if (resource && isEqual(resource, resourceRange.resource) && isCodeEditor(this.editorService.activeTextEditorControl)) {
            return this.editorService.activeTextEditorControl;
        }
        return undefined;
    }
    setEditor(editor) {
        if (this.editor !== editor) {
            this.editorDisposables.clear();
            this.editor = editor;
            this.editorDisposables.add(this.editor.onDidChangeCursorPosition(e => {
                if (e.reason === CursorChangeReason.NotSet || e.reason === CursorChangeReason.Explicit || e.reason === CursorChangeReason.Undo || e.reason === CursorChangeReason.Redo) {
                    this.removeHighlightRange();
                }
            }));
            this.editorDisposables.add(this.editor.onDidChangeModel(() => {
                this.removeHighlightRange();
            }));
            this.editorDisposables.add(this.editor.onDidDispose(() => {
                this.removeHighlightRange();
                this.editor = null;
            }));
        }
    }
    static {
        this._WHOLE_LINE_RANGE_HIGHLIGHT = ModelDecorationOptions.register({
            description: "codeeditor-range-highlight-whole",
            stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            className: "rangeHighlight",
            isWholeLine: true
        });
    }
    static {
        this._RANGE_HIGHLIGHT = ModelDecorationOptions.register({
            description: "codeeditor-range-highlight",
            stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            className: "rangeHighlight"
        });
    }
    createRangeHighlightDecoration(isWholeLine = true) {
        return (isWholeLine ? RangeHighlightDecorations_1._WHOLE_LINE_RANGE_HIGHLIGHT : RangeHighlightDecorations_1._RANGE_HIGHLIGHT);
    }
    dispose() {
        super.dispose();
        if (this.editor?.getModel()) {
            this.removeHighlightRange();
            this.editor = null;
        }
    }
};
RangeHighlightDecorations = RangeHighlightDecorations_1 = ( __decorate([( __param(0, IEditorService))], RangeHighlightDecorations));
let FloatingEditorClickWidget = class FloatingEditorClickWidget extends FloatingClickWidget {
    constructor(editor, label, keyBindingAction, keybindingService) {
        super(keybindingService.appendKeybinding(label, keyBindingAction));
        this.editor = editor;
    }
    getId() {
        return "editor.overlayWidget.floatingClickWidget";
    }
    getPosition() {
        return {
            preference: OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER
        };
    }
    render() {
        super.render();
        this.editor.addOverlayWidget(this);
    }
    dispose() {
        this.editor.removeOverlayWidget(this);
        super.dispose();
    }
};
FloatingEditorClickWidget = ( __decorate([( __param(3, IKeybindingService))], FloatingEditorClickWidget));
let FloatingEditorClickMenu = class FloatingEditorClickMenu extends AbstractFloatingClickMenu {
    static {
        this.ID = "editor.contrib.floatingClickMenu";
    }
    constructor(editor, instantiationService, menuService, contextKeyService) {
        super(MenuId.EditorContent, menuService, contextKeyService);
        this.editor = editor;
        this.instantiationService = instantiationService;
        this.render();
    }
    createWidget(action) {
        return this.instantiationService.createInstance(FloatingEditorClickWidget, this.editor, action.label, action.id);
    }
    isVisible() {
        return !(this.editor instanceof EmbeddedCodeEditorWidget) && this.editor?.hasModel() && !this.editor.getOption(EditorOption.inDiffEditor);
    }
    getActionArg() {
        return this.editor.getModel()?.uri;
    }
};
FloatingEditorClickMenu = ( __decorate([( __param(1, IInstantiationService)), ( __param(2, IMenuService)), ( __param(3, IContextKeyService))], FloatingEditorClickMenu));

export { FloatingEditorClickMenu, FloatingEditorClickWidget, RangeHighlightDecorations };
