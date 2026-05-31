import { Event } from "../../../../base/common/event.js";
import { IShellLaunchConfig } from "../../../../platform/terminal/common/terminal.js";
import { IEmbedderTerminalOptions } from "@codingame/monaco-vscode-terminal-service-override/vscode/vs/workbench/services/terminal/common/embedderTerminalService";
export declare const IEmbedderTerminalService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IEmbedderTerminalService>;
/**
* Manages terminals that the embedder can create before the terminal contrib is available.
*/
export interface IEmbedderTerminalService {
    readonly _serviceBrand: undefined;
    readonly onDidCreateTerminal: Event<IShellLaunchConfig>;
    createTerminal(options: IEmbedderTerminalOptions): void;
}
