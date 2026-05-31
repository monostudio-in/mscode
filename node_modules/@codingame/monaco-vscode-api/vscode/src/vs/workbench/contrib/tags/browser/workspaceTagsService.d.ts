import { WorkbenchState, IWorkspace } from "../../../../platform/workspace/common/workspace.js";
import { URI } from "../../../../base/common/uri.js";
import { Tags } from "../common/workspaceTags.js";
import { IWorkspaceTagsService } from "../common/workspaceTags.service.js";
export declare class NoOpWorkspaceTagsService implements IWorkspaceTagsService {
    readonly _serviceBrand: undefined;
    getTags(): Promise<Tags>;
    getTelemetryWorkspaceId(workspace: IWorkspace, state: WorkbenchState): Promise<string | undefined>;
    getHashedRemotesFromUri(workspaceUri: URI, stripEndingDotGit?: boolean): Promise<string[]>;
}
