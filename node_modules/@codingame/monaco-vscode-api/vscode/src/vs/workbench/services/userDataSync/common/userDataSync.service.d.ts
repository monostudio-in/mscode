import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { IAuthenticationProvider, IResourcePreview, IUserDataSyncResource } from "../../../../platform/userDataSync/common/userDataSync.js";
import { IUserDataSyncAccount, AccountStatus } from "./userDataSync.js";
export declare const IUserDataSyncWorkbenchService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncWorkbenchService>;
export interface IUserDataSyncWorkbenchService {
    _serviceBrand: undefined;
    readonly enabled: boolean;
    readonly authenticationProviders: IAuthenticationProvider[];
    readonly current: IUserDataSyncAccount | undefined;
    readonly accountStatus: AccountStatus;
    readonly onDidChangeAccountStatus: Event<AccountStatus>;
    readonly onDidTurnOnSync: Event<void>;
    turnOn(): Promise<void>;
    turnoff(everyWhere: boolean): Promise<void>;
    signIn(): Promise<void>;
    resetSyncedData(): Promise<void>;
    showSyncActivity(): Promise<void>;
    syncNow(): Promise<void>;
    synchroniseUserDataSyncStoreType(): Promise<void>;
    showConflicts(conflictToOpen?: IResourcePreview): Promise<void>;
    accept(resource: IUserDataSyncResource, conflictResource: URI, content: string | null | undefined, apply: boolean): Promise<void>;
    getAllLogResources(): Promise<URI[]>;
    downloadSyncActivity(): Promise<URI | undefined>;
}
