import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { FileKind } from "../../../../platform/files/common/files.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.service.js";
import { IEditorPane } from "../../../common/editor.js";
import { IOutline } from "../../../services/outline/browser/outline.js";
import { IOutlineService } from "../../../services/outline/browser/outline.service.js";
export declare class FileElement {
    readonly uri: URI;
    readonly kind: FileKind;
    constructor(uri: URI, kind: FileKind);
}
export declare class OutlineElement2 {
    readonly element: IOutline<unknown> | unknown;
    readonly outline: IOutline<unknown>;
    constructor(element: IOutline<unknown> | unknown, outline: IOutline<unknown>);
}
export declare class BreadcrumbsModel {
    readonly resource: URI;
    readonly editor: IEditorPane | undefined;
    private readonly _workspaceService;
    private readonly _outlineService;
    private readonly _disposables;
    private _fileInfo;
    private readonly _cfgFilePath;
    private readonly _cfgSymbolPath;
    private readonly _currentOutline;
    private readonly _outlineDisposables;
    private readonly _onDidUpdate;
    readonly onDidUpdate: Event<this>;
    constructor(resource: URI, editor: IEditorPane | undefined, configurationService: IConfigurationService, _workspaceService: IWorkspaceContextService, _outlineService: IOutlineService);
    dispose(): void;
    isRelative(): boolean;
    getElements(): ReadonlyArray<FileElement | OutlineElement2>;
    private _initFilePathInfo;
    private _onDidChangeWorkspaceFolders;
    private _bindToEditor;
}
