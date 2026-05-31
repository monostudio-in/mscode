import { Event, IValueWithChangeEvent } from "../../../base/common/event.js";
import { Disposable, IDisposable } from "../../../base/common/lifecycle.js";
import { IAccessibilityService } from "../../accessibility/common/accessibility.service.js";
import { IConfigurationService } from "../../configuration/common/configuration.service.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.service.js";
import { IAccessibilitySignalService } from "./accessibilitySignalService.service.js";
/** Make sure you understand the doc comments of the method you want to call when using this token! */
export declare const AcknowledgeDocCommentsToken: unique symbol;
export type AccessibilityModality = "sound" | "announcement";
export interface IAccessbilitySignalOptions {
    allowManyInParallel?: boolean;
    modality?: AccessibilityModality;
    /**
     * The source that triggered the signal (e.g. "diffEditor.cursorPositionChanged").
     */
    source?: string;
    /**
     * For actions like save or format, depending on the
     * configured value, we will only
     * play the sound if the user triggered the action.
     */
    userGesture?: boolean;
    /**
     * The custom message to alert with.
     * This will override the default announcement message.
     */
    customAlertMessage?: string;
}
export declare class AccessibilitySignalService extends Disposable implements IAccessibilitySignalService {
    private readonly configurationService;
    private readonly accessibilityService;
    private readonly telemetryService;
    readonly _serviceBrand: undefined;
    private readonly sounds;
    private readonly screenReaderAttached;
    private readonly sentTelemetry;
    constructor(configurationService: IConfigurationService, accessibilityService: IAccessibilityService, telemetryService: ITelemetryService);
    getEnabledState(signal: AccessibilitySignal, userGesture: boolean, modality?: AccessibilityModality | undefined): IValueWithChangeEvent<boolean>;
    playSignal(signal: AccessibilitySignal, options?: IAccessbilitySignalOptions): Promise<void>;
    playSignals(signals: (AccessibilitySignal | {
        signal: AccessibilitySignal;
        source: string;
    })[]): Promise<void>;
    private sendSignalTelemetry;
    private getVolumeInPercent;
    private readonly playingSounds;
    playSound(sound: Sound, allowManyInParallel?: boolean): Promise<void>;
    playSignalLoop(signal: AccessibilitySignal, milliseconds: number): IDisposable;
    private readonly _signalConfigValue;
    private readonly _signalEnabledState;
    isAnnouncementEnabled(signal: AccessibilitySignal, userGesture?: boolean): boolean;
    isSoundEnabled(signal: AccessibilitySignal, userGesture?: boolean): boolean;
    onSoundEnabledChanged(signal: AccessibilitySignal): Event<void>;
    getDelayMs(signal: AccessibilitySignal, modality: AccessibilityModality, mode: "line" | "positional"): number;
}
/**
 * Corresponds to the audio files in ./media.
*/
export declare class Sound {
    readonly fileName: string;
    private static register;
    static readonly error: Sound;
    static readonly warning: Sound;
    static readonly success: Sound;
    static readonly foldedArea: Sound;
    static readonly break: Sound;
    static readonly quickFixes: Sound;
    static readonly taskCompleted: Sound;
    static readonly taskFailed: Sound;
    static readonly terminalBell: Sound;
    static readonly diffLineInserted: Sound;
    static readonly diffLineDeleted: Sound;
    static readonly diffLineModified: Sound;
    static readonly requestSent: Sound;
    static readonly responseReceived1: Sound;
    static readonly responseReceived2: Sound;
    static readonly responseReceived3: Sound;
    static readonly responseReceived4: Sound;
    static readonly clear: Sound;
    static readonly save: Sound;
    static readonly format: Sound;
    static readonly voiceRecordingStarted: Sound;
    static readonly voiceRecordingStopped: Sound;
    static readonly progress: Sound;
    static readonly chatEditModifiedFile: Sound;
    static readonly editsKept: Sound;
    static readonly editsUndone: Sound;
    static readonly nextEditSuggestion: Sound;
    static readonly terminalCommandSucceeded: Sound;
    static readonly chatUserActionRequired: Sound;
    static readonly codeActionTriggered: Sound;
    static readonly codeActionApplied: Sound;
    private constructor();
}
export declare class SoundSource {
    readonly randomOneOf: Sound[];
    constructor(randomOneOf: Sound[]);
    getSound(deterministic?: boolean): Sound;
}
export declare class AccessibilitySignal {
    readonly sound: SoundSource;
    readonly name: string;
    readonly legacySoundSettingsKey: string | undefined;
    readonly settingsKey: string;
    readonly legacyAnnouncementSettingsKey: string | undefined;
    readonly announcementMessage: string | undefined;
    readonly managesOwnEnablement: boolean;
    private constructor();
    private static _signals;
    private static register;
    static get allAccessibilitySignals(): AccessibilitySignal[];
    static readonly errorAtPosition: AccessibilitySignal;
    static readonly warningAtPosition: AccessibilitySignal;
    static readonly errorOnLine: AccessibilitySignal;
    static readonly warningOnLine: AccessibilitySignal;
    static readonly foldedArea: AccessibilitySignal;
    static readonly break: AccessibilitySignal;
    static readonly inlineSuggestion: AccessibilitySignal;
    static readonly nextEditSuggestion: AccessibilitySignal;
    static readonly terminalQuickFix: AccessibilitySignal;
    static readonly onDebugBreak: AccessibilitySignal;
    static readonly noInlayHints: AccessibilitySignal;
    static readonly taskCompleted: AccessibilitySignal;
    static readonly taskFailed: AccessibilitySignal;
    static readonly terminalCommandFailed: AccessibilitySignal;
    static readonly terminalCommandSucceeded: AccessibilitySignal;
    static readonly terminalBell: AccessibilitySignal;
    static readonly notebookCellCompleted: AccessibilitySignal;
    static readonly notebookCellFailed: AccessibilitySignal;
    static readonly diffLineInserted: AccessibilitySignal;
    static readonly diffLineDeleted: AccessibilitySignal;
    static readonly diffLineModified: AccessibilitySignal;
    static readonly chatEditModifiedFile: AccessibilitySignal;
    static readonly chatRequestSent: AccessibilitySignal;
    static readonly chatResponseReceived: AccessibilitySignal;
    static readonly codeActionTriggered: AccessibilitySignal;
    static readonly codeActionApplied: AccessibilitySignal;
    static readonly progress: AccessibilitySignal;
    static readonly clear: AccessibilitySignal;
    static readonly save: AccessibilitySignal;
    static readonly format: AccessibilitySignal;
    static readonly voiceRecordingStarted: AccessibilitySignal;
    static readonly voiceRecordingStopped: AccessibilitySignal;
    static readonly editsKept: AccessibilitySignal;
    static readonly editsUndone: AccessibilitySignal;
    static readonly chatUserActionRequired: AccessibilitySignal;
}
