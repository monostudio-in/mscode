
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { Emitter } from '../../../base/common/event.js';
import { RawContextKey } from '../../contextkey/common/contextkey.js';
import { IContextKeyService } from '../../contextkey/common/contextkey.service.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { ILayoutService } from '../../layout/browser/layoutService.service.js';
import { IOpenerService } from '../../opener/common/opener.service.js';
import { QuickAccessController } from './quickAccess.js';
import { defaultKeybindingLabelStyles, defaultProgressBarStyles, defaultButtonStyles, defaultCountBadgeStyles, defaultToggleStyles, defaultInputBoxStyles, getListStyles } from '../../theme/browser/defaultStyles.js';
import { asCssVariable } from '../../theme/common/colorUtils.js';
import { activeContrastBorder } from '../../theme/common/colors/baseColors.js';
import '../../theme/common/colors/chartsColors.js';
import { widgetShadow, widgetBorder } from '../../theme/common/colors/editorColors.js';
import '../../theme/common/colors/inputColors.js';
import '../../theme/common/colors/listColors.js';
import '../../theme/common/colors/menuColors.js';
import '../../theme/common/colors/minimapColors.js';
import '../../theme/common/colors/miscColors.js';
import { pickerGroupForeground, pickerGroupBorder, quickInputBackground, quickInputListFocusForeground, quickInputListFocusBackground, quickInputListFocusIconForeground, quickInputTitleBackground, quickInputForeground } from '../../theme/common/colors/quickpickColors.js';
import '../../theme/common/colors/searchColors.js';
import { Themable } from '../../theme/common/themeService.js';
import { IThemeService } from '../../theme/common/themeService.service.js';
import { QuickInputHoverDelegate } from './quickInput.js';
import { QuickInputController } from './quickInputController.js';
import { IConfigurationService } from '../../configuration/common/configuration.service.js';
import { getWindow } from '../../../base/browser/dom.js';
import '../../../base/common/observableInternal/index.js';
import { observableValue } from '../../../base/common/observableInternal/observables/observableValue.js';
import { autorun } from '../../../base/common/observableInternal/reactions/autorun.js';

