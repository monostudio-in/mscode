import { Event } from "../../../../base/common/event.js";
import { ExtensionIdentifier, IExtensionDescription, IExtensionContributions, IExtension } from "../../../../platform/extensions/common/extensions.js";
import { ExtensionHostKind } from "./extensionHostKind.js";
import { IWillActivateEvent, IResponsiveStateChangeEvent, WillStopExtensionHostsEvent, ActivationKind, ExtensionActivationReason, ExtensionPointContribution, IExtensionsStatus, IExtensionInspectInfo } from "./extensions.js";
import { IExtensionPoint } from "./extensionsRegistry.js";
export declare const IExtensionService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtensionService>;
export interface IExtensionService {
    readonly _serviceBrand: undefined;
    /**
    * An event emitted when extensions are registered after their extension points got handled.
    *
    * This event will also fire on startup to signal the installed extensions.
    *
    * @returns the extensions that got registered
    */
    readonly onDidRegisterExtensions: Event<void>;
    /**
    * @event
    * Fired when extensions status changes.
    * The event contains the ids of the extensions that have changed.
    */
    readonly onDidChangeExtensionsStatus: Event<ExtensionIdentifier[]>;
    /**
    * Fired when the available extensions change (i.e. when extensions are added or removed).
    */
    readonly onDidChangeExtensions: Event<{
        readonly added: readonly IExtensionDescription[];
        readonly removed: readonly IExtensionDescription[];
    }>;
    /**
    * All registered extensions.
    * - List will be empty initially during workbench startup and will be filled with extensions as they are registered
    * - Listen to `onDidChangeExtensions` event for any changes to the extensions list. It will change as extensions get registered or de-reigstered.
    * - Listen to `onDidRegisterExtensions` event or wait for `whenInstalledExtensionsRegistered` promise to get the initial list of registered extensions.
    */
    readonly extensions: readonly IExtensionDescription[];
    /**
    * An event that is fired when activation happens.
    */
    readonly onWillActivateByEvent: Event<IWillActivateEvent>;
    /**
    * An event that is fired when an extension host changes its
    * responsive-state.
    */
    readonly onDidChangeResponsiveChange: Event<IResponsiveStateChangeEvent>;
    /**
    * Fired before stop of extension hosts happens. Allows listeners to veto against the
    * stop to prevent it from happening.
    */
    readonly onWillStop: Event<WillStopExtensionHostsEvent>;
    /**
    * Send an activation event and activate interested extensions.
    *
    * This will wait for the normal startup of the extension host(s).
    *
    * In extraordinary circumstances, if the activation event needs to activate
    * one or more extensions before the normal startup is finished, then you can use
    * `ActivationKind.Immediate`. Please do not use this flag unless really necessary
    * and you understand all consequences.
    */
    activateByEvent(activationEvent: string, activationKind?: ActivationKind): Promise<void>;
    /**
    * Send an activation ID and activate interested extensions.
    *
    */
    activateById(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<void>;
    /**
    * Determine if `activateByEvent(activationEvent)` has resolved already.
    *
    * i.e. the activation event is finished and all interested extensions are already active.
    */
    activationEventIsDone(activationEvent: string): boolean;
    /**
    * An promise that resolves when the installed extensions are registered after
    * their extension points got handled.
    */
    whenInstalledExtensionsRegistered(): Promise<boolean>;
    /**
    * Return a specific extension
    * @param id An extension id
    */
    getExtension(id: string): Promise<IExtensionDescription | undefined>;
    /**
    * Returns `true` if the given extension can be added. Otherwise `false`.
    * @param extension An extension
    */
    canAddExtension(extension: IExtensionDescription): boolean;
    /**
    * Returns `true` if the given extension can be removed. Otherwise `false`.
    * @param extension An extension
    */
    canRemoveExtension(extension: IExtensionDescription): boolean;
    /**
    * Read all contributions to an extension point.
    */
    readExtensionPointContributions<T extends IExtensionContributions[keyof IExtensionContributions]>(extPoint: IExtensionPoint<T>): Promise<ExtensionPointContribution<T>[]>;
    /**
    * Get information about extensions status.
    */
    getExtensionsStatus(): {
        [id: string]: IExtensionsStatus;
    };
    /**
    * Return the inspect ports (if inspection is possible) for extension hosts of kind `extensionHostKind`.
    */
    getInspectPorts(extensionHostKind: ExtensionHostKind, tryEnableInspector: boolean): Promise<IExtensionInspectInfo[]>;
    /**
    * Stops the extension hosts.
    *
    * @param reason a human readable reason for stopping the extension hosts. This maybe
    * can be presented to the user when showing dialogs.
    *
    * @param auto indicates if the operation was triggered by an automatic action
    *
    * @returns a promise that resolves to `true` if the extension hosts were stopped, `false`
    * if the operation was vetoed by listeners of the `onWillStop` event.
    */
    stopExtensionHosts(reason: string, auto?: boolean): Promise<boolean>;
    /**
    * Starts the extension hosts. If updates are provided, the extension hosts are started with the given updates.
    */
    startExtensionHosts(updates?: {
        readonly toAdd: readonly IExtension[];
        readonly toRemove: readonly string[];
    }): Promise<void>;
    /**
    * Modify the environment of the remote extension host
    * @param env New properties for the remote extension host
    */
    setRemoteEnvironment(env: {
        [key: string]: string | null;
    }): Promise<void>;
}
