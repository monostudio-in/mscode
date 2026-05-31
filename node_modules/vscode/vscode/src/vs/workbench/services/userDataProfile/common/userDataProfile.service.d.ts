import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IUserDataProfile, type IUserDataProfileOptions, type IUserDataProfileUpdateOptions, type ProfileResourceTypeFlags } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { DidChangeUserDataProfileEvent, type IProfileTemplateInfo, type IUserDataProfileContentHandler, type IUserDataProfileCreateOptions, type IUserDataProfileTemplate } from "./userDataProfile.js";
export declare const IUserDataProfileService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IUserDataProfileService>;
export interface IUserDataProfileService {
    readonly _serviceBrand: undefined;
    readonly currentProfile: IUserDataProfile;
    readonly onDidChangeCurrentProfile: Event<DidChangeUserDataProfileEvent>;
    updateCurrentProfile(currentProfile: IUserDataProfile): Promise<void>;
}
export declare const IUserDataProfileManagementService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IUserDataProfileManagementService>;
export interface IUserDataProfileManagementService {
    readonly _serviceBrand: undefined;
    createProfile(name: string, options?: IUserDataProfileOptions): Promise<IUserDataProfile>;
    createAndEnterProfile(name: string, options?: IUserDataProfileOptions): Promise<IUserDataProfile>;
    createAndEnterTransientProfile(): Promise<IUserDataProfile>;
    removeProfile(profile: IUserDataProfile): Promise<void>;
    updateProfile(profile: IUserDataProfile, updateOptions: IUserDataProfileUpdateOptions): Promise<IUserDataProfile>;
    switchProfile(profile: IUserDataProfile): Promise<void>;
    getBuiltinProfileTemplates(): Promise<IProfileTemplateInfo[]>;
    getDefaultProfileToUse(): IUserDataProfile;
}
export declare const IUserDataProfileImportExportService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IUserDataProfileImportExportService>;
export interface IUserDataProfileImportExportService {
    readonly _serviceBrand: undefined;
    registerProfileContentHandler(id: string, profileContentHandler: IUserDataProfileContentHandler): IDisposable;
    unregisterProfileContentHandler(id: string): void;
    resolveProfileTemplate(uri: URI): Promise<IUserDataProfileTemplate | null>;
    exportProfile(profile: IUserDataProfile, exportFlags?: ProfileResourceTypeFlags): Promise<void>;
    createFromProfile(from: IUserDataProfile, options: IUserDataProfileCreateOptions, token: CancellationToken): Promise<IUserDataProfile | undefined>;
    createProfileFromTemplate(profileTemplate: IUserDataProfileTemplate, options: IUserDataProfileCreateOptions, token: CancellationToken): Promise<IUserDataProfile | undefined>;
    createTroubleshootProfile(): Promise<void>;
}
