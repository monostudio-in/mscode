import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ITextModel } from "../../../../common/model.js";
interface TypingIntervalResult {
    averageInterval: number;
    characterCount: number;
}
/**
 * Tracks typing speed as average milliseconds between keystrokes.
 * Higher values indicate slower typing.
 */
export declare class TypingInterval extends Disposable {
    private readonly _textModel;
    private readonly _typingSessions;
    private _currentSession;
    private _lastChangeTime;
    private _cachedTypingIntervalResult;
    private _cacheInvalidated;
    private static readonly MAX_SESSION_GAP_MS;
    private static readonly MIN_SESSION_DURATION_MS;
    private static readonly SESSION_HISTORY_LIMIT;
    private static readonly TYPING_SPEED_WINDOW_MS;
    private static readonly MIN_CHARS_FOR_RELIABLE_SPEED;
    /**
     * Gets the current typing interval as average milliseconds between keystrokes
     * and the number of characters involved in the computation.
     * Higher interval values indicate slower typing.
     * Returns { interval: 0, characterCount: 0 } if no typing data is available.
     */
    getTypingInterval(): TypingIntervalResult;
    constructor(_textModel: ITextModel);
    private _updateTypingSpeed;
    private _getActualCharacterCount;
    private _isUserTyping;
    private _isUserTypingReason;
    private _finalizeCurrentSession;
    private _calculateTypingInterval;
    private _calculateSpeedFromSessions;
    /**
     * Reset all typing speed data
     */
    reset(): void;
    dispose(): void;
}
export {};
