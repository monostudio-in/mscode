import { URI } from "../../../../base/common/uri.js";
import { IWorkspace, WorkbenchState } from "../../../../platform/workspace/common/workspace.js";
import { Tags } from "./workspaceTags.js";
export declare const IWorkspaceTagsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkspaceTagsService>;
export interface IWorkspaceTagsService {
    readonly _serviceBrand: undefined;
    getTags(): Promise<Tags>;
    /**
    * Returns an id for the workspace, different from the id returned by the context service. A hash based
    * on the folder uri or workspace configuration, not time-based, and undefined for empty workspaces.
    */
    getTelemetryWorkspaceId(workspace: IWorkspace, state: WorkbenchState): Promise<string | undefined>;
    getHashedRemotesFromUri(workspaceUri: URI, stripEndingDotGit?: boolean): Promise<string[]>;
}
