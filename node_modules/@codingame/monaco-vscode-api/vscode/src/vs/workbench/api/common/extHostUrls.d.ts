import type * as vscode from "vscode";
import { ExtHostUrlsShape } from "./extHost.protocol.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
export declare class ExtHostUrls implements ExtHostUrlsShape {
    _serviceBrand: undefined;
    private static HandlePool;
    private readonly _proxy;
    private handles;
    private handlers;
    constructor(extHostRpc: IExtHostRpcService);
    registerUriHandler(extension: IExtensionDescription, handler: vscode.UriHandler): vscode.Disposable;
    $handleExternalUri(handle: number, uri: UriComponents): Promise<void>;
    createAppUri(uri: URI): Promise<vscode.Uri>;
}
export interface IExtHostUrlsService extends ExtHostUrls {
}
export declare const IExtHostUrlsService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostUrlsService>;
