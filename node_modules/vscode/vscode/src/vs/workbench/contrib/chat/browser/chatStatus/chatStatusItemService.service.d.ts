import { Event } from "../../../../../base/common/event.js";
import { IChatStatusItemChangeEvent, ChatStatusEntry } from "@codingame/monaco-vscode-chat-service-override/vscode/vs/workbench/contrib/chat/browser/chatStatus/chatStatusItemService";
export declare const IChatStatusItemService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatStatusItemService>;
export interface IChatStatusItemService {
    readonly _serviceBrand: undefined;
    readonly onDidChange: Event<IChatStatusItemChangeEvent>;
    setOrUpdateEntry(entry: ChatStatusEntry): void;
    deleteEntry(id: string): void;
    getEntries(): Iterable<ChatStatusEntry>;
}
