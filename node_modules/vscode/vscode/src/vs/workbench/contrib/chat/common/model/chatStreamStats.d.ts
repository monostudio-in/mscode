import { ILogService } from "../../../../../platform/log/common/log.service.js";
export interface IChatStreamStats {
    impliedWordLoadRate: number;
    lastWordCount: number;
}
export interface IChatStreamStatsInternal extends IChatStreamStats {
    totalTime: number;
    lastUpdateTime: number;
    firstMarkdownTime: number | undefined;
    bootstrapActive: boolean;
    wordCountAtBootstrapExit: number | undefined;
    updatesWithNewWords: number;
}
export interface IChatStreamUpdate {
    totalWordCount: number;
}
/**
 * Estimates the loading rate of a chat response stream so that we can try to match the rendering rate to
 * the rate at which text is actually produced by the model. This can only be an estimate for various reasons-
 * reasoning summaries don't represent real generated tokens, we don't have full visibility into tool calls,
 * some model providers send text in large chunks rather than a steady stream, e.g. Gemini, we don't know about
 * latency between agent requests, etc.
 *
 * When the first text is received, we don't know how long it actually took to generate. So we apply an assumed
 * minimum time, until we have received enough data to make a stable estimate. This is the "bootstrap" phase.
 *
 * Since we don't have visibility into when the model started generated tool call args, or when the client was running
 * a tool, we ignore long pauses. The ignore period is longer for large chunks, since those naturally take longer
 * to generate anyway.
 *
 * After that, the word load rate is estimated using the words received since the end of the bootstrap phase.
 */
export declare class ChatStreamStatsTracker {
    private readonly logService;
    private _data;
    private _publicData;
    constructor(logService: ILogService);
    get data(): IChatStreamStats;
    get internalData(): IChatStreamStatsInternal;
    update(totals: IChatStreamUpdate): IChatStreamStats | undefined;
    private trace;
}
