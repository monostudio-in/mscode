import { Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
import { IWorkspaceBackupInfo, IFolderBackupInfo } from "../../backup/common/backup.js";
import { IWorkspaceIdentifier } from "../../workspace/common/workspace.js";
import { IEnterWorkspaceResult, IWorkspaceFolderCreationData, IRecent, IRecentlyOpened } from "./workspaces.js";
export declare const IWorkspacesService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IWorkspacesService>;
export interface IWorkspacesService {
    readonly _serviceBrand: undefined;
    enterWorkspace(workspaceUri: URI): Promise<IEnterWorkspaceResult | undefined>;
    createUntitledWorkspace(folders?: IWorkspaceFolderCreationData[], remoteAuthority?: string): Promise<IWorkspaceIdentifier>;
    deleteUntitledWorkspace(workspace: IWorkspaceIdentifier): Promise<void>;
    getWorkspaceIdentifier(workspaceUri: URI): Promise<IWorkspaceIdentifier>;
    readonly onDidChangeRecentlyOpened: Event<void>;
    addRecentlyOpened(recents: IRecent[]): Promise<void>;
    removeRecentlyOpened(workspaces: URI[]): Promise<void>;
    clearRecentlyOpened(): Promise<void>;
    getRecentlyOpened(): Promise<IRecentlyOpened>;
    getDirtyWorkspaces(): Promise<Array<IWorkspaceBackupInfo | IFolderBackupInfo>>;
}
