import { Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { WindowState } from "vscode";
import { ExtHostWindowShape, IOpenUriOptions } from "./extHost.protocol.js";
import { IExtHostInitDataService } from "./extHostInitDataService.js";
export declare class ExtHostWindow implements ExtHostWindowShape {
    _serviceBrand: undefined;
    private static InitialState;
    private _proxy;
    private readonly _onDidChangeWindowState;
    readonly onDidChangeWindowState: Event<WindowState>;
    private _nativeHandle;
    private _state;
    getState(): WindowState;
    constructor(initData: IExtHostInitDataService, extHostRpc: IExtHostRpcService);
    get nativeHandle(): Uint8Array | undefined;
    $onDidChangeActiveNativeWindowHandle(handle: string | undefined): void;
    $onDidChangeWindowFocus(value: boolean): void;
    $onDidChangeWindowActive(value: boolean): void;
    onDidChangeWindowProperty(property: keyof WindowState, value: boolean): void;
    openUri(stringOrUri: string | URI, options: IOpenUriOptions): Promise<boolean>;
    asExternalUri(uri: URI, options: IOpenUriOptions): Promise<URI>;
}
export declare const IExtHostWindow: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostWindow>;
export interface IExtHostWindow extends ExtHostWindow, ExtHostWindowShape {
}
