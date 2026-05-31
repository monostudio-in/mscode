import { URI, UriComponents } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { NotebookTextModel } from "@codingame/monaco-vscode-notebook-service-override/vscode/vs/workbench/contrib/notebook/common/model/notebookTextModel";
import { INotebookEditorModelResolverService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/notebook/common/notebookEditorModelResolverService.service";
import { IUriIdentityService } from "@codingame/monaco-vscode-api/vscode/vs/platform/uriIdentity/common/uriIdentity.service";
import { MainThreadNotebookDocumentsShape, NotebookDataDto } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
export declare class MainThreadNotebookDocuments implements MainThreadNotebookDocumentsShape {
    private readonly _notebookEditorModelResolverService;
    private readonly _uriIdentityService;
    private readonly _disposables;
    private readonly _proxy;
    private readonly _documentEventListenersMapping;
    private readonly _modelReferenceCollection;
    constructor(extHostContext: IExtHostContext, _notebookEditorModelResolverService: INotebookEditorModelResolverService, _uriIdentityService: IUriIdentityService);
    dispose(): void;
    handleNotebooksAdded(notebooks: readonly NotebookTextModel[]): void;
    handleNotebooksRemoved(uris: URI[]): void;
    $tryCreateNotebook(options: {
        viewType: string;
        content?: NotebookDataDto;
    }): Promise<UriComponents>;
    $tryOpenNotebook(uriComponents: UriComponents): Promise<URI>;
    $trySaveNotebook(uriComponents: UriComponents): Promise<boolean>;
}
