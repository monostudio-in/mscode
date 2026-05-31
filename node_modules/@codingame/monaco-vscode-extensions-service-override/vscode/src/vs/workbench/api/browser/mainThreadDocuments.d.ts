import { IReference, Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { URI, UriComponents } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { ITextModel } from "@codingame/monaco-vscode-api/vscode/vs/editor/common/model";
import { IModelService } from "@codingame/monaco-vscode-api/vscode/vs/editor/common/services/model.service";
import { ITextModelService } from "@codingame/monaco-vscode-api/vscode/vs/editor/common/services/resolverService.service";
import { IFileService } from "@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files.service";
import { MainThreadDocumentsShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { ITextFileService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/textfile/common/textfiles.service";
import { IWorkbenchEnvironmentService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/common/environmentService.service";
import { IExtUri } from "@codingame/monaco-vscode-api/vscode/vs/base/common/resources";
import { IWorkingCopyFileService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/workingCopy/common/workingCopyFileService.service";
import { IUriIdentityService } from "@codingame/monaco-vscode-api/vscode/vs/platform/uriIdentity/common/uriIdentity.service";
import { Event } from "@codingame/monaco-vscode-api/vscode/vs/base/common/event";
import { IPathService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/path/common/pathService.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
export declare class BoundModelReferenceCollection {
    private readonly _extUri;
    private readonly _maxAge;
    private readonly _maxLength;
    private readonly _maxSize;
    private _data;
    private _length;
    constructor(_extUri: IExtUri, _maxAge?: number, // auto-dispse by age
    _maxLength?: number, // auto-dispose by total length
    _maxSize?: number);
    dispose(): void;
    remove(uri: URI): void;
    add(uri: URI, ref: IReference<unknown>, length?: number): void;
    private _cleanup;
}
export declare class MainThreadDocuments extends Disposable implements MainThreadDocumentsShape {
    private readonly _modelService;
    private readonly _textFileService;
    private readonly _fileService;
    private readonly _textModelResolverService;
    private readonly _environmentService;
    private readonly _uriIdentityService;
    private readonly _pathService;
    private _onIsCaughtUpWithContentChanges;
    readonly onIsCaughtUpWithContentChanges: Event<URI>;
    private readonly _proxy;
    private readonly _modelTrackers;
    private readonly _modelReferenceCollection;
    constructor(extHostContext: IExtHostContext, _modelService: IModelService, _textFileService: ITextFileService, _fileService: IFileService, _textModelResolverService: ITextModelService, _environmentService: IWorkbenchEnvironmentService, _uriIdentityService: IUriIdentityService, workingCopyFileService: IWorkingCopyFileService, _pathService: IPathService);
    dispose(): void;
    isCaughtUpWithContentChanges(resource: URI): boolean;
    private _shouldHandleFileEvent;
    handleModelAdded(model: ITextModel): void;
    private _onModelModeChanged;
    handleModelRemoved(modelUrl: URI): void;
    $trySaveDocument(uri: UriComponents): Promise<boolean>;
    $tryOpenDocument(uriData: UriComponents, options?: {
        encoding?: string;
    }): Promise<URI>;
    $tryCreateDocument(options?: {
        language?: string;
        content?: string;
        encoding?: string;
    }): Promise<URI>;
    private _handleAsResourceInput;
    private _handleUntitledScheme;
    private _doCreateUntitled;
}
