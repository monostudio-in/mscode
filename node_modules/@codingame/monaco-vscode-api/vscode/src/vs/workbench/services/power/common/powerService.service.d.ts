import { Event } from "../../../../base/common/event.js";
import { ThermalState, SystemIdleState, PowerSaveBlockerType } from "./powerService.js";
export declare const IPowerService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IPowerService>;
/**
* A service for monitoring power state and preventing system sleep.
* Only fully functional in desktop environments. Web/remote returns stub values.
*/
export interface IPowerService {
    readonly _serviceBrand: undefined;
    readonly onDidSuspend: Event<void>;
    readonly onDidResume: Event<void>;
    readonly onDidChangeOnBatteryPower: Event<boolean>;
    readonly onDidChangeThermalState: Event<ThermalState>;
    readonly onDidChangeSpeedLimit: Event<number>;
    readonly onWillShutdown: Event<void>;
    readonly onDidLockScreen: Event<void>;
    readonly onDidUnlockScreen: Event<void>;
    getSystemIdleState(idleThreshold: number): Promise<SystemIdleState>;
    getSystemIdleTime(): Promise<number>;
    getCurrentThermalState(): Promise<ThermalState>;
    isOnBatteryPower(): Promise<boolean>;
    startPowerSaveBlocker(type: PowerSaveBlockerType): Promise<number>;
    stopPowerSaveBlocker(id: number): Promise<boolean>;
    isPowerSaveBlockerStarted(id: number): Promise<boolean>;
}
