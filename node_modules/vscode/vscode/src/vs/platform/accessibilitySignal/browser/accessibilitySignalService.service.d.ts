import { IValueWithChangeEvent, Event } from "../../../base/common/event.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { AccessibilitySignal, IAccessbilitySignalOptions, AccessibilityModality, Sound, AcknowledgeDocCommentsToken } from "./accessibilitySignalService.js";
export declare const IAccessibilitySignalService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IAccessibilitySignalService>;
export interface IAccessibilitySignalService {
    readonly _serviceBrand: undefined;
    playSignal(signal: AccessibilitySignal, options?: IAccessbilitySignalOptions): Promise<void>;
    playSignals(signals: (AccessibilitySignal | {
        signal: AccessibilitySignal;
        source: string;
    })[]): Promise<void>;
    playSignalLoop(signal: AccessibilitySignal, milliseconds: number): IDisposable;
    getEnabledState(signal: AccessibilitySignal, userGesture: boolean, modality?: AccessibilityModality | undefined): IValueWithChangeEvent<boolean>;
    getDelayMs(signal: AccessibilitySignal, modality: AccessibilityModality, mode: "line" | "positional"): number;
    /**
    * Avoid this method and prefer `.playSignal`!
    * Only use it when you want to play the sound regardless of enablement, e.g. in the settings quick pick.
    */
    playSound(signal: Sound, allowManyInParallel: boolean, token: typeof AcknowledgeDocCommentsToken): Promise<void>;
    /** @deprecated Use getEnabledState(...).onChange */
    isSoundEnabled(signal: AccessibilitySignal): boolean;
    /** @deprecated Use getEnabledState(...).value */
    isAnnouncementEnabled(signal: AccessibilitySignal): boolean;
    /** @deprecated Use getEnabledState(...).onChange */
    onSoundEnabledChanged(signal: AccessibilitySignal): Event<void>;
}
