
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { $, clearNode, append } from '../../../base/browser/dom.js';
import { Widget } from '../../../base/browser/ui/widget.js';
import { Emitter } from '../../../base/common/event.js';
import { Disposable, DisposableStore, toDisposable } from '../../../base/common/lifecycle.js';
import { getFlatActionBarActions } from './menuEntryActionViewItem.js';
import { IMenuService } from '../common/actions.service.js';
import { IContextKeyService } from '../../contextkey/common/contextkey.service.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { asCssVariableWithDefault, asCssVariable } from '../../theme/common/colorUtils.js';
import { contrastBorder } from '../../theme/common/colors/baseColors.js';
import '../../theme/common/colors/chartsColors.js';
import { editorBackground, editorForeground } from '../../theme/common/colors/editorColors.js';
import { buttonBackground, buttonForeground } from '../../theme/common/colors/inputColors.js';
import '../../theme/common/colors/listColors.js';
import '../../theme/common/colors/menuColors.js';
import '../../theme/common/colors/minimapColors.js';
import '../../theme/common/colors/miscColors.js';
import '../../theme/common/colors/quickpickColors.js';
import '../../theme/common/colors/searchColors.js';

class FloatingClickWidget extends Widget {
    constructor(label) {
        super();
        this.label = label;
        this._onClick = this._register(( new Emitter()));
        this.onClick = this._onClick.event;
        this._domNode = $(".floating-click-widget");
        this._domNode.style.padding = "6px 11px";
        this._domNode.style.borderRadius = "2px";
        this._domNode.style.cursor = "pointer";
        this._domNode.style.zIndex = "1";
    }
    getDomNode() {
        return this._domNode;
    }
    render() {
        clearNode(this._domNode);
        this._domNode.style.backgroundColor = asCssVariableWithDefault(buttonBackground, asCssVariable(editorBackground));
        this._domNode.style.color = asCssVariableWithDefault(buttonForeground, asCssVariable(editorForeground));
        this._domNode.style.border = `1px solid ${asCssVariable(contrastBorder)}`;
        append(this._domNode, $("")).textContent = this.label;
        this.onclick(this._domNode, () => this._onClick.fire());
    }
}
let AbstractFloatingClickMenu = class AbstractFloatingClickMenu extends Disposable {
    get onDidRender() {
        return this.renderEmitter.event;
    }
    constructor(menuId, menuService, contextKeyService) {
        super();
        this.renderEmitter = this._register(( new Emitter()));
        this.menu = this._register(menuService.createMenu(menuId, contextKeyService));
    }
    render() {
        const menuDisposables = this._register(( new DisposableStore()));
        const renderMenuAsFloatingClickBtn = () => {
            menuDisposables.clear();
            if (!this.isVisible()) {
                return;
            }
            const actions = getFlatActionBarActions(this.menu.getActions({
                renderShortTitle: true,
                shouldForwardArgs: true
            }));
            if (actions.length === 0) {
                return;
            }
            const [first] = actions;
            const widget = this.createWidget(first, menuDisposables);
            menuDisposables.add(widget);
            menuDisposables.add(widget.onClick(() => first.run(this.getActionArg())));
            widget.render();
        };
        this._register(this.menu.onDidChange(renderMenuAsFloatingClickBtn));
        renderMenuAsFloatingClickBtn();
    }
    getActionArg() {
        return undefined;
    }
    isVisible() {
        return true;
    }
};
AbstractFloatingClickMenu = ( __decorate([( __param(1, IMenuService)), ( __param(2, IContextKeyService))], AbstractFloatingClickMenu));
let FloatingClickMenu = class FloatingClickMenu extends AbstractFloatingClickMenu {
    constructor(options, instantiationService, menuService, contextKeyService) {
        super(options.menuId, menuService, contextKeyService);
        this.options = options;
        this.instantiationService = instantiationService;
        this.render();
    }
    createWidget(action, disposable) {
        const w = this.instantiationService.createInstance(FloatingClickWidget, action.label);
        const node = w.getDomNode();
        this.options.container.appendChild(node);
        disposable.add(toDisposable(() => node.remove()));
        return w;
    }
    getActionArg() {
        return this.options.getActionArg();
    }
};
FloatingClickMenu = ( __decorate([( __param(1, IInstantiationService)), ( __param(2, IMenuService)), ( __param(3, IContextKeyService))], FloatingClickMenu));

export { AbstractFloatingClickMenu, FloatingClickMenu, FloatingClickWidget };
