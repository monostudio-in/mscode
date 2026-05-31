import type * as vscode from "vscode";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { UriComponents } from "../../../base/common/uri.js";
import { ExtHostChatContextShape } from "./extHost.protocol.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
import { IChatContextItem } from "../../contrib/chat/common/contextContrib/chatContext.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { IExtHostCommands } from "./extHostCommands.js";
export declare class ExtHostChatContext extends Disposable implements ExtHostChatContextShape {
    private readonly _commands;
    _serviceBrand: undefined;
    private _proxy;
    private _handlePool;
    private _providers;
    private _itemPool;
    /** Global map of itemHandle -> original item for command execution with reference equality */
    private _globalItems;
    /** Track which items belong to which provider for cleanup */
    private _providerItems;
    constructor(extHostRpc: IExtHostRpcService, _commands: IExtHostCommands);
    $provideWorkspaceChatContext(handle: number, token: CancellationToken): Promise<IChatContextItem[]>;
    $provideExplicitChatContext(handle: number, token: CancellationToken): Promise<IChatContextItem[]>;
    $resolveExplicitChatContext(handle: number, context: IChatContextItem, token: CancellationToken): Promise<IChatContextItem>;
    $provideResourceChatContext(handle: number, options: {
        resource: UriComponents;
        withValue: boolean;
    }, token: CancellationToken): Promise<IChatContextItem | undefined>;
    $resolveResourceChatContext(handle: number, context: IChatContextItem, token: CancellationToken): Promise<IChatContextItem>;
    $executeChatContextItemCommand(itemHandle: number): Promise<void>;
    registerChatWorkspaceContextProvider(id: string, provider: vscode.ChatWorkspaceContextProvider): vscode.Disposable;
    registerChatExplicitContextProvider(id: string, provider: vscode.ChatExplicitContextProvider): vscode.Disposable;
    registerChatResourceContextProvider(selector: vscode.DocumentSelector, id: string, provider: vscode.ChatResourceContextProvider): vscode.Disposable;
    /**
     * @deprecated Use registerChatWorkspaceContextProvider, registerChatExplicitContextProvider, or registerChatResourceContextProvider instead.
     */
    registerChatContextProvider(selector: vscode.DocumentSelector | undefined, id: string, provider: vscode.ChatContextProvider): vscode.Disposable;
    private _clearProviderItems;
    private _addTrackedItem;
    private _convertItems;
    private _doResolve;
    private _listenForWorkspaceContextChanges;
    dispose(): void;
}
