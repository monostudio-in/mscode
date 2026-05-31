
import { getErrorMessage } from '@codingame/monaco-vscode-api/vscode/vs/base/common/errors';
import { IEnvironmentService } from '@codingame/monaco-vscode-api/vscode/vs/platform/environment/common/environment.service';
import { IExtensionStorageService } from '@codingame/monaco-vscode-api/vscode/vs/platform/extensionManagement/common/extensionStorage.service';
import { FileSystemProviderErrorCode } from '@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files';
import { IFileService } from '@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files.service';
import { ILogService } from '@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service';
import { StorageScope, StorageTarget } from '@codingame/monaco-vscode-api/vscode/vs/platform/storage/common/storage';
import { IStorageService } from '@codingame/monaco-vscode-api/vscode/vs/platform/storage/common/storage.service';
import { IUriIdentityService } from '@codingame/monaco-vscode-api/vscode/vs/platform/uriIdentity/common/uriIdentity.service';
import { IUserDataProfilesService } from '@codingame/monaco-vscode-api/vscode/vs/platform/userDataProfile/common/userDataProfile.service';
import { IWorkspaceContextService } from '@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspace.service';

async function migrateExtensionStorage(fromExtensionId, toExtensionId, global, instantionService) {
    return instantionService.invokeFunction(async (serviceAccessor) => {
        const environmentService = serviceAccessor.get(IEnvironmentService);
        const userDataProfilesService = serviceAccessor.get(IUserDataProfilesService);
        const extensionStorageService = serviceAccessor.get(IExtensionStorageService);
        const storageService = serviceAccessor.get(IStorageService);
        const uriIdentityService = serviceAccessor.get(IUriIdentityService);
        const fileService = serviceAccessor.get(IFileService);
        const workspaceContextService = serviceAccessor.get(IWorkspaceContextService);
        const logService = serviceAccessor.get(ILogService);
        const storageMigratedKey = `extensionStorage.migrate.${fromExtensionId}-${toExtensionId}`;
        const migrateLowerCaseStorageKey = fromExtensionId.toLowerCase() === toExtensionId.toLowerCase() ? `extension.storage.migrateFromLowerCaseKey.${fromExtensionId.toLowerCase()}` : undefined;
        if (fromExtensionId === toExtensionId) {
            return;
        }
        const getExtensionStorageLocation = (extensionId, global) => {
            if (global) {
                return uriIdentityService.extUri.joinPath(userDataProfilesService.defaultProfile.globalStorageHome, extensionId.toLowerCase() );
            }
            return uriIdentityService.extUri.joinPath(environmentService.workspaceStorageHome, workspaceContextService.getWorkspace().id, extensionId);
        };
        const storageScope = global ? StorageScope.PROFILE : StorageScope.WORKSPACE;
        if (!storageService.getBoolean(storageMigratedKey, storageScope, false) && !(migrateLowerCaseStorageKey && storageService.getBoolean(migrateLowerCaseStorageKey, storageScope, false))) {
            logService.info(`Migrating ${global ? 'global' : 'workspace'} extension storage from ${fromExtensionId} to ${toExtensionId}...`);
            const value = extensionStorageService.getExtensionState(fromExtensionId, global);
            if (value) {
                extensionStorageService.setExtensionState(toExtensionId, value, global);
                extensionStorageService.setExtensionState(fromExtensionId, undefined, global);
            }
            const fromPath = getExtensionStorageLocation(fromExtensionId, global);
            const toPath = getExtensionStorageLocation(toExtensionId, global);
            if (!uriIdentityService.extUri.isEqual(fromPath, toPath)) {
                try {
                    await fileService.move(fromPath, toPath, true);
                }
                catch (error) {
                    if (error.code !== FileSystemProviderErrorCode.FileNotFound) {
                        logService.info(`Error while migrating ${global ? 'global' : 'workspace'} file storage from '${fromExtensionId}' to '${toExtensionId}'`, getErrorMessage(error));
                    }
                }
            }
            logService.info(`Migrated ${global ? 'global' : 'workspace'} extension storage from ${fromExtensionId} to ${toExtensionId}`);
            storageService.store(storageMigratedKey, true, storageScope, StorageTarget.MACHINE);
        }
    });
}

export { migrateExtensionStorage };
