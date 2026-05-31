import { URI } from "../../../../../base/common/uri.js";
export declare namespace LocalChatSessionUri {
    const scheme = "vscode-chat-session";
    function forSession(sessionId: string): URI;
    function getNewSessionUri(): URI;
    function parseLocalSessionId(resource: URI): string | undefined;
    function isLocalSession(resource: URI): boolean;
}
/**
 * Converts a chat session resource URI to a string ID.
 *
 * This exists mainly for backwards compatibility with existing code that uses string IDs in telemetry and storage.
 */
export declare function chatSessionResourceToId(resource: URI): string;
/**
 * Extracts the chat session type from a resource URI.
 *
 * @param resource - The chat session resource URI
 * @returns The session type string. Returns `localChatSessionType` for local sessions
 *          (vscodeChatEditor and vscodeLocalChatSession schemes), or the scheme/authority
 *          for contributed sessions.
 */
export declare function getChatSessionType(resource: URI): string;
export declare function isUntitledChatSession(resource: URI): boolean;
