
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { raceCancellation } from '@codingame/monaco-vscode-api/vscode/vs/base/common/async';
import { Event, Emitter } from '@codingame/monaco-vscode-api/vscode/vs/base/common/event';
import { DisposableStore } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { ILogService } from '@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { TextToSpeechStatus } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/speech/common/speechService';
import { ISpeechService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/speech/common/speechService.service';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';

let MainThreadSpeech = class MainThreadSpeech {
    constructor(extHostContext, speechService, logService) {
        this.speechService = speechService;
        this.logService = logService;
        this.providerRegistrations = ( new Map());
        this.speechToTextSessions = ( new Map());
        this.textToSpeechSessions = ( new Map());
        this.keywordRecognitionSessions = ( new Map());
        this.proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostSpeech));
    }
    $registerProvider(handle, identifier, metadata) {
        this.logService.trace("[Speech] extension registered provider", metadata.extension.value);
        const registration = this.speechService.registerSpeechProvider(identifier, {
            metadata,
            createSpeechToTextSession: (token, options) => {
                if (token.isCancellationRequested) {
                    return {
                        onDidChange: Event.None
                    };
                }
                const disposables = ( new DisposableStore());
                const session = Math.random();
                this.proxy.$createSpeechToTextSession(handle, session, options?.language);
                const onDidChange = disposables.add(( new Emitter()));
                this.speechToTextSessions.set(session, {
                    onDidChange
                });
                disposables.add(token.onCancellationRequested(() => {
                    this.proxy.$cancelSpeechToTextSession(session);
                    this.speechToTextSessions.delete(session);
                    disposables.dispose();
                }));
                return {
                    onDidChange: onDidChange.event
                };
            },
            createTextToSpeechSession: (token, options) => {
                if (token.isCancellationRequested) {
                    return {
                        onDidChange: Event.None,
                        synthesize: async () => {}
                    };
                }
                const disposables = ( new DisposableStore());
                const session = Math.random();
                this.proxy.$createTextToSpeechSession(handle, session, options?.language);
                const onDidChange = disposables.add(( new Emitter()));
                this.textToSpeechSessions.set(session, {
                    onDidChange
                });
                disposables.add(token.onCancellationRequested(() => {
                    this.proxy.$cancelTextToSpeechSession(session);
                    this.textToSpeechSessions.delete(session);
                    disposables.dispose();
                }));
                return {
                    onDidChange: onDidChange.event,
                    synthesize: async text => {
                        await this.proxy.$synthesizeSpeech(session, text);
                        const disposable = ( new DisposableStore());
                        try {
                            await raceCancellation(Event.toPromise(Event.filter(
                                onDidChange.event,
                                e => e.status === TextToSpeechStatus.Stopped,
                                disposable
                            ), disposable), token);
                        } finally {
                            disposable.dispose();
                        }
                    }
                };
            },
            createKeywordRecognitionSession: token => {
                if (token.isCancellationRequested) {
                    return {
                        onDidChange: Event.None
                    };
                }
                const disposables = ( new DisposableStore());
                const session = Math.random();
                this.proxy.$createKeywordRecognitionSession(handle, session);
                const onDidChange = disposables.add(( new Emitter()));
                this.keywordRecognitionSessions.set(session, {
                    onDidChange
                });
                disposables.add(token.onCancellationRequested(() => {
                    this.proxy.$cancelKeywordRecognitionSession(session);
                    this.keywordRecognitionSessions.delete(session);
                    disposables.dispose();
                }));
                return {
                    onDidChange: onDidChange.event
                };
            }
        });
        this.providerRegistrations.set(handle, {
            dispose: () => {
                registration.dispose();
            }
        });
    }
    $unregisterProvider(handle) {
        const registration = this.providerRegistrations.get(handle);
        if (registration) {
            registration.dispose();
            this.providerRegistrations.delete(handle);
        }
    }
    $emitSpeechToTextEvent(session, event) {
        const providerSession = this.speechToTextSessions.get(session);
        providerSession?.onDidChange.fire(event);
    }
    $emitTextToSpeechEvent(session, event) {
        const providerSession = this.textToSpeechSessions.get(session);
        providerSession?.onDidChange.fire(event);
    }
    $emitKeywordRecognitionEvent(session, event) {
        const providerSession = this.keywordRecognitionSessions.get(session);
        providerSession?.onDidChange.fire(event);
    }
    dispose() {
        this.providerRegistrations.forEach(disposable => disposable.dispose());
        this.providerRegistrations.clear();
        this.speechToTextSessions.forEach(session => session.onDidChange.dispose());
        this.speechToTextSessions.clear();
        this.textToSpeechSessions.forEach(session => session.onDidChange.dispose());
        this.textToSpeechSessions.clear();
        this.keywordRecognitionSessions.forEach(session => session.onDidChange.dispose());
        this.keywordRecognitionSessions.clear();
    }
};
MainThreadSpeech = __decorate([extHostNamedCustomer(MainContext.MainThreadSpeech), ( __param(1, ISpeechService)), ( __param(2, ILogService))], MainThreadSpeech);

export { MainThreadSpeech };
