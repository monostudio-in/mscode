import { Event } from "../../../../base/common/event.js";
import { IExtensionTerminalProfile } from "../../../../platform/terminal/common/terminal.js";
import { IExtensionTerminalCompletionProvider } from "@codingame/monaco-vscode-terminal-service-override/vscode/vs/workbench/contrib/terminal/common/terminalExtensionPoints";
export interface ITerminalContributionService {
    readonly _serviceBrand: undefined;
    readonly terminalProfiles: ReadonlyArray<IExtensionTerminalProfile>;
    readonly terminalCompletionProviders: ReadonlyArray<IExtensionTerminalCompletionProvider>;
    readonly onDidChangeTerminalCompletionProviders: Event<void>;
}
export declare const ITerminalContributionService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITerminalContributionService>;
