import { Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { ExtHostPowerShape, PowerSaveBlockerType, PowerSystemIdleState, PowerThermalState } from "./extHost.protocol.js";
export declare class ExtHostPower extends Disposable implements ExtHostPowerShape {
    _serviceBrand: undefined;
    private readonly _proxy;
    private readonly _onDidSuspend;
    readonly onDidSuspend: Event<void>;
    private readonly _onDidResume;
    readonly onDidResume: Event<void>;
    private readonly _onDidChangeOnBatteryPower;
    readonly onDidChangeOnBatteryPower: Event<boolean>;
    private readonly _onDidChangeThermalState;
    readonly onDidChangeThermalState: Event<PowerThermalState>;
    private readonly _onDidChangeSpeedLimit;
    readonly onDidChangeSpeedLimit: Event<number>;
    private readonly _onWillShutdown;
    readonly onWillShutdown: Event<void>;
    private readonly _onDidLockScreen;
    readonly onDidLockScreen: Event<void>;
    private readonly _onDidUnlockScreen;
    readonly onDidUnlockScreen: Event<void>;
    constructor(extHostRpc: IExtHostRpcService);
    $onDidSuspend(): void;
    $onDidResume(): void;
    $onDidChangeOnBatteryPower(isOnBattery: boolean): void;
    $onDidChangeThermalState(state: PowerThermalState): void;
    $onDidChangeSpeedLimit(limit: number): void;
    $onWillShutdown(): void;
    $onDidLockScreen(): void;
    $onDidUnlockScreen(): void;
    getSystemIdleState(idleThresholdSeconds: number): Promise<PowerSystemIdleState>;
    getSystemIdleTime(): Promise<number>;
    getCurrentThermalState(): Promise<PowerThermalState>;
    isOnBatteryPower(): Promise<boolean>;
    startPowerSaveBlocker(type: PowerSaveBlockerType): Promise<{
        id: number;
        isStarted: boolean;
        dispose: () => void;
    }>;
}
export declare const IExtHostPower: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostPower>;
export interface IExtHostPower extends ExtHostPower, ExtHostPowerShape {
}
