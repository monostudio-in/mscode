import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { IDisposable } from "../../../../../base/common/lifecycle.js";
import { IObservable } from "../../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { IQuickItem, IQuickPickSeparator } from "../../../../../platform/quickinput/common/quickInput.js";
import { IChatRequestVariableEntry } from "../../common/attachments/chatVariableEntries.js";
import { IChatWidget } from "../chat.js";
import { IChatContextPickService } from "./chatContextPickService.service.js";
export interface IChatContextPickerPickItem extends Partial<IQuickItem> {
    label: string;
    iconClass?: string;
    iconClasses?: readonly string[];
    description?: string;
    detail?: string;
    disabled?: boolean;
    asAttachment(): ChatContextPickAttachment | Promise<ChatContextPickAttachment>;
}
export type ChatContextPickAttachment = IChatRequestVariableEntry | IChatRequestVariableEntry[] | "noop";
export declare function isChatContextPickerPickItem(item: unknown): item is IChatContextPickerPickItem;
interface IChatContextItem {
    readonly label: string;
    readonly icon: ThemeIcon;
    readonly commandId?: string;
    readonly ordinal?: number;
    isEnabled?(widget: IChatWidget): Promise<boolean> | boolean;
}
export interface IChatContextValueItem extends IChatContextItem {
    readonly type: "valuePick";
    asAttachment(widget: IChatWidget): Promise<IChatRequestVariableEntry | IChatRequestVariableEntry[] | undefined>;
}
export type ChatContextPick = IChatContextPickerPickItem | IQuickPickSeparator;
export interface IChatContextPicker {
    readonly placeholder: string;
    /**
     * Picks that should either be:
     * - A promise that resolves to the picked items
     * - A function that maps input query into items to display.
     */
    readonly picks: Promise<ChatContextPick[]> | ((query: IObservable<string>, token: CancellationToken) => IObservable<{
        busy: boolean;
        picks: ChatContextPick[];
    }>);
    /** Return true to cancel the default behavior */
    readonly goBack?: () => boolean;
    readonly configure?: {
        label: string;
        commandId: string;
    };
    readonly dispose?: () => void;
}
export interface IChatContextPickerItem extends IChatContextItem {
    readonly type: "pickerPick";
    asPicker(widget: IChatWidget): IChatContextPicker;
}
/**
 * Helper for use in {@IChatContextPickerItem} that wraps a simple query->promise
 * function into the requisite observable.
 */
export declare function picksWithPromiseFn(fn: (query: string, token: CancellationToken) => Promise<ChatContextPick[]>): (query: IObservable<string>, token: CancellationToken) => IObservable<{
    busy: boolean;
    picks: ChatContextPick[];
}>;
export declare class ChatContextPickService implements IChatContextPickService {
    _serviceBrand: undefined;
    private readonly _picks;
    readonly items: Iterable<IChatContextValueItem>;
    registerChatContextItem(pick: IChatContextValueItem): IDisposable;
}
export {};
