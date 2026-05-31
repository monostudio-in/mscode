import { IChatModel } from "./model/chatModel.js";
import { type IChatSessionStats, type IChatTerminalToolInvocationData, type ILegacyChatTerminalToolInvocationData } from "./chatService/chatService.js";
import { ChatModeKind } from "./constants.js";
export declare function checkModeOption(mode: ChatModeKind, option: boolean | ((mode: ChatModeKind) => boolean) | undefined): boolean | undefined;
/**
 * @deprecated This is the old API shape, we should support this for a while before removing it so
 * we don't break existing chats
 */
export declare function migrateLegacyTerminalToolSpecificData(data: IChatTerminalToolInvocationData | ILegacyChatTerminalToolInvocationData): IChatTerminalToolInvocationData;
export declare function awaitStatsForSession(model: IChatModel): Promise<IChatSessionStats | undefined>;
