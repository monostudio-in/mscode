import type { ThemeIcon } from "../../../../../base/common/themables.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.service.js";
import type { ITerminalCommand } from "../../../../../platform/terminal/common/capabilities/capabilities.js";
export declare enum DecorationSelector {
    CommandDecoration = "terminal-command-decoration",
    Hide = "hide",
    ErrorColor = "error",
    DefaultColor = "default-color",
    Default = "default",
    Codicon = "codicon",
    XtermDecoration = "xterm-decoration",
    OverviewRuler = ".xterm-decoration-overview-ruler"
}
export declare function getTerminalDecorationHoverContent(command: ITerminalCommand | undefined, hoverMessage?: string, showCommandActions?: boolean): string;
export interface ITerminalCommandDecorationPersistedState {
    exitCode?: number;
    timestamp?: number;
    duration?: number;
}
export declare enum TerminalCommandDecorationStatus {
    Unknown = "unknown",
    Running = "running",
    Success = "success",
    Error = "error"
}
export interface ITerminalCommandDecorationState {
    status: TerminalCommandDecorationStatus;
    icon: ThemeIcon;
    classNames: string[];
    exitCode?: number;
    exitCodeText: string;
    startTimestamp?: number;
    startText: string;
    duration?: number;
    durationText: string;
    hoverMessage: string;
}
export declare function getTerminalCommandDecorationTooltip(command?: ITerminalCommand, storedState?: ITerminalCommandDecorationPersistedState): string;
export declare function getTerminalCommandDecorationState(command: ITerminalCommand | undefined, storedState?: ITerminalCommandDecorationPersistedState, now?: number): ITerminalCommandDecorationState;
export declare function updateLayout(configurationService: IConfigurationService, element?: HTMLElement): void;
