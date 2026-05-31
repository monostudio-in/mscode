export interface IInvokeFunctionResult {
    result?: unknown;
    error?: string;
    summary: string;
    /** When present the function did not complete within the timeout. Pass this ID to {@link IPlaywrightService.waitForDeferredResult} to keep waiting. */
    deferredResultId?: string;
}
