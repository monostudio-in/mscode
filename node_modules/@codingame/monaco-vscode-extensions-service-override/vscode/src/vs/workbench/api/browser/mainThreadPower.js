
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { IPowerService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/power/common/powerService.service';

let MainThreadPower = class MainThreadPower extends Disposable {
    constructor(extHostContext, powerService) {
        super();
        this.powerService = powerService;
        this.proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostPower));
        this._register(this.powerService.onDidSuspend(this.proxy.$onDidSuspend, this.proxy));
        this._register(this.powerService.onDidResume(this.proxy.$onDidResume, this.proxy));
        this._register(
            this.powerService.onDidChangeOnBatteryPower(this.proxy.$onDidChangeOnBatteryPower, this.proxy)
        );
        this._register(
            this.powerService.onDidChangeThermalState(state => this.proxy.$onDidChangeThermalState(state), this)
        );
        this._register(
            this.powerService.onDidChangeSpeedLimit(this.proxy.$onDidChangeSpeedLimit, this.proxy)
        );
        this._register(this.powerService.onWillShutdown(this.proxy.$onWillShutdown, this.proxy));
        this._register(this.powerService.onDidLockScreen(this.proxy.$onDidLockScreen, this.proxy));
        this._register(
            this.powerService.onDidUnlockScreen(this.proxy.$onDidUnlockScreen, this.proxy)
        );
    }
    async $getSystemIdleState(idleThreshold) {
        return this.powerService.getSystemIdleState(idleThreshold);
    }
    async $getSystemIdleTime() {
        return this.powerService.getSystemIdleTime();
    }
    async $getCurrentThermalState() {
        return this.powerService.getCurrentThermalState();
    }
    async $isOnBatteryPower() {
        return this.powerService.isOnBatteryPower();
    }
    async $startPowerSaveBlocker(type) {
        return this.powerService.startPowerSaveBlocker(type);
    }
    async $stopPowerSaveBlocker(id) {
        return this.powerService.stopPowerSaveBlocker(id);
    }
    async $isPowerSaveBlockerStarted(id) {
        return this.powerService.isPowerSaveBlockerStarted(id);
    }
};
MainThreadPower = __decorate([extHostNamedCustomer(MainContext.MainThreadPower), ( __param(1, IPowerService))], MainThreadPower);

export { MainThreadPower };
