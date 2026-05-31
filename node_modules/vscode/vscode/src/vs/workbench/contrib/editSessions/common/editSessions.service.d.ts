import { Event } from "../../../../base/common/event.js";
import { ILogService } from "../../../../platform/log/common/log.service.js";
import { IResourceRefHandle } from "../../../../platform/userDataSync/common/userDataSync.js";
import { SyncResource, EditSession } from "@codingame/monaco-vscode-edit-sessions-service-override/vscode/vs/workbench/contrib/editSessions/common/editSessions";
import { EditSessionsStoreClient } from "@codingame/monaco-vscode-edit-sessions-service-override/vscode/vs/workbench/contrib/editSessions/common/editSessionsStorageClient";
export declare const IEditSessionsStorageService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IEditSessionsStorageService>;
export interface IEditSessionsStorageService {
    _serviceBrand: undefined;
    readonly SIZE_LIMIT: number;
    readonly isSignedIn: boolean;
    readonly onDidSignIn: Event<void>;
    readonly onDidSignOut: Event<void>;
    storeClient: EditSessionsStoreClient | undefined;
    lastReadResources: Map<SyncResource, {
        ref: string;
        content: string;
    }>;
    lastWrittenResources: Map<SyncResource, {
        ref: string;
        content: string;
    }>;
    initialize(reason: "read" | "write", silent?: boolean): Promise<boolean>;
    read(resource: SyncResource, ref: string | undefined): Promise<{
        ref: string;
        content: string;
    } | undefined>;
    write(resource: SyncResource, content: string | EditSession): Promise<string>;
    delete(resource: SyncResource, ref: string | null): Promise<void>;
    list(resource: SyncResource): Promise<IResourceRefHandle[]>;
    getMachineById(machineId: string): Promise<string | undefined>;
}
export declare const IEditSessionsLogService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IEditSessionsLogService>;
export interface IEditSessionsLogService extends ILogService {
}
