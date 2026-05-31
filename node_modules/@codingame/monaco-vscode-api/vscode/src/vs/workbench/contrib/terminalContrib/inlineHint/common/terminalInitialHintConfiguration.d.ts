import { IStringDictionary } from "../../../../../base/common/collections.js";
import { IConfigurationPropertySchema } from "../../../../../platform/configuration/common/configurationRegistry.js";
export declare enum TerminalInitialHintSettingId {
    Enabled = "terminal.integrated.initialHint",
    CopilotCli = "terminal.integrated.initialHintCopilotCli"
}
export declare const terminalInitialHintConfiguration: IStringDictionary<IConfigurationPropertySchema>;
