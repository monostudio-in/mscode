
import { VSBuffer } from '../../../base/common/buffer.js';
import { isUUID, generateUuid } from '../../../base/common/uuid.js';
import { StorageScope, StorageTarget } from '../../storage/common/storage.js';

async function getServiceMachineId(environmentService, fileService, storageService) {
    let uuid = storageService ? storageService.get("storage.serviceMachineId", StorageScope.APPLICATION) || null : null;
    if (uuid) {
        return uuid;
    }
    try {
        const contents = await fileService.readFile(environmentService.serviceMachineIdResource);
        const value = ( contents.value.toString());
        uuid = isUUID(value) ? value : null;
    } catch (e) {
        uuid = null;
    }
    if (!uuid) {
        uuid = generateUuid();
        try {
            await fileService.writeFile(environmentService.serviceMachineIdResource, VSBuffer.fromString(uuid));
        } catch (error) {}
    }
    storageService?.store(
        "storage.serviceMachineId",
        uuid,
        StorageScope.APPLICATION,
        StorageTarget.MACHINE
    );
    return uuid;
}

export { getServiceMachineId };
