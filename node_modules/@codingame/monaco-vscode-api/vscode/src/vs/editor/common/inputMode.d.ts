import { Event } from "../../base/common/event.js";
declare class InputModeImpl {
    private _inputMode;
    private readonly _onDidChangeInputMode;
    readonly onDidChangeInputMode: Event<"overtype" | "insert">;
    getInputMode(): "overtype" | "insert";
    setInputMode(inputMode: "overtype" | "insert"): void;
}
/**
 * Controls the type mode, whether insert or overtype
 */
export declare const InputMode: InputModeImpl;
export {};