let QuickInputService = class QuickInputService extends Themable {
    get backButton() {
        return this.controller.backButton;
    }
    get controller() {
        if (!this._controller) {
            this._controller = this._register(this.createController());
        }
        return this._controller;
    }
    get hasController() {
        return !!this._controller;
    }
    get currentQuickInput() {
        return this.controller.currentQuickInput;
    }
    get quickAccess() {
        if (!this._quickAccess) {
            this._quickAccess = this._register(this.instantiationService.createInstance(QuickAccessController));
        }
        return this._quickAccess;
    }
    constructor(
        instantiationService,
        contextKeyService,
        themeService,
        layoutService,
        configurationService
    ) {
        super(themeService);
        this.instantiationService = instantiationService;
        this.contextKeyService = contextKeyService;
        this.layoutService = layoutService;
        this.configurationService = configurationService;
        this._alignment = observableValue(this, "top");
        this.alignment = this._alignment;
        this._onShow = this._register(( new Emitter()));
        this.onShow = this._onShow.event;
        this._onHide = this._register(( new Emitter()));
        this.onHide = this._onHide.event;
        this.contexts = ( new Map());
    }
    createController(host = this.layoutService, options) {
        const defaultOptions = {
            idPrefix: "quickInput_",
            container: host.activeContainer,
            ignoreFocusOut: () => false,
            backKeybindingLabel: () => undefined,
            setContextKey: id => this.setContextKey(id),
            linkOpenerDelegate: content => {
                this.instantiationService.invokeFunction(accessor => {
                    const openerService = accessor.get(IOpenerService);
                    openerService.open(content, {
                        allowCommands: true,
                        fromUserGesture: true
                    });
                });
            },
            returnFocus: () => host.focus(),
            styles: this.computeStyles(),
            hoverDelegate: this._register(this.instantiationService.createInstance(QuickInputHoverDelegate))
        };
        const controller = this._register(this.instantiationService.createInstance(QuickInputController, {
            ...defaultOptions,
            ...options
        }));
        controller.layout(host.activeContainerDimension, host.activeContainerOffset.quickPickTop);
        this._register(host.onDidLayoutActiveContainer(dimension => {
            if (getWindow(host.activeContainer) === getWindow(controller.container)) {
                controller.layout(dimension, host.activeContainerOffset.quickPickTop);
            }
        }));
        this._register(host.onDidChangeActiveContainer(() => {
            if (controller.isVisible()) {
                return;
            }
            controller.layout(host.activeContainerDimension, host.activeContainerOffset.quickPickTop);
        }));
        this._register(controller.onShow(() => {
            this.resetContextKeys();
            this._onShow.fire();
        }));
        this._register(controller.onHide(() => {
            this.resetContextKeys();
            this._onHide.fire();
        }));
        this._register(autorun(reader => {
            this._alignment.set(controller.alignment.read(reader), undefined);
        }));
        return controller;
    }
    setContextKey(id) {
        let key;
        if (id) {
            key = this.contexts.get(id);
            if (!key) {
                key = ( new RawContextKey(id, false)).bindTo(this.contextKeyService);
                this.contexts.set(id, key);
            }
        }
        if (key && key.get()) {
            return;
        }
        this.resetContextKeys();
        key?.set(true);
    }
    resetContextKeys() {
        this.contexts.forEach(context => {
            if (context.get()) {
                context.reset();
            }
        });
    }
    pick(picks, options, token = CancellationToken.None) {
        return this.controller.pick(picks, options, token);
    }
    input(options = {}, token = CancellationToken.None) {
        return this.controller.input(options, token);
    }
    createQuickPick(
        options = {
            useSeparators: false
        }
    ) {
        return this.controller.createQuickPick(options);
    }
    createInputBox() {
        return this.controller.createInputBox();
    }
    createQuickWidget() {
        return this.controller.createQuickWidget();
    }
    createQuickTree() {
        return this.controller.createQuickTree();
    }
    focus() {
        this.controller.focus();
    }
    toggle() {
        this.controller.toggle();
    }
    navigate(next, quickNavigate) {
        this.controller.navigate(next, quickNavigate);
    }
    accept(keyMods) {
        return this.controller.accept(keyMods);
    }
    back() {
        return this.controller.back();
    }
    cancel(reason) {
        return this.controller.cancel(reason);
    }
    setAlignment(alignment) {
        this.controller.setAlignment(alignment);
    }
    toggleHover() {
        if (this.hasController) {
            this.controller.toggleHover();
        }
    }
    updateStyles() {
        if (this.hasController) {
            this.controller.applyStyles(this.computeStyles());
        }
    }
    computeStyles() {
        return {
            widget: {
                quickInputBackground: asCssVariable(quickInputBackground),
                quickInputForeground: asCssVariable(quickInputForeground),
                quickInputTitleBackground: asCssVariable(quickInputTitleBackground),
                widgetBorder: asCssVariable(widgetBorder),
                widgetShadow: asCssVariable(widgetShadow)
            },
            inputBox: defaultInputBoxStyles,
            toggle: defaultToggleStyles,
            countBadge: defaultCountBadgeStyles,
            button: defaultButtonStyles,
            progressBar: defaultProgressBarStyles,
            keybindingLabel: defaultKeybindingLabelStyles,
            list: getListStyles({
                listBackground: quickInputBackground,
                listFocusBackground: quickInputListFocusBackground,
                listFocusForeground: quickInputListFocusForeground,
                listInactiveFocusForeground: quickInputListFocusForeground,
                listInactiveSelectionIconForeground: quickInputListFocusIconForeground,
                listInactiveFocusBackground: quickInputListFocusBackground,
                listInactiveSelectionBackground: quickInputListFocusBackground,
                listInactiveSelectionForeground: quickInputListFocusForeground,
                listFocusOutline: activeContrastBorder,
                listInactiveFocusOutline: activeContrastBorder,
                treeStickyScrollBackground: quickInputBackground
            }),
            pickerGroup: {
                pickerGroupBorder: asCssVariable(pickerGroupBorder),
                pickerGroupForeground: asCssVariable(pickerGroupForeground)
            }
        };
    }
};
QuickInputService = ( __decorate([( __param(0, IInstantiationService)), ( __param(1, IContextKeyService)), ( __param(2, IThemeService)), ( __param(3, ILayoutService)), ( __param(4, IConfigurationService))], QuickInputService));

export { QuickInputService };
