import { IStringDictionary } from "../../../base/common/collections.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
export declare function isConfigurationOverrides(obj: unknown): obj is IConfigurationOverrides;
export interface IConfigurationOverrides {
    overrideIdentifier?: string | null;
    resource?: URI | null;
}
export declare function isConfigurationUpdateOverrides(obj: unknown): obj is IConfigurationUpdateOverrides;
export type IConfigurationUpdateOverrides = Omit<IConfigurationOverrides, "overrideIdentifier"> & {
    overrideIdentifiers?: string[] | null;
};
export declare enum ConfigurationTarget {
    APPLICATION = 1,
    USER = 2,
    USER_LOCAL = 3,
    USER_REMOTE = 4,
    WORKSPACE = 5,
    WORKSPACE_FOLDER = 6,
    DEFAULT = 7,
    MEMORY = 8
}
export declare function ConfigurationTargetToString(configurationTarget: ConfigurationTarget): "APPLICATION" | "USER" | "USER_LOCAL" | "USER_REMOTE" | "WORKSPACE" | "WORKSPACE_FOLDER" | "DEFAULT" | "MEMORY";
export interface IConfigurationChange {
    keys: string[];
    overrides: [
        string,
        string[]
    ][];
}
export interface IConfigurationChangeEvent {
    readonly source: ConfigurationTarget;
    readonly affectedKeys: ReadonlySet<string>;
    readonly change: IConfigurationChange;
    affectsConfiguration(configuration: string, overrides?: IConfigurationOverrides): boolean;
}
export interface IInspectValue<T> {
    readonly value?: T;
    readonly override?: T;
    readonly overrides?: {
        readonly identifiers: string[];
        readonly value: T;
    }[];
}
export interface IConfigurationValue<T> {
    readonly defaultValue?: T;
    readonly applicationValue?: T;
    readonly userValue?: T;
    readonly userLocalValue?: T;
    readonly userRemoteValue?: T;
    readonly workspaceValue?: T;
    readonly workspaceFolderValue?: T;
    readonly memoryValue?: T;
    readonly policyValue?: T;
    readonly value?: T;
    readonly default?: IInspectValue<T>;
    readonly application?: IInspectValue<T>;
    readonly user?: IInspectValue<T>;
    readonly userLocal?: IInspectValue<T>;
    readonly userRemote?: IInspectValue<T>;
    readonly workspace?: IInspectValue<T>;
    readonly workspaceFolder?: IInspectValue<T>;
    readonly memory?: IInspectValue<T>;
    readonly policy?: {
        value?: T;
    };
    readonly overrideIdentifiers?: string[];
}
export declare function getConfigValueInTarget<T>(configValue: IConfigurationValue<T>, scope: ConfigurationTarget): T | undefined;
export declare function isConfigured<T>(configValue: IConfigurationValue<T>): configValue is IConfigurationValue<T> & {
    value: T;
};
export declare function isDefaultOverriden(settingName: string): boolean;
export interface IConfigurationUpdateOptions {
    /**
     * If `true`, do not notifies the error to user by showing the message box. Default is `false`.
     */
    donotNotifyError?: boolean;
    /**
     * How to handle dirty file when updating the configuration.
     */
    handleDirtyFile?: "save" | "revert";
}
export interface IConfigurationModel {
    contents: IStringDictionary<unknown>;
    keys: string[];
    overrides: IOverrides[];
    raw?: ReadonlyArray<IStringDictionary<unknown>> | IStringDictionary<unknown>;
}
export interface IOverrides {
    keys: string[];
    contents: IStringDictionary<unknown>;
    identifiers: string[];
}
export interface IConfigurationData {
    defaults: IConfigurationModel;
    policy: IConfigurationModel;
    application: IConfigurationModel;
    userLocal: IConfigurationModel;
    userRemote: IConfigurationModel;
    workspace: IConfigurationModel;
    folders: [
        UriComponents,
        IConfigurationModel
    ][];
}
export interface IConfigurationCompareResult {
    added: string[];
    removed: string[];
    updated: string[];
    overrides: [
        string,
        string[]
    ][];
}
export declare function toValuesTree(properties: IStringDictionary<unknown>, conflictReporter: (message: string) => void): IStringDictionary<unknown>;
export declare function addToValueTree(settingsTreeRoot: IStringDictionary<unknown>, key: string, value: unknown, conflictReporter: (message: string) => void): void;
export declare function removeFromValueTree(valueTree: IStringDictionary<unknown>, key: string): void;
/**
 * A helper function to get the configuration value with a specific settings path (e.g. config.some.setting)
 */
export declare function getConfigurationValue<T>(config: IStringDictionary<unknown>, settingPath: string): T | undefined;
export declare function getConfigurationValue<T>(config: IStringDictionary<unknown>, settingPath: string, defaultValue: T): T;
export declare function merge(base: IStringDictionary<unknown>, add: IStringDictionary<unknown>, overwrite: boolean): void;
export declare function getLanguageTagSettingPlainKey(settingKey: string): string;
