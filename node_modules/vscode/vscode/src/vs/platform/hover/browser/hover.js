
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { Disposable, DisposableStore } from '../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../configuration/common/configuration.service.js';
import { isHTMLElement, addStandardDisposableListener } from '../../../base/browser/dom.js';
import { KeyCode } from '../../../base/common/keyCodes.js';
import { IHoverService } from './hover.service.js';

let WorkbenchHoverDelegate = class WorkbenchHoverDelegate extends Disposable {
    get delay() {
        if (this.isInstantlyHovering()) {
            return 0;
        }
        if (this.hoverOptions?.dynamicDelay) {
            return content => this.hoverOptions?.dynamicDelay?.(content) ?? this._delay;
        }
        return this._delay;
    }
    constructor(
        placement,
        hoverOptions,
        overrideOptions = {},
        configurationService,
        hoverService
    ) {
        super();
        this.placement = placement;
        this.hoverOptions = hoverOptions;
        this.overrideOptions = overrideOptions;
        this.configurationService = configurationService;
        this.hoverService = hoverService;
        this.lastHoverHideTime = 0;
        this.timeLimit = 200;
        this.hoverDisposables = this._register(( new DisposableStore()));
        this._delay = this.configurationService.getValue("workbench.hover.delay");
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("workbench.hover.delay")) {
                this._delay = this.configurationService.getValue("workbench.hover.delay");
            }
        }));
    }
    showHover(options, focus) {
        const overrideOptions = typeof this.overrideOptions === "function" ? this.overrideOptions(options, focus) : this.overrideOptions;
        this.hoverDisposables.clear();
        const targets = isHTMLElement(options.target) ? [options.target] : options.target.targetElements;
        for (const target of targets) {
            this.hoverDisposables.add(addStandardDisposableListener(target, "keydown", e => {
                if (e.equals(KeyCode.Escape)) {
                    this.hoverService.hideHover();
                }
            }));
        }
        const id = isHTMLElement(options.content) ? undefined : typeof options.content === "string" ? ( options.content.toString()) : options.content.value;
        return this.hoverService.showInstantHover({
            ...options,
            ...overrideOptions,
            persistence: {
                hideOnKeyDown: true,
                ...overrideOptions.persistence
            },
            id,
            appearance: {
                ...options.appearance,
                compact: true,
                skipFadeInAnimation: this.isInstantlyHovering(),
                ...overrideOptions.appearance
            }
        }, focus);
    }
    isInstantlyHovering() {
        return !!this.hoverOptions?.instantHover && Date.now() - this.lastHoverHideTime < this.timeLimit;
    }
    setInstantHoverTimeLimit(timeLimit) {
        if (!this.hoverOptions?.instantHover) {
            throw ( new Error("Instant hover is not enabled"));
        }
        this.timeLimit = timeLimit;
    }
    onDidHideHover() {
        this.hoverDisposables.clear();
        if (this.hoverOptions?.instantHover) {
            this.lastHoverHideTime = Date.now();
        }
    }
};
WorkbenchHoverDelegate = ( __decorate([( __param(3, IConfigurationService)), ( __param(4, IHoverService))], WorkbenchHoverDelegate));
const nativeHoverDelegate = {
    showHover: function() {
        throw ( new Error("Native hover function not implemented."));
    },
    delay: 0,
    showNativeHover: true
};

export { WorkbenchHoverDelegate, nativeHoverDelegate };
