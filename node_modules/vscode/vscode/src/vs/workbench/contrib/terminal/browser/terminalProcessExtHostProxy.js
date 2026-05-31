
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ProcessPropertyType } from '../../../../platform/terminal/common/terminal.js';
import { ITerminalService } from './terminal.service.js';

let TerminalProcessExtHostProxy = class TerminalProcessExtHostProxy extends Disposable {
    get onProcessReady() {
        return this._onProcessReady.event;
    }
    constructor(instanceId, _cols, _rows, _terminalService) {
        super();
        this.instanceId = instanceId;
        this._cols = _cols;
        this._rows = _rows;
        this._terminalService = _terminalService;
        this.id = 0;
        this.shouldPersist = false;
        this._onProcessData = this._register(( new Emitter()));
        this.onProcessData = this._onProcessData.event;
        this._onProcessReady = this._register(( new Emitter()));
        this._onStart = this._register(( new Emitter()));
        this.onStart = this._onStart.event;
        this._onInput = this._register(( new Emitter()));
        this.onInput = this._onInput.event;
        this._onBinary = this._register(( new Emitter()));
        this.onBinary = this._onBinary.event;
        this._onResize = this._register(( new Emitter()));
        this.onResize = this._onResize.event;
        this._onAcknowledgeDataEvent = this._register(( new Emitter()));
        this.onAcknowledgeDataEvent = this._onAcknowledgeDataEvent.event;
        this._onShutdown = this._register(( new Emitter()));
        this.onShutdown = this._onShutdown.event;
        this._onRequestInitialCwd = this._register(( new Emitter()));
        this.onRequestInitialCwd = this._onRequestInitialCwd.event;
        this._onRequestCwd = this._register(( new Emitter()));
        this.onRequestCwd = this._onRequestCwd.event;
        this._onDidChangeProperty = this._register(( new Emitter()));
        this.onDidChangeProperty = this._onDidChangeProperty.event;
        this._onProcessExit = this._register(( new Emitter()));
        this.onProcessExit = this._onProcessExit.event;
        this._pendingInitialCwdRequests = [];
        this._pendingCwdRequests = [];
    }
    emitData(data) {
        this._onProcessData.fire(data);
    }
    emitTitle(title) {
        this._onDidChangeProperty.fire({
            type: ProcessPropertyType.Title,
            value: title
        });
    }
    emitReady(pid, cwd) {
        this._onProcessReady.fire({
            pid,
            cwd,
            windowsPty: undefined
        });
    }
    emitProcessProperty(
        {
            type,
            value
        }
    ) {
        switch (type) {
        case ProcessPropertyType.Cwd:
            this.emitCwd(value);
            break;
        case ProcessPropertyType.InitialCwd:
            this.emitInitialCwd(value);
            break;
        case ProcessPropertyType.Title:
            this.emitTitle(value);
            break;
        case ProcessPropertyType.OverrideDimensions:
            this.emitOverrideDimensions(value);
            break;
        case ProcessPropertyType.ResolvedShellLaunchConfig:
            this.emitResolvedShellLaunchConfig(value);
            break;
        }
    }
    emitExit(exitCode) {
        this._onProcessExit.fire(exitCode);
        this.dispose();
    }
    emitOverrideDimensions(dimensions) {
        this._onDidChangeProperty.fire({
            type: ProcessPropertyType.OverrideDimensions,
            value: dimensions
        });
    }
    emitResolvedShellLaunchConfig(shellLaunchConfig) {
        this._onDidChangeProperty.fire({
            type: ProcessPropertyType.ResolvedShellLaunchConfig,
            value: shellLaunchConfig
        });
    }
    emitInitialCwd(initialCwd) {
        while (this._pendingInitialCwdRequests.length > 0) {
            this._pendingInitialCwdRequests.pop()(initialCwd);
        }
    }
    emitCwd(cwd) {
        while (this._pendingCwdRequests.length > 0) {
            this._pendingCwdRequests.pop()(cwd);
        }
    }
    async start() {
        return this._terminalService.requestStartExtensionTerminal(this, this._cols, this._rows);
    }
    shutdown(immediate) {
        this._onShutdown.fire(immediate);
    }
    input(data) {
        this._onInput.fire(data);
    }
    sendSignal(signal) {}
    resize(cols, rows) {
        this._onResize.fire({
            cols,
            rows
        });
    }
    clearBuffer() {}
    acknowledgeDataEvent() {}
    async setUnicodeVersion(version) {}
    async processBinary(data) {
        this._onBinary.fire(data);
    }
    getInitialCwd() {
        return ( new Promise(resolve => {
            this._onRequestInitialCwd.fire();
            this._pendingInitialCwdRequests.push(resolve);
        }));
    }
    getCwd() {
        return ( new Promise(resolve => {
            this._onRequestCwd.fire();
            this._pendingCwdRequests.push(resolve);
        }));
    }
    async refreshProperty(type) {
        throw ( new Error("refreshProperty not implemented on extension host"));
    }
    async updateProperty(type, value) {}
};
TerminalProcessExtHostProxy = ( __decorate([( __param(3, ITerminalService))], TerminalProcessExtHostProxy));

export { TerminalProcessExtHostProxy };
