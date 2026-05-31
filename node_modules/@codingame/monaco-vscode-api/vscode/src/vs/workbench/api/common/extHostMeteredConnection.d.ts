import { Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { ExtHostMeteredConnectionShape } from "./extHost.protocol.js";
export interface IExtHostMeteredConnection extends ExtHostMeteredConnectionShape {
    readonly _serviceBrand: undefined;
    readonly isConnectionMetered: boolean;
    readonly onDidChangeIsConnectionMetered: Event<boolean>;
}
export declare const IExtHostMeteredConnection: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostMeteredConnection>;
export declare class ExtHostMeteredConnection extends Disposable implements IExtHostMeteredConnection, ExtHostMeteredConnectionShape {
    readonly _serviceBrand: undefined;
    private _isConnectionMetered;
    private readonly _onDidChangeIsConnectionMetered;
    readonly onDidChangeIsConnectionMetered: Event<boolean>;
    constructor();
    get isConnectionMetered(): boolean;
    $initializeIsConnectionMetered(isMetered: boolean): void;
    $onDidChangeIsConnectionMetered(isMetered: boolean): void;
}
