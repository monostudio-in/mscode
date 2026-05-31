import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { ISpeechProvider, ISpeechToTextSession, ITextToSpeechSession, KeywordRecognitionStatus } from "./speechService.js";
export declare const ISpeechService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISpeechService>;
export interface ISpeechService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeHasSpeechProvider: Event<void>;
    readonly hasSpeechProvider: boolean;
    registerSpeechProvider(identifier: string, provider: ISpeechProvider): IDisposable;
    readonly onDidStartSpeechToTextSession: Event<void>;
    readonly onDidEndSpeechToTextSession: Event<void>;
    readonly hasActiveSpeechToTextSession: boolean;
    /**
    * Starts to transcribe speech from the default microphone. The returned
    * session object provides an event to subscribe for transcribed text.
    */
    createSpeechToTextSession(token: CancellationToken, context?: string): Promise<ISpeechToTextSession>;
    readonly onDidStartTextToSpeechSession: Event<void>;
    readonly onDidEndTextToSpeechSession: Event<void>;
    readonly hasActiveTextToSpeechSession: boolean;
    /**
    * Creates a synthesizer to synthesize speech from text. The returned
    * session object provides a method to synthesize text and listen for
    * events.
    */
    createTextToSpeechSession(token: CancellationToken, context?: string): Promise<ITextToSpeechSession>;
    readonly onDidStartKeywordRecognition: Event<void>;
    readonly onDidEndKeywordRecognition: Event<void>;
    readonly hasActiveKeywordRecognition: boolean;
    /**
    * Starts to recognize a keyword from the default microphone. The returned
    * status indicates if the keyword was recognized or if the session was
    * stopped.
    */
    recognizeKeyword(token: CancellationToken): Promise<KeywordRecognitionStatus>;
}
