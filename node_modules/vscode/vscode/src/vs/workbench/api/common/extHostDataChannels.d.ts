import type * as vscode from "vscode";
import { ExtHostDataChannelsShape } from "./extHost.protocol.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
export interface IExtHostDataChannels extends ExtHostDataChannelsShape {
    readonly _serviceBrand: undefined;
    createDataChannel<T>(extension: IExtensionDescription, channelId: string): vscode.DataChannel<T>;
}
export declare const IExtHostDataChannels: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostDataChannels>;
export declare class ExtHostDataChannels implements IExtHostDataChannels {
    readonly _serviceBrand: undefined;
    private readonly _channels;
    constructor();
    createDataChannel<T>(extension: IExtensionDescription, channelId: string): vscode.DataChannel<T>;
    $onDidReceiveData(channelId: string, data: any): void;
}
