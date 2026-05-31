
import { coalesce } from '@codingame/monaco-vscode-api/vscode/vs/base/common/arrays';
import { VSBuffer } from '@codingame/monaco-vscode-api/vscode/vs/base/common/buffer';

class DataTransferFileCache {
    constructor() {
        this.requestIdPool = 0;
        this.dataTransferFiles = ( new Map());
    }
    add(dataTransfer) {
        const requestId = this.requestIdPool++;
        this.dataTransferFiles.set(requestId, coalesce(Array.from(dataTransfer, ([, item]) => item.asFile())));
        return {
            id: requestId,
            dispose: () => {
                this.dataTransferFiles.delete(requestId);
            }
        };
    }
    async resolveFileData(requestId, dataItemId) {
        const files = this.dataTransferFiles.get(requestId);
        if (!files) {
            throw ( new Error("No data transfer found"));
        }
        const file = files.find(file => file.id === dataItemId);
        if (!file) {
            throw ( new Error("No matching file found in data transfer"));
        }
        return VSBuffer.wrap(await file.data());
    }
    dispose() {
        this.dataTransferFiles.clear();
    }
}

export { DataTransferFileCache };
