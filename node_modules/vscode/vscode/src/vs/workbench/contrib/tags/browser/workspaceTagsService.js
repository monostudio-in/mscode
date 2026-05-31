
import '../../../../platform/instantiation/common/extensions.js';
import '../../../../platform/instantiation/common/instantiation.js';

class NoOpWorkspaceTagsService {
    getTags() {
        return Promise.resolve({});
    }
    async getTelemetryWorkspaceId(workspace, state) {
        return undefined;
    }
    getHashedRemotesFromUri(workspaceUri, stripEndingDotGit) {
        return Promise.resolve([]);
    }
}

export { NoOpWorkspaceTagsService };
