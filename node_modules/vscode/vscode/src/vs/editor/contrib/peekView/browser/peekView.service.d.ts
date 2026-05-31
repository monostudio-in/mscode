import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { PeekViewWidget } from "./peekView.js";
export declare const IPeekViewService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IPeekViewService>;
export interface IPeekViewService {
    readonly _serviceBrand: undefined;
    addExclusiveWidget(editor: ICodeEditor, widget: PeekViewWidget): void;
}
