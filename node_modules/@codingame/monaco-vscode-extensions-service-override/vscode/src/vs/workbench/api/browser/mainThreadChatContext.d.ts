import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IChatContextItemDto, IDocumentFilterDto, MainThreadChatContextShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IChatContextService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/chat/browser/contextContrib/chatContextService.service";
export declare class MainThreadChatContext extends Disposable implements MainThreadChatContextShape {
    private readonly _chatContextService;
    private readonly _proxy;
    private readonly _providers;
    constructor(extHostContext: IExtHostContext, _chatContextService: IChatContextService);
    $registerChatWorkspaceContextProvider(handle: number, id: string): void;
    $registerChatExplicitContextProvider(handle: number, id: string): void;
    $registerChatResourceContextProvider(handle: number, id: string, selector: IDocumentFilterDto[]): void;
    $unregisterChatContextProvider(handle: number): void;
    $updateWorkspaceContextItems(handle: number, items: IChatContextItemDto[]): void;
    $executeChatContextItemCommand(itemHandle: number): Promise<void>;
}
