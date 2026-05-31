import { Event } from "../../../base/common/event.js";
import { IKeyboardEvent } from "../../keybinding/common/keybinding.js";
import { IKeyboardMapping, IKeyboardLayoutInfo } from "./keyboardLayout.js";
import { IKeyboardMapper } from "@codingame/monaco-vscode-keybindings-service-override/vscode/vs/platform/keyboardLayout/common/keyboardMapper";
export declare const IKeyboardLayoutService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IKeyboardLayoutService>;
export interface IKeyboardLayoutService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeKeyboardLayout: Event<void>;
    getRawKeyboardMapping(): IKeyboardMapping | null;
    getCurrentKeyboardLayout(): IKeyboardLayoutInfo | null;
    getAllKeyboardLayouts(): IKeyboardLayoutInfo[];
    getKeyboardMapper(): IKeyboardMapper;
    validateCurrentKeyboardMapping(keyboardEvent: IKeyboardEvent): void;
}
