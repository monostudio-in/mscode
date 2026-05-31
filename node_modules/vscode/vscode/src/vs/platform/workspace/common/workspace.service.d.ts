import { Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
import { WorkbenchState, IWorkspaceFoldersWillChangeEvent, IWorkspaceFoldersChangeEvent, IWorkspace, IWorkspaceFolder, IWorkspaceIdentifier, ISingleFolderWorkspaceIdentifier } from "./workspace.js";
export declare const IWorkspaceContextService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IWorkspaceContextService>;
export interface IWorkspaceContextService {
    readonly _serviceBrand: undefined;
    /**
    * An event which fires on workbench state changes.
    */
    readonly onDidChangeWorkbenchState: Event<WorkbenchState>;
    /**
    * An event which fires on workspace name changes.
    */
    readonly onDidChangeWorkspaceName: Event<void>;
    /**
    * An event which fires before workspace folders change.
    */
    readonly onWillChangeWorkspaceFolders: Event<IWorkspaceFoldersWillChangeEvent>;
    /**
    * An event which fires on workspace folders change.
    */
    readonly onDidChangeWorkspaceFolders: Event<IWorkspaceFoldersChangeEvent>;
    /**
    * Provides access to the complete workspace object.
    */
    getCompleteWorkspace(): Promise<IWorkspace>;
    /**
    * Provides access to the workspace object the window is running with.
    * Use `getCompleteWorkspace` to get complete workspace object.
    */
    getWorkspace(): IWorkspace;
    /**
    * Return the state of the workbench.
    *
    * WorkbenchState.EMPTY - if the workbench was opened with empty window or file
    * WorkbenchState.FOLDER - if the workbench was opened with a folder
    * WorkbenchState.WORKSPACE - if the workbench was opened with a workspace
    */
    getWorkbenchState(): WorkbenchState;
    /**
    * Returns the folder for the given resource from the workspace.
    * Can be null if there is no workspace or the resource is not inside the workspace.
    */
    getWorkspaceFolder(resource: URI): IWorkspaceFolder | null;
    /**
    * Return `true` if the current workspace has the given identifier or root URI otherwise `false`.
    */
    isCurrentWorkspace(workspaceIdOrFolder: IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | URI): boolean;
    /**
    * Returns if the provided resource is inside the workspace or not.
    */
    isInsideWorkspace(resource: URI): boolean;
    /**
    * Return `true` if the current workspace has data (e.g. folders or a workspace configuration) that can be sent to the extension host, otherwise `false`.
    */
    hasWorkspaceData(): boolean;
}
