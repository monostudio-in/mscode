import { Disposable } from "../../../../base/common/lifecycle.js";
import { IMeteredConnectionService } from "../../../../platform/meteredConnection/common/meteredConnection.service.js";
import { IStatusbarService } from "../../../services/statusbar/browser/statusbar.service.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
export declare class MeteredConnectionStatusContribution extends Disposable implements IWorkbenchContribution {
    private readonly meteredConnectionService;
    private readonly statusbarService;
    static readonly ID = "workbench.contrib.meteredConnectionStatus";
    private readonly statusBarEntry;
    constructor(meteredConnectionService: IMeteredConnectionService, statusbarService: IStatusbarService);
    private updateStatusBarEntry;
    private getStatusBarEntry;
}
