import { IExtensionTerminalProfile, ITerminalProfile, TerminalIcon } from "./terminal.js";
import { type SingleOrMany } from "../../../base/common/types.js";
export declare function createProfileSchemaEnums(detectedProfiles: ITerminalProfile[], extensionProfiles?: readonly IExtensionTerminalProfile[]): {
    values: (string | null)[] | undefined;
    markdownDescriptions: string[] | undefined;
};
export declare function terminalProfileArgsMatch(args1: SingleOrMany<string> | undefined, args2: SingleOrMany<string> | undefined): boolean;
export declare function terminalIconsEqual(a?: TerminalIcon, b?: TerminalIcon): boolean;
