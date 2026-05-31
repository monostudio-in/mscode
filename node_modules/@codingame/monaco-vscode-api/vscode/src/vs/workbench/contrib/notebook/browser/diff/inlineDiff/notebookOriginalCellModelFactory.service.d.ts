import { IReference } from "../../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../../base/common/uri.js";
import { ITextModel } from "../../../../../../editor/common/model.js";
import { CellKind } from "../../../common/notebookCommon.js";
export declare const INotebookOriginalCellModelFactory: import("../../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookOriginalCellModelFactory>;
export interface INotebookOriginalCellModelFactory {
    readonly _serviceBrand: undefined;
    getOrCreate(uri: URI, cellValue: string, language: string, cellKind: CellKind): IReference<ITextModel>;
}
