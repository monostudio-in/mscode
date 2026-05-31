import { UriComponents } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { IEditorWorkerService } from "@codingame/monaco-vscode-api/vscode/vs/editor/common/services/editorWorker.service";
import { IModelService } from "@codingame/monaco-vscode-api/vscode/vs/editor/common/services/model.service";
import { ILanguageService } from "@codingame/monaco-vscode-api/vscode/vs/editor/common/languages/language.service";
import { ITextModelService } from "@codingame/monaco-vscode-api/vscode/vs/editor/common/services/resolverService.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { MainThreadDocumentContentProvidersShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
export declare class MainThreadDocumentContentProviders implements MainThreadDocumentContentProvidersShape {
    private readonly _textModelResolverService;
    private readonly _languageService;
    private readonly _modelService;
    private readonly _editorWorkerService;
    private readonly _resourceContentProvider;
    private readonly _pendingUpdate;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, _textModelResolverService: ITextModelService, _languageService: ILanguageService, _modelService: IModelService, _editorWorkerService: IEditorWorkerService);
    dispose(): void;
    $registerTextContentProvider(handle: number, scheme: string): void;
    $unregisterTextContentProvider(handle: number): void;
    $onVirtualDocumentChange(uri: UriComponents, value: string): Promise<void>;
}
