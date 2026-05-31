import { ExtHostSecretStateShape } from "./extHost.protocol.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
export declare class ExtHostSecretState implements ExtHostSecretStateShape {
    private _proxy;
    private _onDidChangePassword;
    readonly onDidChangePassword: import("../../../base/common/event.js").Event<{
        extensionId: string;
        key: string;
    }>;
    constructor(mainContext: IExtHostRpcService);
    $onDidChangePassword(e: {
        extensionId: string;
        key: string;
    }): Promise<void>;
    get(extensionId: string, key: string): Promise<string | undefined>;
    store(extensionId: string, key: string, value: string): Promise<void>;
    delete(extensionId: string, key: string): Promise<void>;
    keys(extensionId: string): Promise<string[]>;
}
export interface IExtHostSecretState extends ExtHostSecretState {
}
export declare const IExtHostSecretState: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostSecretState>;
