import { Event } from "../../../../base/common/event.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { IAnyWorkspaceIdentifier } from "../../../../platform/workspace/common/workspace.js";
import { RestrictedSettings } from "./configuration.js";
export declare const IWorkbenchConfigurationService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkbenchConfigurationService>;
export interface IWorkbenchConfigurationService extends IConfigurationService {
    /**
    * Restricted settings defined in each configuration target
    */
    readonly restrictedSettings: RestrictedSettings;
    /**
    * Event that triggers when the restricted settings changes
    */
    readonly onDidChangeRestrictedSettings: Event<RestrictedSettings>;
    /**
    * A promise that resolves when the remote configuration is loaded in a remote window.
    * The promise is resolved immediately if the window is not remote.
    */
    whenRemoteConfigurationLoaded(): Promise<void>;
    /**
    * Initialize configuration service for the given workspace
    * @param arg workspace Identifier
    */
    initialize(arg: IAnyWorkspaceIdentifier): Promise<void>;
    /**
    * Returns true if the setting can be applied for all profiles otherwise false.
    * @param setting
    */
    isSettingAppliedForAllProfiles(setting: string): boolean;
}
