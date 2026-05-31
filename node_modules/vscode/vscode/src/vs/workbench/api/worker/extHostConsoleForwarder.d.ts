import { AbstractExtHostConsoleForwarder } from "../common/extHostConsoleForwarder.js";
import { IExtHostInitDataService } from "../common/extHostInitDataService.js";
import { IExtHostRpcService } from "../common/extHostRpcService.js";
export declare class ExtHostConsoleForwarder extends AbstractExtHostConsoleForwarder {
    constructor(extHostRpc: IExtHostRpcService, initData: IExtHostInitDataService);
    protected _nativeConsoleLogMessage(_method: unknown, original: (...args: unknown[]) => void, args: unknown[]): void;
}
