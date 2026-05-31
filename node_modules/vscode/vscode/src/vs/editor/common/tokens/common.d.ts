export declare class RateLimiter {
    readonly timesPerSecond: number;
    private _lastRun;
    private readonly _minimumTimeBetweenRuns;
    constructor(timesPerSecond?: number);
    runIfNotLimited(callback: () => void): void;
}
