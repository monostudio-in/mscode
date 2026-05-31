import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ICustomEditorModelManager, CustomEditorInfo, CustomEditorInfoCollection, CustomEditorCapabilities } from "@codingame/monaco-vscode-view-common-service-override/vscode/vs/workbench/contrib/customEditor/common/customEditor";
export declare const ICustomEditorService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ICustomEditorService>;
export interface ICustomEditorService {
    _serviceBrand: any;
    readonly models: ICustomEditorModelManager;
    getCustomEditor(viewType: string): CustomEditorInfo | undefined;
    getAllCustomEditors(resource: URI): CustomEditorInfoCollection;
    getContributedCustomEditors(resource: URI): CustomEditorInfoCollection;
    getUserConfiguredCustomEditors(resource: URI): CustomEditorInfoCollection;
    registerCustomEditorCapabilities(viewType: string, options: CustomEditorCapabilities): IDisposable;
    getCustomEditorCapabilities(viewType: string): CustomEditorCapabilities | undefined;
}
