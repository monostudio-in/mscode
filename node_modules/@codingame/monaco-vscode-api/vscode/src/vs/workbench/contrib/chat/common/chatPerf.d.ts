import { URI } from "../../../../base/common/uri.js";
/**
 * Well-defined perf scenarios for chat request lifecycle.
 * Each mark is a boundary of a measurable scenario — don't add marks
 * without defining what scenario they belong to.
 *
 * ## Scenarios
 *
 * **Time to UI Feedback** (perceived input lag):
 *   `request/start` → `request/uiUpdated`
 *
 * **Instruction Collection Overhead**:
 *   `request/willCollectInstructions` → `request/didCollectInstructions`
 *
 * **Extension Activation Wait** (first-request cold start):
 *   `code/chat/willWaitForActivation` → `code/chat/didWaitForActivation`
 *   (global marks, not session-scoped — emitted via {@link markChatGlobal})
 *
 * **Time to First Token** (the headline metric):
 *   `request/start` → `request/firstToken`
 *
 * **Total Request Duration**:
 *   `request/start` → `request/complete`
 *
 * **Agent Invocation Time** (LLM round-trip):
 *   `agent/willInvoke` → `agent/didInvoke`
 */
export declare const ChatPerfMark: {
    /** User pressed Enter / request initiated */
    readonly RequestStart: "request/start";
    /** Request added to model → UI shows the message */
    readonly RequestUiUpdated: "request/uiUpdated";
    /** Begin collecting .instructions.md / skills / hooks */
    readonly WillCollectInstructions: "request/willCollectInstructions";
    /** Done collecting instructions */
    readonly DidCollectInstructions: "request/didCollectInstructions";
    /** First streamed response content received */
    readonly FirstToken: "request/firstToken";
    /** Response fully complete */
    readonly RequestComplete: "request/complete";
    /** Agent invoke begins (LLM round-trip start) */
    readonly AgentWillInvoke: "agent/willInvoke";
    /** Agent invoke returns (LLM round-trip end) */
    readonly AgentDidInvoke: "agent/didInvoke";
};
/**
 * Emits a performance mark scoped to a chat session:
 * `code/chat/<sessionResource>/<name>`
 *
 * Marks are automatically cleaned up when the corresponding chat model is
 * disposed — see {@link clearChatMarks}.
 */
export declare function markChat(sessionResource: URI, name: string): void;
/**
 * Clears all performance marks for the given chat session.
 * Called when the chat model is disposed.
 */
export declare function clearChatMarks(sessionResource: URI): void;
/**
 * Well-defined one-time global perf marks (not scoped to a session).
 * These are emitted via {@link markChatGlobal} and are never cleared.
 */
export declare const ChatGlobalPerfMark: {
    /** Begin waiting for chat extension activation (SetupAgent) */
    readonly WillWaitForActivation: "willWaitForActivation";
    /** Extension activation + readiness complete (SetupAgent) */
    readonly DidWaitForActivation: "didWaitForActivation";
};
/**
 * Emits a global (non-session-scoped) performance mark:
 * `code/chat/<name>`
 *
 * Used for one-time marks like activation that should persist across requests.
 */
export declare function markChatGlobal(name: string): void;
