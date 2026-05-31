import { Event } from "../common/event.js";
export interface IHistoryNavigationWidget {
    readonly element: HTMLElement;
    showPreviousValue(): void;
    showNextValue(): void;
    readonly onDidFocus: Event<void>;
    readonly onDidBlur: Event<void>;
}
