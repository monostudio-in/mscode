import { AriaRole } from "../../../../base/browser/ui/aria/aria.js";
import { CheckBoxAccessibleState } from "../../../../base/browser/ui/list/listView.js";
import { IListAccessibilityProvider } from "../../../../base/browser/ui/list/listWidget.js";
import { Event, IValueWithChangeEvent } from "../../../../base/common/event.js";
import { IQuickTreeCheckboxEvent, IQuickTreeItem } from "../../common/quickInput.js";
/**
 * Accessibility provider for QuickTree.
 */
export declare class QuickTreeAccessibilityProvider<T extends IQuickTreeItem> implements IListAccessibilityProvider<T> {
    private readonly onCheckedEvent;
    constructor(onCheckedEvent: Event<IQuickTreeCheckboxEvent<T>>);
    getWidgetAriaLabel(): string;
    getAriaLabel(element: T): string;
    getWidgetRole(): AriaRole;
    getRole(_element: T): AriaRole;
    isChecked(element: T): IValueWithChangeEvent<CheckBoxAccessibleState> | undefined;
}
