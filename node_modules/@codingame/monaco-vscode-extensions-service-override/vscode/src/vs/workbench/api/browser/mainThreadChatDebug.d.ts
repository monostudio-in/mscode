import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { IChatDebugService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/chat/common/chatDebugService.service";
import { IChatService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/chat/common/chatService/chatService.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IChatDebugEventDto, MainThreadChatDebugShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
export declare class MainThreadChatDebug extends Disposable implements MainThreadChatDebugShape {
    private readonly _chatDebugService;
    private readonly _chatService;
    private readonly _proxy;
    private readonly _providerDisposables;
    private readonly _activeSessionResources;
    private readonly _coreEventForwarder;
    constructor(extHostContext: IExtHostContext, _chatDebugService: IChatDebugService, _chatService: IChatService);
    $subscribeToCoreDebugEvents(): void;
    $unsubscribeFromCoreDebugEvents(): void;
    $registerChatDebugLogProvider(handle: number): void;
    $unregisterChatDebugLogProvider(handle: number): void;
    $acceptChatDebugEvent(handle: number, dto: IChatDebugEventDto): void;
    private _serializeEvent;
    private _reviveEvent;
    private _reviveResolvedContent;
}
