
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { Emitter } from '../../../../base/common/event.js';
import { Barrier } from '../../../../base/common/async.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { StartupKind, LifecyclePhase, ShutdownReason, LifecyclePhaseToString } from './lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.service.js';
import { mark } from '../../../../base/common/performance.js';
import { WillSaveStateReason, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IStorageService } from '../../../../platform/storage/common/storage.service.js';

var AbstractLifecycleService_1;
let AbstractLifecycleService = class AbstractLifecycleService extends Disposable {
    static {
        AbstractLifecycleService_1 = this;
    }
    static {
        this.LAST_SHUTDOWN_REASON_KEY = "lifecyle.lastShutdownReason";
    }
    get startupKind() {
        return this._startupKind;
    }
    get shouldAttemptTaskReconnection() {
        return this.startupKind === StartupKind.ReloadedWindow;
    }
    get phase() {
        return this._phase;
    }
    get willShutdown() {
        return this._willShutdown;
    }
    constructor(logService, storageService) {
        super();
        this.logService = logService;
        this.storageService = storageService;
        this._onBeforeShutdown = this._register(( new Emitter()));
        this.onBeforeShutdown = this._onBeforeShutdown.event;
        this._onWillShutdown = this._register(( new Emitter()));
        this.onWillShutdown = this._onWillShutdown.event;
        this._onDidShutdown = this._register(( new Emitter()));
        this.onDidShutdown = this._onDidShutdown.event;
        this._onBeforeShutdownError = this._register(( new Emitter()));
        this.onBeforeShutdownError = this._onBeforeShutdownError.event;
        this._onShutdownVeto = this._register(( new Emitter()));
        this.onShutdownVeto = this._onShutdownVeto.event;
        this._phase = LifecyclePhase.Starting;
        this._willShutdown = false;
        this.phaseWhen = ( new Map());
        this._startupKind = this.resolveStartupKind();
        this._register(this.storageService.onWillSaveState(e => {
            if (e.reason === WillSaveStateReason.SHUTDOWN) {
                this.storageService.store(
                    AbstractLifecycleService_1.LAST_SHUTDOWN_REASON_KEY,
                    this.shutdownReason,
                    StorageScope.WORKSPACE,
                    StorageTarget.MACHINE
                );
            }
        }));
    }
    resolveStartupKind() {
        const startupKind = this.doResolveStartupKind() ?? StartupKind.NewWindow;
        this.logService.trace(`[lifecycle] starting up (startup kind: ${startupKind})`);
        return startupKind;
    }
    doResolveStartupKind() {
        const lastShutdownReason = this.storageService.getNumber(
            AbstractLifecycleService_1.LAST_SHUTDOWN_REASON_KEY,
            StorageScope.WORKSPACE
        );
        this.storageService.remove(
            AbstractLifecycleService_1.LAST_SHUTDOWN_REASON_KEY,
            StorageScope.WORKSPACE
        );
        let startupKind = undefined;
        switch (lastShutdownReason) {
        case ShutdownReason.RELOAD:
            startupKind = StartupKind.ReloadedWindow;
            break;
        case ShutdownReason.LOAD:
            startupKind = StartupKind.ReopenedWindow;
            break;
        }
        return startupKind;
    }
    set phase(value) {
        if (value < this.phase) {
            throw ( new Error("Lifecycle cannot go backwards"));
        }
        if (this._phase === value) {
            return;
        }
        this.logService.trace(`lifecycle: phase changed (value: ${value})`);
        this._phase = value;
        mark(`code/LifecyclePhase/${LifecyclePhaseToString(value)}`);
        const barrier = this.phaseWhen.get(this._phase);
        if (barrier) {
            barrier.open();
            this.phaseWhen.delete(this._phase);
        }
    }
    async when(phase) {
        if (phase <= this._phase) {
            return;
        }
        let barrier = this.phaseWhen.get(phase);
        if (!barrier) {
            barrier = ( new Barrier());
            this.phaseWhen.set(phase, barrier);
        }
        await barrier.wait();
    }
};
AbstractLifecycleService = AbstractLifecycleService_1 = ( __decorate([( __param(0, ILogService)), ( __param(1, IStorageService))], AbstractLifecycleService));

export { AbstractLifecycleService };
