import type { IStringDictionary } from "../../../../../base/common/collections.js";
import type { IConfigurationPropertySchema } from "../../../../../platform/configuration/common/configurationRegistry.js";
export declare enum TerminalStickyScrollSettingId {
    Enabled = "terminal.integrated.stickyScroll.enabled",
    MaxLineCount = "terminal.integrated.stickyScroll.maxLineCount",
    IgnoredCommands = "terminal.integrated.stickyScroll.ignoredCommands"
}
export interface ITerminalStickyScrollConfiguration {
    enabled: boolean;
    maxLineCount: number;
    ignoredCommands: string[];
}
export declare const terminalStickyScrollConfiguration: IStringDictionary<IConfigurationPropertySchema>;
