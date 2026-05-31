import { Disposable } from "../../../../../base/common/lifecycle.js";
export declare class CloseButton extends Disposable {
    private _button;
    private readonly _onClicked;
    readonly onClicked: import("../../../../../base/common/event.js").Event<void>;
    constructor(container: HTMLElement);
}
