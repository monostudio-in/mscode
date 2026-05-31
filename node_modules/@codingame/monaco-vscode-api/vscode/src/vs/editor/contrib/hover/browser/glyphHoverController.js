
import { registerCss } from '../../../../../../../css.js';
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { isModifierKey } from '../../../../base/common/keyCodes.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { EditorOption } from '../../../common/config/editorOptions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { isMousePositionWithinElement, shouldShowHover, isTriggerModifierPressed } from './hoverUtils.js';
import * as hover from './hover.css';
import { GlyphHoverWidget } from './glyphHoverWidget.js';

var GlyphHoverController_1;
registerCss(hover);
let GlyphHoverController = class GlyphHoverController extends Disposable {
    static {
        GlyphHoverController_1 = this;
    }
    static {
        this.ID = "editor.contrib.marginHover";
    }
    constructor(_editor, _instantiationService) {
        super();
        this._editor = _editor;
        this._instantiationService = _instantiationService;
        this.shouldKeepOpenOnEditorMouseMoveOrLeave = false;
        this._listenersStore = ( new DisposableStore());
        this._hoverState = {
            mouseDown: false
        };
        this._reactToEditorMouseMoveRunner = this._register(( new RunOnceScheduler(() => this._reactToEditorMouseMove(this._mouseMoveEvent), 0)));
        this._hookListeners();
        this._register(this._editor.onDidChangeConfiguration(e => {
            if (e.hasChanged(EditorOption.hover)) {
                this._unhookListeners();
                this._hookListeners();
            }
        }));
    }
    static get(editor) {
        return editor.getContribution(GlyphHoverController_1.ID);
    }
    _hookListeners() {
        const hoverOpts = this._editor.getOption(EditorOption.hover);
        this._hoverSettings = {
            enabled: hoverOpts.enabled,
            sticky: hoverOpts.sticky,
            hidingDelay: hoverOpts.hidingDelay
        };
        if (hoverOpts.enabled !== "off") {
            this._listenersStore.add(this._editor.onMouseDown(e => this._onEditorMouseDown(e)));
            this._listenersStore.add(this._editor.onMouseUp(() => this._onEditorMouseUp()));
            this._listenersStore.add(this._editor.onMouseMove(e => this._onEditorMouseMove(e)));
            this._listenersStore.add(this._editor.onKeyDown(e => this._onKeyDown(e)));
        } else {
            this._listenersStore.add(this._editor.onMouseMove(e => this._onEditorMouseMove(e)));
            this._listenersStore.add(this._editor.onKeyDown(e => this._onKeyDown(e)));
        }
        this._listenersStore.add(this._editor.onMouseLeave(e => this._onEditorMouseLeave(e)));
        this._listenersStore.add(this._editor.onDidChangeModel(() => {
            this._cancelScheduler();
            this.hideGlyphHover();
        }));
        this._listenersStore.add(this._editor.onDidChangeModelContent(() => this._cancelScheduler()));
        this._listenersStore.add(this._editor.onDidScrollChange(e => this._onEditorScrollChanged(e)));
    }
    _unhookListeners() {
        this._listenersStore.clear();
    }
    _cancelScheduler() {
        this._mouseMoveEvent = undefined;
        this._reactToEditorMouseMoveRunner.cancel();
    }
    _onEditorScrollChanged(e) {
        if (e.scrollTopChanged || e.scrollLeftChanged) {
            this.hideGlyphHover();
        }
    }
    _onEditorMouseDown(mouseEvent) {
        this._hoverState.mouseDown = true;
        const shouldNotHideCurrentHoverWidget = this._isMouseOnGlyphHoverWidget(mouseEvent);
        if (shouldNotHideCurrentHoverWidget) {
            return;
        }
        this.hideGlyphHover();
    }
    _isMouseOnGlyphHoverWidget(mouseEvent) {
        const glyphHoverWidgetNode = this._glyphWidget?.getDomNode();
        if (glyphHoverWidgetNode) {
            return isMousePositionWithinElement(glyphHoverWidgetNode, mouseEvent.event.posx, mouseEvent.event.posy);
        }
        return false;
    }
    _onEditorMouseUp() {
        this._hoverState.mouseDown = false;
    }
    _onEditorMouseLeave(mouseEvent) {
        if (this.shouldKeepOpenOnEditorMouseMoveOrLeave) {
            return;
        }
        this._cancelScheduler();
        const shouldNotHideCurrentHoverWidget = this._isMouseOnGlyphHoverWidget(mouseEvent);
        if (shouldNotHideCurrentHoverWidget) {
            return;
        }
        this.hideGlyphHover();
    }
    _shouldNotRecomputeCurrentHoverWidget(mouseEvent) {
        const isHoverSticky = this._hoverSettings.sticky;
        const isMouseOnGlyphHoverWidget = this._isMouseOnGlyphHoverWidget(mouseEvent);
        return isHoverSticky && isMouseOnGlyphHoverWidget;
    }
    _onEditorMouseMove(mouseEvent) {
        if (this.shouldKeepOpenOnEditorMouseMoveOrLeave) {
            return;
        }
        this._mouseMoveEvent = mouseEvent;
        const shouldNotRecomputeCurrentHoverWidget = this._shouldNotRecomputeCurrentHoverWidget(mouseEvent);
        if (shouldNotRecomputeCurrentHoverWidget) {
            this._reactToEditorMouseMoveRunner.cancel();
            return;
        }
        this._reactToEditorMouseMove(mouseEvent);
    }
    _reactToEditorMouseMove(mouseEvent) {
        if (!mouseEvent) {
            return;
        }
        if (!shouldShowHover(
            this._hoverSettings.enabled,
            this._editor.getOption(EditorOption.multiCursorModifier),
            mouseEvent
        )) {
            this.hideGlyphHover();
            return;
        }
        const glyphWidgetShowsOrWillShow = this._tryShowHoverWidget(mouseEvent);
        if (glyphWidgetShowsOrWillShow) {
            return;
        }
        this.hideGlyphHover();
    }
    _tryShowHoverWidget(mouseEvent) {
        const glyphWidget = this._getOrCreateGlyphWidget();
        return glyphWidget.showsOrWillShow(mouseEvent);
    }
    _onKeyDown(e) {
        if (!this._editor.hasModel()) {
            return;
        }
        if (this._hoverSettings.enabled === "onKeyboardModifier" && isTriggerModifierPressed(this._editor.getOption(EditorOption.multiCursorModifier), e) && this._mouseMoveEvent) {
            this._tryShowHoverWidget(this._mouseMoveEvent);
            return;
        }
        if (isModifierKey(e.keyCode)) {
            return;
        }
        this.hideGlyphHover();
    }
    hideGlyphHover() {
        this._glyphWidget?.hide();
    }
    _getOrCreateGlyphWidget() {
        if (!this._glyphWidget) {
            this._glyphWidget = this._instantiationService.createInstance(GlyphHoverWidget, this._editor);
        }
        return this._glyphWidget;
    }
    dispose() {
        super.dispose();
        this._unhookListeners();
        this._listenersStore.dispose();
        this._glyphWidget?.dispose();
    }
};
GlyphHoverController = GlyphHoverController_1 = ( __decorate([( __param(1, IInstantiationService))], GlyphHoverController));

export { GlyphHoverController };
