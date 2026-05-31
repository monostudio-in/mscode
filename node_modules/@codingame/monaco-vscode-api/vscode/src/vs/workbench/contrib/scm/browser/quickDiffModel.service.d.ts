import { IReference } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { QuickDiffModelOptions, QuickDiffModel } from "@codingame/monaco-vscode-scm-service-override/vscode/vs/workbench/contrib/scm/browser/quickDiffModel";
export declare const IQuickDiffModelService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IQuickDiffModelService>;
export interface IQuickDiffModelService {
    _serviceBrand: undefined;
    /**
    * Returns `undefined` if the editor model is not resolved.
    * Model refrence has to be disposed once not needed anymore.
    * @param resource
    * @param options
    */
    createQuickDiffModelReference(resource: URI, options?: QuickDiffModelOptions): IReference<QuickDiffModel> | undefined;
}
