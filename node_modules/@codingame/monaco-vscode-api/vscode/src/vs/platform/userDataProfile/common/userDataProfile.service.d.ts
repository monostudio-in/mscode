import { Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
import { IAnyWorkspaceIdentifier } from "../../workspace/common/workspace.js";
import { IUserDataProfile, DidChangeProfilesEvent, IUserDataProfileOptions, IUserDataProfileUpdateOptions } from "./userDataProfile.js";
export declare const IUserDataProfilesService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataProfilesService>;
export interface IUserDataProfilesService {
    readonly _serviceBrand: undefined;
    readonly profilesHome: URI;
    readonly defaultProfile: IUserDataProfile;
    readonly onDidChangeProfiles: Event<DidChangeProfilesEvent>;
    readonly profiles: readonly IUserDataProfile[];
    readonly onDidResetWorkspaces: Event<void>;
    createNamedProfile(name: string, options?: IUserDataProfileOptions, workspaceIdentifier?: IAnyWorkspaceIdentifier): Promise<IUserDataProfile>;
    createTransientProfile(workspaceIdentifier?: IAnyWorkspaceIdentifier): Promise<IUserDataProfile>;
    createProfile(id: string, name: string, options?: IUserDataProfileOptions, workspaceIdentifier?: IAnyWorkspaceIdentifier): Promise<IUserDataProfile>;
    updateProfile(profile: IUserDataProfile, options?: IUserDataProfileUpdateOptions): Promise<IUserDataProfile>;
    removeProfile(profile: IUserDataProfile): Promise<void>;
    setProfileForWorkspace(workspaceIdentifier: IAnyWorkspaceIdentifier, profile: IUserDataProfile): Promise<void>;
    resetWorkspaces(): Promise<void>;
    cleanUp(): Promise<void>;
    cleanUpTransientProfiles(): Promise<void>;
}
