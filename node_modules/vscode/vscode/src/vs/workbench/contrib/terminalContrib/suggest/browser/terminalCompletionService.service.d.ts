import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Event } from "../../../../../base/common/event.js";
import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { ITerminalCapabilityStore } from "../../../../../platform/terminal/common/capabilities/capabilities.js";
import { TerminalShellType } from "../../../../../platform/terminal/common/terminal.js";
import { ITerminalCompletion } from "@codingame/monaco-vscode-terminal-service-override/vscode/vs/workbench/contrib/terminalContrib/suggest/browser/terminalCompletionItem";
import { ITerminalCompletionProvider } from "@codingame/monaco-vscode-terminal-service-override/vscode/vs/workbench/contrib/terminalContrib/suggest/browser/terminalCompletionService";
export declare const ITerminalCompletionService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITerminalCompletionService>;
export interface ITerminalCompletionService {
    _serviceBrand: undefined;
    readonly providers: IterableIterator<ITerminalCompletionProvider>;
    readonly onDidChangeProviders: Event<void>;
    registerTerminalCompletionProvider(extensionIdentifier: string, id: string, provider: ITerminalCompletionProvider, ...triggerCharacters: string[]): IDisposable;
    provideCompletions(promptValue: string, cursorPosition: number, allowFallbackCompletions: boolean, shellType: TerminalShellType | undefined, capabilities: ITerminalCapabilityStore, token: CancellationToken, triggerCharacter?: boolean, skipExtensionCompletions?: boolean, explicitlyInvoked?: boolean): Promise<ITerminalCompletion[] | undefined>;
}
