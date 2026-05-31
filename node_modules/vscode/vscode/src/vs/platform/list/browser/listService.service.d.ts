import { WorkbenchListWidget } from "./listService.js";
export declare const IListService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IListService>;
export interface IListService {
    readonly _serviceBrand: undefined;
    /**
    * Returns the currently focused list widget if any.
    */
    readonly lastFocusedList: WorkbenchListWidget | undefined;
}
