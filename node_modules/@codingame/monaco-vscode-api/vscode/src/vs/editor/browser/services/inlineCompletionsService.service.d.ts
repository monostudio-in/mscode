import { Event } from "../../../base/common/event.js";
export declare const IInlineCompletionsService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IInlineCompletionsService>;
export interface IInlineCompletionsService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeIsSnoozing: Event<boolean>;
    /**
    * Get the remaining time (in ms) for which inline completions should be snoozed,
    * or 0 if not snoozed.
    */
    readonly snoozeTimeLeft: number;
    /**
    * Snooze inline completions for the specified duration. If already snoozed, extend the snooze time.
    */
    snooze(durationMs?: number): void;
    /**
    * Snooze inline completions for the specified duration. If already snoozed, overwrite the existing snooze time.
    */
    setSnoozeDuration(durationMs: number): void;
    /**
    * Check if inline completions are currently snoozed.
    */
    isSnoozing(): boolean;
    /**
    * Cancel the current snooze.
    */
    cancelSnooze(): void;
    /**
    * Report an inline completion.
    */
    reportNewCompletion(requestUuid: string): void;
}
