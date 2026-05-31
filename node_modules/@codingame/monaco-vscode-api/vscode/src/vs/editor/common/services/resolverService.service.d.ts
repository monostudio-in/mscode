import { IReference, IDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IResolvedTextEditorModel, ITextModelContentProvider } from "@codingame/monaco-vscode-model-service-override/vscode/vs/editor/common/services/resolverService";
export declare const ITextModelService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITextModelService>;
export interface ITextModelService {
    readonly _serviceBrand: undefined;
    /**
    * Provided a resource URI, it will return a model reference
    * which should be disposed once not needed anymore.
    */
    createModelReference(resource: URI): Promise<IReference<IResolvedTextEditorModel>>;
    /**
    * Registers a specific `scheme` content provider.
    */
    registerTextModelContentProvider(scheme: string, provider: ITextModelContentProvider): IDisposable;
    /**
    * Check if the given resource can be resolved to a text model.
    */
    canHandleResource(resource: URI): boolean;
}
