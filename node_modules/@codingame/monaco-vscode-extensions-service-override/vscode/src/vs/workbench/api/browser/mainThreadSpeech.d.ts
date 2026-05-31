import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { MainThreadSpeechShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IKeywordRecognitionEvent, ISpeechProviderMetadata, ISpeechToTextEvent, ITextToSpeechEvent } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/speech/common/speechService";
import { ISpeechService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/speech/common/speechService.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
export declare class MainThreadSpeech implements MainThreadSpeechShape {
    private readonly speechService;
    private readonly logService;
    private readonly proxy;
    private readonly providerRegistrations;
    private readonly speechToTextSessions;
    private readonly textToSpeechSessions;
    private readonly keywordRecognitionSessions;
    constructor(extHostContext: IExtHostContext, speechService: ISpeechService, logService: ILogService);
    $registerProvider(handle: number, identifier: string, metadata: ISpeechProviderMetadata): void;
    $unregisterProvider(handle: number): void;
    $emitSpeechToTextEvent(session: number, event: ISpeechToTextEvent): void;
    $emitTextToSpeechEvent(session: number, event: ITextToSpeechEvent): void;
    $emitKeywordRecognitionEvent(session: number, event: IKeywordRecognitionEvent): void;
    dispose(): void;
}
