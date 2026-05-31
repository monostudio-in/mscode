import type * as vscode from "vscode";
import * as extHostProtocol from "./extHost.protocol.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
export declare class ExtHostChatStatus {
    private readonly _proxy;
    private readonly _items;
    constructor(mainContext: extHostProtocol.IMainContext);
    createChatStatusItem(extension: IExtensionDescription, id: string): vscode.ChatStatusItem;
}
