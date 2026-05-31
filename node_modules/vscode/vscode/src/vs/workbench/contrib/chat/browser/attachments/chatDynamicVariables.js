
import { __decorate, __param } from '../../../../../../../../external/tslib/tslib.es6.js';
import { coalesce } from '../../../../../base/common/arrays.js';
import { MarkdownString } from '../../../../../base/common/htmlContent.js';
import { Disposable, MutableDisposable, dispose, isDisposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { isLocation } from '../../../../../editor/common/languages.js';
import { Action2, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.service.js';
import { ILabelService } from '../../../../../platform/label/common/label.service.js';
import { addDynamicVariableActionId } from '../widget/input/editor/chatDynamicVariablesConstant.js';

var ChatDynamicVariableModel_1;
const dynamicVariableDecorationType = "chat-dynamic-variable";
let ChatDynamicVariableModel = class ChatDynamicVariableModel extends Disposable {
    static {
        ChatDynamicVariableModel_1 = this;
    }
    static {
        this.ID = "chatDynamicVariableModel";
    }
    get variables() {
        return [...this._variables];
    }
    get id() {
        return ChatDynamicVariableModel_1.ID;
    }
    constructor(widget, labelService) {
        super();
        this.widget = widget;
        this.labelService = labelService;
        this._variables = [];
        this.decorationData = [];
        this._editorListener = this._register(( new MutableDisposable()));
        this._subscribeToEditor();
        this._register(widget.onDidChangeActiveInputEditor(() => {
            this._subscribeToEditor();
            this.updateDecorations();
        }));
    }
    _subscribeToEditor() {
        this._editorListener.value = this.widget.inputEditor.onDidChangeModelContent(e => {
            const removed = [];
            let didChange = false;
            this._variables = coalesce(( this._variables.map((ref, idx) => {
                const model = this.widget.inputEditor.getModel();
                if (!model) {
                    removed.push(ref);
                    return null;
                }
                const data = this.decorationData[idx];
                if (!data) {
                    removed.push(ref);
                    return null;
                }
                const newRange = model.getDecorationRange(data.id);
                if (!newRange) {
                    removed.push(ref);
                    return null;
                }
                const newText = model.getValueInRange(newRange);
                if (newText !== data.text) {
                    this.widget.inputEditor.executeEdits(this.id, [{
                        range: newRange,
                        text: ""
                    }]);
                    this.widget.refreshParsedInput();
                    removed.push(ref);
                    return null;
                }
                if (newRange.equalsRange(ref.range)) {
                    return ref;
                }
                didChange = true;
                return {
                    ...ref,
                    range: newRange
                };
            })));
            dispose(removed.filter(isDisposable));
            if (didChange || removed.length > 0) {
                this.widget.refreshParsedInput();
            }
            this.updateDecorations();
        });
    }
    getInputState(contrib) {
        contrib[ChatDynamicVariableModel_1.ID] = this.variables;
    }
    setInputState(contrib) {
        let s = contrib[ChatDynamicVariableModel_1.ID];
        if (!Array.isArray(s)) {
            s = [];
        }
        this.disposeVariables();
        this._variables = [];
        for (const variable of s) {
            if (!isDynamicVariable(variable)) {
                continue;
            }
            this.addReference(variable);
        }
    }
    addReference(ref) {
        if (!isValidEditorRange(ref.range)) {
            return;
        }
        this._variables.push(ref);
        this.updateDecorations();
        this.widget.refreshParsedInput();
    }
    updateDecorations() {
        const model = this.widget.inputEditor.getModel();
        if (!model) {
            this.decorationData = [];
            return;
        }
        const validVariables = this._variables.filter(v => isValidEditorRange(v.range));
        const decorationIds = this.widget.inputEditor.setDecorationsByType("chat", dynamicVariableDecorationType, ( validVariables.map(r => ({
            range: r.range,
            hoverMessage: this.getHoverForReference(r)
        }))));
        this._variables = validVariables.slice(0, decorationIds.length);
        this.decorationData = [];
        for (let i = 0; i < decorationIds.length; i++) {
            this.decorationData.push({
                id: decorationIds[i],
                text: model.getValueInRange(this._variables[i].range)
            });
        }
    }
    getHoverForReference(ref) {
        const value = ref.data;
        if (URI.isUri(value)) {
            return ( new MarkdownString(this.labelService.getUriLabel(value, {
                relative: true
            })));
        } else if (isLocation(value)) {
            const prefix = ref.fullName ? ` ${ref.fullName}` : "";
            const rangeString = `#${value.range.startLineNumber}-${value.range.endLineNumber}`;
            return ( new MarkdownString(prefix + this.labelService.getUriLabel(value.uri, {
                relative: true
            }) + rangeString));
        } else {
            return undefined;
        }
    }
    disposeVariables() {
        for (const variable of this._variables) {
            if (isDisposable(variable)) {
                variable.dispose();
            }
        }
    }
    dispose() {
        this.disposeVariables();
        super.dispose();
    }
};
ChatDynamicVariableModel = ChatDynamicVariableModel_1 = ( __decorate([( __param(1, ILabelService))], ChatDynamicVariableModel));
function isDynamicVariable(obj) {
    return obj && typeof obj.id === "string" && Range.isIRange(obj.range) && isValidEditorRange(obj.range) && "data" in obj;
}
function isValidEditorRange(range) {
    if (range.startLineNumber < 1 || range.endLineNumber < 1 || range.startColumn < 1 || range.endColumn < 1) {
        return false;
    }
    if (range.startLineNumber > range.endLineNumber) {
        return false;
    }
    if (range.startLineNumber === range.endLineNumber && range.startColumn >= range.endColumn) {
        return false;
    }
    return true;
}
function isAddDynamicVariableContext(context) {
    return "widget" in context && "range" in context && "variableData" in context;
}
class AddDynamicVariableAction extends Action2 {
    static {
        this.ID = addDynamicVariableActionId;
    }
    constructor() {
        super({
            id: AddDynamicVariableAction.ID,
            title: ""
        });
    }
    async run(accessor, ...args) {
        const context = args[0];
        if (!isAddDynamicVariableContext(context)) {
            return;
        }
        let range = context.range;
        const variableData = context.variableData;
        const doCleanup = () => {
            context.widget.inputEditor.executeEdits("chatInsertDynamicVariableWithArguments", [{
                range: context.range,
                text: ``
            }]);
        };
        if (context.command) {
            const commandService = accessor.get(ICommandService);
            const selection = await commandService.executeCommand(context.command.id, ...(context.command.arguments ?? []));
            if (!selection) {
                doCleanup();
                return;
            }
            const insertText = ":" + selection;
            const insertRange = ( new Range(
                range.startLineNumber,
                range.endColumn,
                range.endLineNumber,
                range.endColumn + insertText.length
            ));
            range = ( new Range(
                range.startLineNumber,
                range.startColumn,
                range.endLineNumber,
                range.endColumn + insertText.length
            ));
            const editor = context.widget.inputEditor;
            const success = editor.executeEdits("chatInsertDynamicVariableWithArguments", [{
                range: insertRange,
                text: insertText + " "
            }]);
            if (!success) {
                doCleanup();
                return;
            }
        }
        context.widget.getContrib(ChatDynamicVariableModel.ID)?.addReference({
            id: context.id,
            range: range,
            isFile: true,
            data: variableData
        });
    }
}
registerAction2(AddDynamicVariableAction);

export { AddDynamicVariableAction, ChatDynamicVariableModel, dynamicVariableDecorationType };
