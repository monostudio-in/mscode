import { IStringDictionary } from "../../../../base/common/collections.js";
import { IProcessEnvironment } from "../../../../base/common/platform.js";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { IWorkspaceFolderData } from "../../../../platform/workspace/common/workspace.js";
import { ConfigurationResolverExpression } from "./configurationResolverExpression.js";
export declare const IConfigurationResolverService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IConfigurationResolverService>;
export interface IConfigurationResolverService {
    readonly _serviceBrand: undefined;
    /** Variables the resolver is able to resolve. */
    readonly resolvableVariables: ReadonlySet<string>;
    resolveWithEnvironment(environment: IProcessEnvironment, folder: IWorkspaceFolderData | undefined, value: string): Promise<string>;
    /**
    * Recursively resolves all variables in the given config and returns a copy of it with substituted values.
    * Command variables are only substituted if a "commandValueMapping" dictionary is given and if it contains an entry for the command.
    */
    resolveAsync<T>(folder: IWorkspaceFolderData | undefined, config: T): Promise<T extends ConfigurationResolverExpression<infer R> ? R : T>;
    /**
    * Recursively resolves all variables (including commands and user input) in the given config and returns a copy of it with substituted values.
    * If a "variables" dictionary (with names -> command ids) is given, command variables are first mapped through it before being resolved.
    *
    * @param section For example, 'tasks' or 'debug'. Used for resolving inputs.
    * @param variables Aliases for commands.
    */
    resolveWithInteractionReplace(folder: IWorkspaceFolderData | undefined, config: unknown, section?: string, variables?: IStringDictionary<string>, target?: ConfigurationTarget): Promise<any>;
    /**
    * Similar to resolveWithInteractionReplace, except without the replace. Returns a map of variables and their resolution.
    * Keys in the map will be of the format input:variableName or command:variableName.
    */
    resolveWithInteraction(folder: IWorkspaceFolderData | undefined, config: unknown, section?: string, variables?: IStringDictionary<string>, target?: ConfigurationTarget): Promise<Map<string, string> | undefined>;
    /**
    * Contributes a variable that can be resolved later. Consumers that use resolveAny, resolveWithInteraction,
    * and resolveWithInteractionReplace will have contributed variables resolved.
    */
    contributeVariable(variable: string, resolution: () => Promise<string | undefined>): void;
}
