import { IAction } from "../../../base/common/actions.js";
import { IWorkbenchLayoutService } from "../../services/layout/browser/layoutService.service.js";
import { IContextMenuService } from "../../../platform/contextview/browser/contextView.service.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { IWorkbenchContribution } from "../../common/contributions.js";
import { IClipboardService } from "../../../platform/clipboard/common/clipboardService.service.js";
import { ILogService } from "../../../platform/log/common/log.service.js";
export declare function createTextInputActions(clipboardService: IClipboardService, logService: ILogService): IAction[];
export declare class TextInputActionsProvider extends Disposable implements IWorkbenchContribution {
    private readonly layoutService;
    private readonly contextMenuService;
    private readonly clipboardService;
    private readonly logService;
    static readonly ID = "workbench.contrib.textInputActionsProvider";
    private readonly textInputActions;
    constructor(layoutService: IWorkbenchLayoutService, contextMenuService: IContextMenuService, clipboardService: IClipboardService, logService: ILogService);
    private registerListeners;
    private onContextMenu;
}
