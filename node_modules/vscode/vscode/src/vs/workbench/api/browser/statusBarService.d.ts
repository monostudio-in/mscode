import { StatusbarAlignment as MainThreadStatusBarAlignment, IStatusbarEntry } from "../../services/statusbar/browser/statusbar.js";
import { IStatusbarService } from "../../services/statusbar/browser/statusbar.service.js";
import { ThemeColor } from "../../../base/common/themables.js";
import { Command } from "../../../editor/common/languages.js";
import { IAccessibilityInformation } from "../../../platform/accessibility/common/accessibility.js";
import { IMarkdownString } from "../../../base/common/htmlContent.js";
import { Event } from "../../../base/common/event.js";
import { IManagedHoverTooltipMarkdownString } from "../../../base/browser/ui/hover/hover.js";
export declare const IExtensionStatusBarItemService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtensionStatusBarItemService>;
export interface IExtensionStatusBarItemChangeEvent {
    readonly added?: ExtensionStatusBarEntry;
    readonly removed?: string;
}
export type ExtensionStatusBarEntry = [
    string,
    {
        entry: IStatusbarEntry;
        alignment: MainThreadStatusBarAlignment;
        priority: number;
    }
];
export declare enum StatusBarUpdateKind {
    DidDefine = 0,
    DidUpdate = 1
}
export interface IExtensionStatusBarItemService {
    readonly _serviceBrand: undefined;
    readonly onDidChange: Event<IExtensionStatusBarItemChangeEvent>;
    setOrUpdateEntry(id: string, statusId: string, extensionId: string | undefined, name: string, text: string, tooltip: IMarkdownString | string | undefined | IManagedHoverTooltipMarkdownString, command: Command | undefined, color: string | ThemeColor | undefined, backgroundColor: ThemeColor | undefined, alignLeft: boolean, priority: number | undefined, accessibilityInformation: IAccessibilityInformation | undefined): StatusBarUpdateKind;
    unsetEntry(id: string): void;
    getEntries(): Iterable<ExtensionStatusBarEntry>;
}
export declare class ExtensionStatusBarItemService implements IExtensionStatusBarItemService {
    private readonly _statusbarService;
    readonly _serviceBrand: undefined;
    private readonly _entries;
    private readonly _onDidChange;
    readonly onDidChange: Event<IExtensionStatusBarItemChangeEvent>;
    constructor(_statusbarService: IStatusbarService);
    dispose(): void;
    setOrUpdateEntry(entryId: string, id: string, extensionId: string | undefined, name: string, text: string, tooltip: IMarkdownString | string | undefined | IManagedHoverTooltipMarkdownString, command: Command | undefined, color: string | ThemeColor | undefined, backgroundColor: ThemeColor | undefined, alignLeft: boolean, priority: number | undefined, accessibilityInformation: IAccessibilityInformation | undefined): StatusBarUpdateKind;
    unsetEntry(entryId: string): void;
    getEntries(): Iterable<[
        string,
        {
            entry: IStatusbarEntry;
            alignment: MainThreadStatusBarAlignment;
            priority: number;
        }
    ]>;
}
