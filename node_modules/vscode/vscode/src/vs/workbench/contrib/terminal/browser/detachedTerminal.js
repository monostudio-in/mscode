
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { getActiveWindow, addDisposableListener, EventType } from '../../../../base/browser/dom.js';
import { Delayer } from '../../../../base/common/async.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { Disposable, MutableDisposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { MicrotaskDelay } from '../../../../base/common/symbols.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { TerminalCapabilityStore } from '../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js';
import { TerminalExtensionsRegistry } from './terminalExtensions.js';
import { TerminalWidgetManager } from './widgets/widgetManager.js';
import { ProcessState } from '../common/terminal.js';

let DetachedTerminal = class DetachedTerminal extends Disposable {
    get xterm() {
        return this._xterm;
    }
    constructor(_xterm, options, instantiationService) {
        super();
        this._xterm = _xterm;
        this._widgets = this._register(( new TerminalWidgetManager()));
        this._contributions = ( new Map());
        this._attachDisposables = this._register(( new MutableDisposable()));
        this.onData = this._xterm.raw.onData;
        const capabilities = options.capabilities ?? ( new TerminalCapabilityStore());
        this._register(capabilities);
        this.capabilities = capabilities;
        this._register(_xterm);
        const contributionDescs = TerminalExtensionsRegistry.getTerminalContributions();
        for (const desc of contributionDescs) {
            if (( this._contributions.has(desc.id))) {
                onUnexpectedError(( new Error(`Cannot have two terminal contributions with the same id ${desc.id}`)));
                continue;
            }
            if (desc.canRunInDetachedTerminals === false) {
                continue;
            }
            let contribution;
            try {
                contribution = instantiationService.createInstance(desc.ctor, {
                    instance: this,
                    processManager: options.processInfo,
                    widgetManager: this._widgets
                });
                this._contributions.set(desc.id, contribution);
                this._register(contribution);
            } catch (err) {
                onUnexpectedError(err);
            }
        }
        this._register(( new Delayer(MicrotaskDelay))).trigger(() => {
            for (const contr of ( this._contributions.values())) {
                contr.xtermReady?.(this._xterm);
            }
        });
    }
    get selection() {
        return this._xterm && this.hasSelection() ? this._xterm.raw.getSelection() : undefined;
    }
    hasSelection() {
        return this._xterm.hasSelection();
    }
    clearSelection() {
        this._xterm.clearSelection();
    }
    focus(force) {
        if (force || !getActiveWindow().getSelection()?.toString()) {
            this.xterm.focus();
        }
    }
    attachToElement(container, options) {
        this.domElement = container;
        const screenElement = this._xterm.attachToElement(container, options);
        this._widgets.attachToElement(screenElement);
        const attachStore = ( new DisposableStore());
        const scheduleFocus = () => {
            setTimeout(() => this.focus(true), 0);
        };
        attachStore.add(
            addDisposableListener(container, EventType.MOUSE_DOWN, scheduleFocus)
        );
        this._attachDisposables.value = attachStore;
    }
    forceScrollbarVisibility() {
        this.domElement?.classList.add("force-scrollbar");
    }
    resetScrollbarVisibility() {
        this.domElement?.classList.remove("force-scrollbar");
    }
    getContribution(id) {
        return this._contributions.get(id);
    }
};
DetachedTerminal = ( __decorate([( __param(2, IInstantiationService))], DetachedTerminal));
class DetachedProcessInfo extends Disposable {
    constructor(initialValues) {
        super();
        this.processState = ProcessState.Running;
        this.ptyProcessReady = Promise.resolve();
        this.initialCwd = "";
        this.shouldPersist = false;
        this.hasWrittenData = false;
        this.hasChildProcesses = false;
        this.shellIntegrationNonce = "";
        Object.assign(this, initialValues);
        this.capabilities = this._register(( new TerminalCapabilityStore()));
    }
}

export { DetachedProcessInfo, DetachedTerminal };
