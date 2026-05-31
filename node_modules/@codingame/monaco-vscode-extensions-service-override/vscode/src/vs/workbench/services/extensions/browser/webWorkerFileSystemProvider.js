
import { FileSystemProviderCapabilities, createFileSystemProviderError, FileSystemProviderErrorCode, FileType } from '@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files';
import { Event } from '@codingame/monaco-vscode-api/vscode/vs/base/common/event';
import { Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { NotSupportedError } from '@codingame/monaco-vscode-api/vscode/vs/base/common/errors';

class FetchFileSystemProvider {
    constructor() {
        this.capabilities = FileSystemProviderCapabilities.Readonly + FileSystemProviderCapabilities.FileReadWrite + FileSystemProviderCapabilities.PathCaseSensitive;
        this.onDidChangeCapabilities = Event.None;
        this.onDidChangeFile = Event.None;
    }
    async readFile(resource) {
        try {
            const res = await fetch(( resource.toString(true)));
            if (res.status === 200) {
                return ( new Uint8Array(await res.arrayBuffer()));
            }
            throw createFileSystemProviderError(res.statusText, FileSystemProviderErrorCode.Unknown);
        } catch (err) {
            throw createFileSystemProviderError(err, FileSystemProviderErrorCode.Unknown);
        }
    }
    async stat(_resource) {
        return {
            type: FileType.File,
            size: 0,
            mtime: 0,
            ctime: 0
        };
    }
    watch() {
        return Disposable.None;
    }
    writeFile(_resource, _content, _opts) {
        throw ( new NotSupportedError());
    }
    readdir(_resource) {
        throw ( new NotSupportedError());
    }
    mkdir(_resource) {
        throw ( new NotSupportedError());
    }
    delete(_resource, _opts) {
        throw ( new NotSupportedError());
    }
    rename(_from, _to, _opts) {
        throw ( new NotSupportedError());
    }
}

export { FetchFileSystemProvider };
