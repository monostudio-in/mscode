import { IDialogOptions } from "../../../../base/browser/ui/dialog/dialog.js";
import { IHostService } from "../../../services/host/browser/host.service.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.service.js";
import { IProductService } from "../../../../platform/product/common/productService.service.js";
export declare function createWorkbenchDialogOptions(options: Partial<IDialogOptions>, keybindingService: IKeybindingService, layoutService: ILayoutService, hostService: IHostService, allowableCommands?: Set<string>): IDialogOptions;
export declare function createBrowserAboutDialogDetails(productService: IProductService): {
    title: string;
    details: string;
    detailsToCopy: string;
};
