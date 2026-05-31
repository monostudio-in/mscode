

function isFolderBackupInfo(curr) {
    return curr?.hasOwnProperty('folderUri');
}
function isWorkspaceBackupInfo(curr) {
    return curr?.hasOwnProperty('workspace');
}

export { isFolderBackupInfo, isWorkspaceBackupInfo };
