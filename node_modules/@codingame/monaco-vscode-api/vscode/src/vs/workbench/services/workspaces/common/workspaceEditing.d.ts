import { IAnyWorkspaceIdentifier } from "../../../../platform/workspace/common/workspace.js";
/**
 * An event that is fired after entering a workspace. Clients can join the entering
 * by providing a promise from the join method. This allows for long running operations
 * to complete (e.g. to migrate data into the new workspace) before the workspace
 * is fully entered.
 */
export interface IDidEnterWorkspaceEvent {
    readonly oldWorkspace: IAnyWorkspaceIdentifier;
    readonly newWorkspace: IAnyWorkspaceIdentifier;
    join(promise: Promise<void>): void;
}
