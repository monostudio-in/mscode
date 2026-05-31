import { Disposable } from "../../../../../base/common/lifecycle.js";
export declare class InsertButton extends Disposable {
    private _button;
    private readonly _onClicked;
    readonly onClicked: import("../../../../../base/common/event.js").Event<void>;
    constructor(container: HTMLElement);
    get button(): HTMLElement;
}
