import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IRange } from "../../../../../editor/common/core/range.js";
import { Command } from "../../../../../editor/common/languages.js";
import { Action2 } from "../../../../../platform/actions/common/actions.js";
import { ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../platform/label/common/label.service.js";
import { IChatRequestVariableValue, IDynamicVariable } from "../../common/attachments/chatVariables.js";
import { IChatWidget } from "../chat.js";
import { IChatWidgetContrib } from "@codingame/monaco-vscode-katex-common/vscode/vs/workbench/contrib/chat/browser/widget/chatWidget";
export declare const dynamicVariableDecorationType = "chat-dynamic-variable";
export declare class ChatDynamicVariableModel extends Disposable implements IChatWidgetContrib {
    private readonly widget;
    private readonly labelService;
    static readonly ID = "chatDynamicVariableModel";
    private _variables;
    get variables(): ReadonlyArray<IDynamicVariable>;
    get id(): string;
    private decorationData;
    private readonly _editorListener;
    constructor(widget: IChatWidget, labelService: ILabelService);
    private _subscribeToEditor;
    getInputState(contrib: Record<string, unknown>): void;
    setInputState(contrib: Readonly<Record<string, unknown>>): void;
    addReference(ref: IDynamicVariable): void;
    private updateDecorations;
    private getHoverForReference;
    /**
     * Dispose all existing variables.
     */
    private disposeVariables;
    dispose(): void;
}
export interface IAddDynamicVariableContext {
    id: string;
    widget: IChatWidget;
    range: IRange;
    variableData: IChatRequestVariableValue;
    command?: Command;
}
export declare class AddDynamicVariableAction extends Action2 {
    static readonly ID = "workbench.action.chat.addDynamicVariable";
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): Promise<void>;
}
