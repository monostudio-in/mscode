import { IMarkdownString } from "../../../../../../base/common/htmlContent.js";
import { IObservable } from "../../../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { ConfirmedReason, IChatToolInvocation, IChatToolInvocationSerialized, ToolConfirmKind } from "../../chatService/chatService.js";
import { IPreparedToolInvocation, IToolConfirmationMessages, IToolData, IToolProgressStep, IToolResult, ToolDataSource } from "../../tools/languageModelToolsService.js";
export interface IStreamingToolCallOptions {
    toolCallId: string;
    toolId: string;
    toolData: IToolData;
    subagentInvocationId?: string;
    chatRequestId?: string;
}
export declare class ChatToolInvocation implements IChatToolInvocation {
    readonly toolCallId: string;
    readonly kind: "toolInvocation";
    invocationMessage: string | IMarkdownString;
    readonly originMessage: string | IMarkdownString | undefined;
    pastTenseMessage: string | IMarkdownString | undefined;
    confirmationMessages: IToolConfirmationMessages | undefined;
    presentation: IPreparedToolInvocation["presentation"];
    readonly toolId: string;
    readonly icon?: ThemeIcon;
    source: ToolDataSource;
    readonly subAgentInvocationId: string | undefined;
    parameters: unknown;
    generatedTitle?: string;
    readonly chatRequestId?: string;
    isAttachedToThinking: boolean;
    private _toolSpecificData?;
    private readonly _toolSpecificDataKind;
    readonly toolSpecificDataKind: IObservable<string | undefined>;
    get toolSpecificData(): typeof this._toolSpecificData;
    set toolSpecificData(value: typeof this._toolSpecificData);
    private readonly _progress;
    private readonly _state;
    private readonly _partialInput;
    private readonly _streamingMessage;
    get state(): IObservable<IChatToolInvocation.State>;
    /**
     * Create a tool invocation in streaming state.
     * Use this when the tool call is beginning to stream partial input from the LM.
     */
    static createStreaming(options: IStreamingToolCallOptions): ChatToolInvocation;
    /**
     * Create a tool invocation already in cancelled state.
     * Use this when a hook denies tool execution before it even starts.
     */
    static createCancelled(options: IStreamingToolCallOptions, parameters: unknown, reason: ToolConfirmKind.Denied | ToolConfirmKind.Skipped, reasonMessage?: string | IMarkdownString): ChatToolInvocation;
    constructor(preparedInvocation: IPreparedToolInvocation | undefined, toolData: IToolData, toolCallId: string, subAgentInvocationId: string | undefined, parameters: unknown, startOptions?: {
        startInStreaming?: boolean;
        startInCancelled?: boolean;
        cancelReason?: ToolConfirmKind.Denied | ToolConfirmKind.Skipped;
        cancelReasonMessage?: string | IMarkdownString;
    }, chatRequestId?: string);
    /**
     * Update the partial input observable during streaming.
     */
    updatePartialInput(input: unknown): void;
    /**
     * Update the streaming message (from handleToolStream).
     */
    updateStreamingMessage(message: string | IMarkdownString): void;
    /**
     * Notifies state observers that `toolSpecificData` has been mutated.
     * Since `toolSpecificData` isn't observable, this re-sets the internal
     * state to trigger autoruns that need to re-read tool metadata.
     */
    notifyToolSpecificDataChanged(): void;
    /**
     * Cancel a streaming invocation directly (e.g., when preToolUse hook denies).
     * Only works when in Streaming state.
     * @returns true if the cancellation was applied, false if not in streaming state
     */
    cancelFromStreaming(reason: ToolConfirmKind.Denied | ToolConfirmKind.Skipped, reasonMessage?: string | IMarkdownString): boolean;
    /**
     * Transition from streaming state to prepared/executing state.
     * Called when the full tool call is ready.
     */
    transitionFromStreaming(preparedInvocation: IPreparedToolInvocation | undefined, parameters: unknown, autoConfirmed: ConfirmedReason | undefined): void;
    private _setCompleted;
    didExecuteTool(result: IToolResult | undefined, final?: boolean, checkIfResultAutoApproved?: () => Promise<ConfirmedReason | undefined>): Promise<IChatToolInvocation.State>;
    acceptProgress(step: IToolProgressStep): void;
    toJSON(): IChatToolInvocationSerialized;
}
