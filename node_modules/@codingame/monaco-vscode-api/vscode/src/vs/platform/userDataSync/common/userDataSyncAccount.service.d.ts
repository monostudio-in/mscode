import { Event } from "../../../base/common/event.js";
import { IUserDataSyncAccount } from "@codingame/monaco-vscode-user-data-sync-service-override/vscode/vs/platform/userDataSync/common/userDataSyncAccount";
export declare const IUserDataSyncAccountService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncAccountService>;
export interface IUserDataSyncAccountService {
    readonly _serviceBrand: undefined;
    readonly onTokenFailed: Event<boolean>;
    readonly account: IUserDataSyncAccount | undefined;
    readonly onDidChangeAccount: Event<IUserDataSyncAccount | undefined>;
    updateAccount(account: IUserDataSyncAccount | undefined): Promise<void>;
}
