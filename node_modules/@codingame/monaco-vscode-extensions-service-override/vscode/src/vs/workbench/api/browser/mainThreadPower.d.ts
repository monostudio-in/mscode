import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { MainThreadPowerShape, PowerSaveBlockerType, PowerSystemIdleState, PowerThermalState } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IPowerService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/power/common/powerService.service";
export declare class MainThreadPower extends Disposable implements MainThreadPowerShape {
    private readonly powerService;
    private readonly proxy;
    constructor(extHostContext: IExtHostContext, powerService: IPowerService);
    $getSystemIdleState(idleThreshold: number): Promise<PowerSystemIdleState>;
    $getSystemIdleTime(): Promise<number>;
    $getCurrentThermalState(): Promise<PowerThermalState>;
    $isOnBatteryPower(): Promise<boolean>;
    $startPowerSaveBlocker(type: PowerSaveBlockerType): Promise<number>;
    $stopPowerSaveBlocker(id: number): Promise<boolean>;
    $isPowerSaveBlockerStarted(id: number): Promise<boolean>;
}
