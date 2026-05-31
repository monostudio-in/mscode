import { IAction } from "../../../../base/common/actions.js";
import { IMenu } from "../../../../platform/actions/common/actions.js";
import { IExtensionTerminalProfile, ITerminalProfile } from "../../../../platform/terminal/common/terminal.js";
import { ITerminalLocationOptions } from "./terminal.js";
import { ITerminalService } from "./terminal.service.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
export declare enum TerminalContextMenuGroup {
    Chat = "0_chat",
    Create = "1_create",
    Edit = "3_edit",
    Clear = "5_clear",
    Kill = "7_kill",
    Config = "9_config"
}
export declare enum TerminalMenuBarGroup {
    Create = "1_create",
    Run = "3_run",
    Manage = "5_manage",
    Configure = "7_configure"
}
export declare function setupTerminalMenus(): void;
export declare function getTerminalActionBarArgs(location: ITerminalLocationOptions, profiles: ITerminalProfile[], defaultProfileName: string, contributedProfiles: readonly IExtensionTerminalProfile[], terminalService: ITerminalService, dropdownMenu: IMenu, disposableStore: DisposableStore): {
    dropdownAction: IAction;
    dropdownMenuActions: IAction[];
    className: string;
    dropdownIcon?: string;
};
