
import { Schemas } from '../../../base/common/network.js';

function isVirtualResource(resource) {
    return resource.scheme !== Schemas.file && resource.scheme !== Schemas.vscodeRemote;
}
function getVirtualWorkspaceLocation(workspace) {
    if (workspace.folders.length) {
        return workspace.folders.every(f => isVirtualResource(f.uri)) ? workspace.folders[0].uri : undefined;
    }
    else if (workspace.configuration && isVirtualResource(workspace.configuration)) {
        return workspace.configuration;
    }
    return undefined;
}
function getVirtualWorkspaceScheme(workspace) {
    return getVirtualWorkspaceLocation(workspace)?.scheme;
}
function getVirtualWorkspaceAuthority(workspace) {
    return getVirtualWorkspaceLocation(workspace)?.authority;
}
function isVirtualWorkspace(workspace) {
    return getVirtualWorkspaceLocation(workspace) !== undefined;
}

export { getVirtualWorkspaceAuthority, getVirtualWorkspaceLocation, getVirtualWorkspaceScheme, isVirtualResource, isVirtualWorkspace };
