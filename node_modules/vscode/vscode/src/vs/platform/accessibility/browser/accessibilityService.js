
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { addDisposableListener } from '../../../base/browser/dom.js';
import { alert, status } from '../../../base/browser/ui/aria/aria.js';
import { mainWindow } from '../../../base/browser/window.js';
import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { AccessibilitySupport, CONTEXT_ACCESSIBILITY_MODE_ENABLED } from '../common/accessibility.js';
import { IConfigurationService } from '../../configuration/common/configuration.service.js';
import { IContextKeyService } from '../../contextkey/common/contextkey.service.js';
import { ILayoutService } from '../../layout/browser/layoutService.service.js';

let AccessibilityService = class AccessibilityService extends Disposable {
    constructor(_contextKeyService, _layoutService, _configurationService) {
        super();
        this._contextKeyService = _contextKeyService;
        this._layoutService = _layoutService;
        this._configurationService = _configurationService;
        this._accessibilitySupport = AccessibilitySupport.Unknown;
        this._onDidChangeScreenReaderOptimized = this._register(( new Emitter()));
        this._onDidChangeReducedMotion = this._register(( new Emitter()));
        this._onDidChangeReducedTransparency = this._register(( new Emitter()));
        this._onDidChangeLinkUnderline = this._register(( new Emitter()));
        this._accessibilityModeEnabledContext = CONTEXT_ACCESSIBILITY_MODE_ENABLED.bindTo(this._contextKeyService);
        const updateContextKey = () => this._accessibilityModeEnabledContext.set(this.isScreenReaderOptimized());
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("editor.accessibilitySupport")) {
                updateContextKey();
                this._onDidChangeScreenReaderOptimized.fire();
            }
            if (e.affectsConfiguration("workbench.reduceMotion")) {
                this._configMotionReduced = this._configurationService.getValue("workbench.reduceMotion");
                this._onDidChangeReducedMotion.fire();
            }
            if (e.affectsConfiguration("workbench.reduceTransparency")) {
                this._configTransparencyReduced = this._configurationService.getValue("workbench.reduceTransparency");
                this._onDidChangeReducedTransparency.fire();
            }
        }));
        updateContextKey();
        this._register(this.onDidChangeScreenReaderOptimized(() => updateContextKey()));
        const reduceMotionMatcher = mainWindow.matchMedia(`(prefers-reduced-motion: reduce)`);
        this._systemMotionReduced = reduceMotionMatcher.matches;
        this._configMotionReduced = this._configurationService.getValue("workbench.reduceMotion");
        const reduceTransparencyMatcher = mainWindow.matchMedia(`(prefers-reduced-transparency: reduce)`);
        this._systemTransparencyReduced = reduceTransparencyMatcher.matches;
        this._configTransparencyReduced = this._configurationService.getValue("workbench.reduceTransparency");
        this._linkUnderlinesEnabled = this._configurationService.getValue("accessibility.underlineLinks");
        this.initReducedMotionListeners(reduceMotionMatcher);
        this.initReducedTransparencyListeners(reduceTransparencyMatcher);
        this.initLinkUnderlineListeners();
    }
    initReducedMotionListeners(reduceMotionMatcher) {
        this._register(addDisposableListener(reduceMotionMatcher, "change", () => {
            this._systemMotionReduced = reduceMotionMatcher.matches;
            if (this._configMotionReduced === "auto") {
                this._onDidChangeReducedMotion.fire();
            }
        }));
        const updateRootClasses = () => {
            const reduce = this.isMotionReduced();
            this._layoutService.mainContainer.classList.toggle("monaco-reduce-motion", reduce);
            this._layoutService.mainContainer.classList.toggle("monaco-enable-motion", !reduce);
        };
        updateRootClasses();
        this._register(this.onDidChangeReducedMotion(() => updateRootClasses()));
    }
    initReducedTransparencyListeners(reduceTransparencyMatcher) {
        this._register(addDisposableListener(reduceTransparencyMatcher, "change", () => {
            this._systemTransparencyReduced = reduceTransparencyMatcher.matches;
            if (this._configTransparencyReduced === "auto") {
                this._onDidChangeReducedTransparency.fire();
            }
        }));
        const updateRootClasses = () => {
            const reduce = this.isTransparencyReduced();
            this._layoutService.mainContainer.classList.toggle("monaco-reduce-transparency", reduce);
        };
        updateRootClasses();
        this._register(this.onDidChangeReducedTransparency(() => updateRootClasses()));
    }
    initLinkUnderlineListeners() {
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("accessibility.underlineLinks")) {
                const linkUnderlinesEnabled = this._configurationService.getValue("accessibility.underlineLinks");
                this._linkUnderlinesEnabled = linkUnderlinesEnabled;
                this._onDidChangeLinkUnderline.fire();
            }
        }));
        const updateLinkUnderlineClasses = () => {
            const underlineLinks = this._linkUnderlinesEnabled;
            this._layoutService.mainContainer.classList.toggle("underline-links", underlineLinks);
        };
        updateLinkUnderlineClasses();
        this._register(this.onDidChangeLinkUnderlines(() => updateLinkUnderlineClasses()));
    }
    onDidChangeLinkUnderlines(listener) {
        return this._onDidChangeLinkUnderline.event(listener);
    }
    get onDidChangeScreenReaderOptimized() {
        return this._onDidChangeScreenReaderOptimized.event;
    }
    isScreenReaderOptimized() {
        const config = this.getAccessibilitySupportConfigurationValue();
        return config === "on" || (config === "auto" && this._accessibilitySupport === AccessibilitySupport.Enabled);
    }
    getAccessibilitySupportConfigurationValue() {
        const inspectedValue = this._configurationService.inspect("editor.accessibilitySupport");
        return inspectedValue.policyValue ?? inspectedValue.memoryValue ?? inspectedValue.workspaceFolderValue ?? inspectedValue.workspaceValue ?? inspectedValue.userValue ?? inspectedValue.applicationValue ?? inspectedValue.defaultValue ?? "auto";
    }
    get onDidChangeReducedMotion() {
        return this._onDidChangeReducedMotion.event;
    }
    isMotionReduced() {
        const config = this._configMotionReduced;
        return config === "on" || (config === "auto" && this._systemMotionReduced);
    }
    get onDidChangeReducedTransparency() {
        return this._onDidChangeReducedTransparency.event;
    }
    isTransparencyReduced() {
        const config = this._configTransparencyReduced;
        return config === "on" || (config === "auto" && this._systemTransparencyReduced);
    }
    alwaysUnderlineAccessKeys() {
        return Promise.resolve(false);
    }
    getAccessibilitySupport() {
        return this._accessibilitySupport;
    }
    setAccessibilitySupport(accessibilitySupport) {
        if (this._accessibilitySupport === accessibilitySupport) {
            return;
        }
        this._accessibilitySupport = accessibilitySupport;
        this._onDidChangeScreenReaderOptimized.fire();
    }
    alert(message) {
        alert(message);
    }
    status(message) {
        status(message);
    }
};
AccessibilityService = ( __decorate([( __param(0, IContextKeyService)), ( __param(1, ILayoutService)), ( __param(2, IConfigurationService))], AccessibilityService));

export { AccessibilityService };
