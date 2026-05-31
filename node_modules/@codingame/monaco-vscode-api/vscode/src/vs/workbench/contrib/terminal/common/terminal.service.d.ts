import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { OperatingSystem, IProcessEnvironment } from "../../../../base/common/platform.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { SingleOrMany } from "../../../../base/common/types.js";
import { IShellLaunchConfig, ITerminalProfile, TerminalIcon, type IExtensionTerminalProfile } from "../../../../platform/terminal/common/terminal.js";
import { IShellLaunchConfigResolveOptions, type IRegisterContributedProfileArgs, type ITerminalProfileProvider } from "./terminal.js";
export declare const ITerminalProfileResolverService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITerminalProfileResolverService>;
export interface ITerminalProfileResolverService {
    readonly _serviceBrand: undefined;
    readonly defaultProfileName: string | undefined;
    /**
    * Resolves the icon of a shell launch config if this will use the default profile
    */
    resolveIcon(shellLaunchConfig: IShellLaunchConfig, os: OperatingSystem): void;
    resolveShellLaunchConfig(shellLaunchConfig: IShellLaunchConfig, options: IShellLaunchConfigResolveOptions): Promise<void>;
    getDefaultProfile(options: IShellLaunchConfigResolveOptions): Promise<ITerminalProfile>;
    getDefaultShell(options: IShellLaunchConfigResolveOptions): Promise<string>;
    getDefaultShellArgs(options: IShellLaunchConfigResolveOptions): Promise<SingleOrMany<string>>;
    getDefaultIcon(): TerminalIcon & ThemeIcon;
    getEnvironment(remoteAuthority: string | undefined): Promise<IProcessEnvironment>;
}
export declare const ITerminalProfileService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITerminalProfileService>;
export interface ITerminalProfileService {
    readonly _serviceBrand: undefined;
    readonly availableProfiles: ITerminalProfile[];
    readonly contributedProfiles: IExtensionTerminalProfile[];
    readonly profilesReady: Promise<void>;
    getPlatformKey(): Promise<string>;
    refreshAvailableProfiles(): void;
    getDefaultProfileName(): string | undefined;
    getDefaultProfile(os?: OperatingSystem): ITerminalProfile | undefined;
    readonly onDidChangeAvailableProfiles: Event<ITerminalProfile[]>;
    getContributedDefaultProfile(shellLaunchConfig: IShellLaunchConfig): Promise<IExtensionTerminalProfile | undefined>;
    registerContributedProfile(args: IRegisterContributedProfileArgs): Promise<void>;
    registerInternalContributedProfile(profile: IExtensionTerminalProfile): IDisposable;
    getContributedProfileProvider(extensionIdentifier: string, id: string): ITerminalProfileProvider | undefined;
    registerTerminalProfileProvider(extensionIdentifier: string, id: string, profileProvider: ITerminalProfileProvider): IDisposable;
    /**
    * Overrides the default contributed terminal profile. When set,
    * {@link getContributedDefaultProfile} returns the matching profile
    * regardless of the user's configuration. Dispose the returned
    * disposable to remove the override.
    */
    overrideDefaultProfile(extensionIdentifier: string, id: string): IDisposable;
}
