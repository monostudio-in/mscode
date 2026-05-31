
import { isUNC, toSlashes } from '../../../base/common/extpath.js';
import { parse } from '../../../base/common/json.js';
import { setProperty, applyEdits, removeProperty } from '../../../base/common/jsonEdit.js';
import { normalizeDriveLetter } from '../../../base/common/labels.js';
import { Schemas } from '../../../base/common/network.js';
import { posix, isAbsolute } from '../../../base/common/path.js';
import { isWindows, isLinux, isMacintosh } from '../../../base/common/platform.js';
import { isEqualAuthority } from '../../../base/common/resources.js';
import { URI } from '../../../base/common/uri.js';
import { getRemoteAuthority } from '../../remote/common/remoteHosts.js';
import { WorkspaceFolder } from '../../workspace/common/workspace.js';

function isRecentWorkspace(curr) {
    return curr.hasOwnProperty("workspace");
}
function isRecentFolder(curr) {
    return curr.hasOwnProperty("folderUri");
}
function isRecentFile(curr) {
    return curr.hasOwnProperty("fileUri");
}
function isStoredWorkspaceFolder(obj) {
    return isRawFileWorkspaceFolder(obj) || isRawUriWorkspaceFolder(obj);
}
function isRawFileWorkspaceFolder(obj) {
    const candidate = obj;
    return typeof candidate?.path === "string" && (!candidate.name || typeof candidate.name === "string");
}
function isRawUriWorkspaceFolder(obj) {
    const candidate = obj;
    return typeof candidate?.uri === "string" && (!candidate.name || typeof candidate.name === "string");
}
function getStoredWorkspaceFolder(folderURI, forceAbsolute, folderName, targetConfigFolderURI, extUri) {
    if (folderURI.scheme !== targetConfigFolderURI.scheme) {
        return {
            name: folderName,
            uri: ( folderURI.toString(true))
        };
    }
    let folderPath = !forceAbsolute ? extUri.relativePath(targetConfigFolderURI, folderURI) : undefined;
    if (folderPath !== undefined) {
        if (folderPath.length === 0) {
            folderPath = ".";
        } else {
            if (isWindows) {
                folderPath = massagePathForWindows(folderPath);
            }
        }
    }
    else {
        if (folderURI.scheme === Schemas.file) {
            folderPath = folderURI.fsPath;
            if (isWindows) {
                folderPath = massagePathForWindows(folderPath);
            }
        }
        else if (!extUri.isEqualAuthority(folderURI.authority, targetConfigFolderURI.authority)) {
            return {
                name: folderName,
                uri: ( folderURI.toString(true))
            };
        }
        else {
            folderPath = folderURI.path;
        }
    }
    return {
        name: folderName,
        path: folderPath
    };
}
function massagePathForWindows(folderPath) {
    folderPath = normalizeDriveLetter(folderPath);
    if (!isUNC(folderPath)) {
        folderPath = toSlashes(folderPath);
    }
    return folderPath;
}
function toWorkspaceFolders(configuredFolders, workspaceConfigFile, extUri) {
    const result = [];
    const seen = ( new Set());
    const relativeTo = extUri.dirname(workspaceConfigFile);
    for (const configuredFolder of configuredFolders) {
        let uri = undefined;
        if (isRawFileWorkspaceFolder(configuredFolder)) {
            if (configuredFolder.path) {
                uri = extUri.resolvePath(relativeTo, configuredFolder.path);
            }
        } else if (isRawUriWorkspaceFolder(configuredFolder)) {
            try {
                uri = ( URI.parse(configuredFolder.uri));
                if (uri.path[0] !== posix.sep) {
                    uri = uri.with({
                        path: posix.sep + uri.path
                    });
                }
            } catch (e) {
                console.warn(e);
            }
        }
        if (uri) {
            const comparisonKey = extUri.getComparisonKey(uri);
            if (!( seen.has(comparisonKey))) {
                seen.add(comparisonKey);
                const name = configuredFolder.name || extUri.basenameOrAuthority(uri);
                result.push(( new WorkspaceFolder({
                    uri,
                    name,
                    index: result.length
                }, configuredFolder)));
            }
        }
    }
    return result;
}
function rewriteWorkspaceFileForNewLocation(
    rawWorkspaceContents,
    configPathURI,
    isFromUntitledWorkspace,
    targetConfigPathURI,
    extUri
) {
    const storedWorkspace = doParseStoredWorkspace(configPathURI, rawWorkspaceContents);
    const sourceConfigFolder = extUri.dirname(configPathURI);
    const targetConfigFolder = extUri.dirname(targetConfigPathURI);
    const rewrittenFolders = [];
    for (const folder of storedWorkspace.folders) {
        const folderURI = isRawFileWorkspaceFolder(folder) ? extUri.resolvePath(sourceConfigFolder, folder.path) : ( URI.parse(folder.uri));
        let absolute;
        if (isFromUntitledWorkspace) {
            absolute = false;
        } else {
            absolute = !isRawFileWorkspaceFolder(folder) || isAbsolute(folder.path);
        }
        rewrittenFolders.push(
            getStoredWorkspaceFolder(folderURI, absolute, folder.name, targetConfigFolder, extUri)
        );
    }
    const formattingOptions = {
        insertSpaces: false,
        tabSize: 4,
        eol: (isLinux || isMacintosh) ? "\n" : "\r\n"
    };
    const edits = setProperty(rawWorkspaceContents, ["folders"], rewrittenFolders, formattingOptions);
    let newContent = applyEdits(rawWorkspaceContents, edits);
    if (isEqualAuthority(storedWorkspace.remoteAuthority, getRemoteAuthority(targetConfigPathURI))) {
        newContent = applyEdits(
            newContent,
            removeProperty(newContent, ["remoteAuthority"], formattingOptions)
        );
    }
    return newContent;
}
function doParseStoredWorkspace(path, contents) {
    const storedWorkspace = parse(contents);
    if (storedWorkspace && Array.isArray(storedWorkspace.folders)) {
        storedWorkspace.folders = storedWorkspace.folders.filter(folder => isStoredWorkspaceFolder(folder));
    } else {
        throw ( new Error(`${path} looks like an invalid workspace file.`));
    }
    return storedWorkspace;
}
function isSerializedRecentWorkspace(data) {
    const candidate = data;
    return typeof candidate?.workspace === "object" && typeof candidate.workspace.id === "string" && typeof candidate.workspace.configPath === "string";
}
function isSerializedRecentFolder(data) {
    const candidate = data;
    return typeof candidate?.folderUri === "string";
}
function isSerializedRecentFile(data) {
    const candidate = data;
    return typeof candidate?.fileUri === "string";
}
function restoreRecentlyOpened(data, logService) {
    const result = {
        workspaces: [],
        files: []
    };
    if (data) {
        const restoreGracefully = function(entries, onEntry) {
            for (let i = 0; i < entries.length; i++) {
                try {
                    onEntry(entries[i], i);
                } catch (e) {
                    logService.warn(
                        `Error restoring recent entry ${JSON.stringify(entries[i])}: ${( e.toString())}. Skip entry.`
                    );
                }
            }
        };
        const storedRecents = data;
        if (Array.isArray(storedRecents.entries)) {
            restoreGracefully(storedRecents.entries, entry => {
                const label = entry.label;
                const remoteAuthority = entry.remoteAuthority;
                if (isSerializedRecentWorkspace(entry)) {
                    result.workspaces.push({
                        label,
                        remoteAuthority,
                        workspace: {
                            id: entry.workspace.id,
                            configPath: ( URI.parse(entry.workspace.configPath))
                        }
                    });
                } else if (isSerializedRecentFolder(entry)) {
                    result.workspaces.push({
                        label,
                        remoteAuthority,
                        folderUri: ( URI.parse(entry.folderUri))
                    });
                } else if (isSerializedRecentFile(entry)) {
                    result.files.push({
                        label,
                        remoteAuthority,
                        fileUri: ( URI.parse(entry.fileUri))
                    });
                }
            });
        }
    }
    return result;
}
function toStoreData(recents) {
    const serialized = {
        entries: []
    };
    const storeLabel = (label, uri) => {
        return label && label !== uri.fsPath && label !== uri.path;
    };
    for (const recent of recents.workspaces) {
        if (isRecentFolder(recent)) {
            serialized.entries.push({
                folderUri: ( recent.folderUri.toString()),
                label: storeLabel(recent.label, recent.folderUri) ? recent.label : undefined,
                remoteAuthority: recent.remoteAuthority
            });
        } else {
            serialized.entries.push({
                workspace: {
                    id: recent.workspace.id,
                    configPath: ( recent.workspace.configPath.toString())
                },
                label: storeLabel(recent.label, recent.workspace.configPath) ? recent.label : undefined,
                remoteAuthority: recent.remoteAuthority
            });
        }
    }
    for (const recent of recents.files) {
        serialized.entries.push({
            fileUri: ( recent.fileUri.toString()),
            label: storeLabel(recent.label, recent.fileUri) ? recent.label : undefined,
            remoteAuthority: recent.remoteAuthority
        });
    }
    return serialized;
}

export { getStoredWorkspaceFolder, isRecentFile, isRecentFolder, isRecentWorkspace, isStoredWorkspaceFolder, restoreRecentlyOpened, rewriteWorkspaceFileForNewLocation, toStoreData, toWorkspaceFolders };
