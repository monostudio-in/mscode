import { IStat, FileType, IFileDeleteOptions, IFileOverwriteOptions, IFileWriteOptions, IFileSystemProviderWithFileReadWriteCapability } from "@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files";
import { Event } from "@codingame/monaco-vscode-api/vscode/vs/base/common/event";
import { IDisposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { URI } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
export declare class FetchFileSystemProvider implements IFileSystemProviderWithFileReadWriteCapability {
    readonly capabilities: number;
    readonly onDidChangeCapabilities: Event<any>;
    readonly onDidChangeFile: Event<any>;
    readFile(resource: URI): Promise<Uint8Array>;
    stat(_resource: URI): Promise<IStat>;
    watch(): IDisposable;
    writeFile(_resource: URI, _content: Uint8Array, _opts: IFileWriteOptions): Promise<void>;
    readdir(_resource: URI): Promise<[
        string,
        FileType
    ][]>;
    mkdir(_resource: URI): Promise<void>;
    delete(_resource: URI, _opts: IFileDeleteOptions): Promise<void>;
    rename(_from: URI, _to: URI, _opts: IFileOverwriteOptions): Promise<void>;
}
