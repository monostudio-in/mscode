import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { IChatStatusItemService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/chat/browser/chatStatus/chatStatusItemService.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { ChatStatusItemDto, MainThreadChatStatusShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
export declare class MainThreadChatStatus extends Disposable implements MainThreadChatStatusShape {
    private readonly _chatStatusItemService;
    constructor(_extHostContext: IExtHostContext, _chatStatusItemService: IChatStatusItemService);
    $setEntry(id: string, entry: ChatStatusItemDto): void;
    $disposeEntry(id: string): void;
}
