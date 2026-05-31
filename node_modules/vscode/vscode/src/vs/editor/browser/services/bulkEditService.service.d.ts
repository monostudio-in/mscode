import { IDisposable } from "../../../base/common/lifecycle.js";
import { WorkspaceEdit } from "../../common/languages.js";
import { IBulkEditPreviewHandler, ResourceEdit, IBulkEditOptions, IBulkEditResult } from "./bulkEditService.js";
export declare const IBulkEditService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IBulkEditService>;
export interface IBulkEditService {
    readonly _serviceBrand: undefined;
    hasPreviewHandler(): boolean;
    setPreviewHandler(handler: IBulkEditPreviewHandler): IDisposable;
    apply(edit: ResourceEdit[] | WorkspaceEdit, options?: IBulkEditOptions): Promise<IBulkEditResult>;
}
