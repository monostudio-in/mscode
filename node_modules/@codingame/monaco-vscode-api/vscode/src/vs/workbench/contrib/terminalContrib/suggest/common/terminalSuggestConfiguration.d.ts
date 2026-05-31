import type { IStringDictionary } from "../../../../../base/common/collections.js";
import { IConfigurationPropertySchema } from "../../../../../platform/configuration/common/configurationRegistry.js";
export declare enum TerminalSuggestSettingId {
    Enabled = "terminal.integrated.suggest.enabled",
    QuickSuggestions = "terminal.integrated.suggest.quickSuggestions",
    SuggestOnTriggerCharacters = "terminal.integrated.suggest.suggestOnTriggerCharacters",
    RunOnEnter = "terminal.integrated.suggest.runOnEnter",
    WindowsExecutableExtensions = "terminal.integrated.suggest.windowsExecutableExtensions",
    Providers = "terminal.integrated.suggest.providers",
    ShowStatusBar = "terminal.integrated.suggest.showStatusBar",
    CdPath = "terminal.integrated.suggest.cdPath",
    InlineSuggestion = "terminal.integrated.suggest.inlineSuggestion",
    UpArrowNavigatesHistory = "terminal.integrated.suggest.upArrowNavigatesHistory",
    SelectionMode = "terminal.integrated.suggest.selectionMode",
    InsertTrailingSpace = "terminal.integrated.suggest.insertTrailingSpace"
}
export declare const windowsDefaultExecutableExtensions: string[];
export declare const terminalSuggestConfigSection = "terminal.integrated.suggest";
export interface ITerminalSuggestConfiguration {
    enabled: boolean;
    quickSuggestions: boolean | ITerminalQuickSuggestionsOptions;
    suggestOnTriggerCharacters: boolean;
    runOnEnter: "never" | "exactMatch" | "exactMatchIgnoreExtension" | "always";
    windowsExecutableExtensions: {
        [key: string]: boolean;
    };
    providers: {
        [key: string]: boolean;
    };
    showStatusBar: boolean;
    cdPath: "off" | "relative" | "absolute";
    inlineSuggestion: "off" | "alwaysOnTopExceptExactMatch" | "alwaysOnTop";
    insertTrailingSpace: boolean;
}
export interface ITerminalQuickSuggestionsOptions {
    commands: "on" | "off";
    arguments: "on" | "off";
    unknown: "on" | "off";
}
/**
 * Normalizes the quickSuggestions config value to an object.
 * Handles migration from boolean values:
 * - `true` -> { commands: 'on', arguments: 'on', unknown: 'on' }
 * - `false` -> { commands: 'off', arguments: 'off', unknown: 'off' }
 * - object -> passed through as-is
 */
export declare function normalizeQuickSuggestionsConfig(config: ITerminalSuggestConfiguration["quickSuggestions"]): ITerminalQuickSuggestionsOptions;
export declare const terminalSuggestConfiguration: IStringDictionary<IConfigurationPropertySchema>;
export interface ITerminalSuggestProviderInfo {
    id: string;
    description?: string;
}
export declare function registerTerminalSuggestProvidersConfiguration(providers?: Map<string, ITerminalSuggestProviderInfo>): void;
