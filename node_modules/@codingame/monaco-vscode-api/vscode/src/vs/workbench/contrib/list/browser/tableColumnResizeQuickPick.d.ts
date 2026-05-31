import { Table } from "../../../../base/browser/ui/table/tableWidget.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.service.js";
export declare class TableColumnResizeQuickPick extends Disposable {
    private readonly _table;
    private readonly _quickInputService;
    constructor(_table: Table<unknown>, _quickInputService: IQuickInputService);
    show(): Promise<void>;
    private _validateColumnResizeValue;
}
