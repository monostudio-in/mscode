
import { __decorate, __param } from '../../../../../../../../external/tslib/tslib.es6.js';
import { ICodeEditorService } from '../../../../../editor/browser/services/codeEditorService.service.js';
import { EditOperation } from '../../../../../editor/common/core/editOperation.js';
import { ILanguageModelToolsService } from '../../common/tools/languageModelToolsService.service.js';
import { PromptHeaderAttributes } from '../../common/promptSyntax/promptFileParser.js';
import { IPromptsService } from '../../common/promptSyntax/service/promptsService.service.js';
import { formatArrayValue } from '../../common/promptSyntax/utils/promptEditHelper.js';

let PromptFileRewriter = class PromptFileRewriter {
    constructor(_codeEditorService, _promptsService, _languageModelToolsService) {
        this._codeEditorService = _codeEditorService;
        this._promptsService = _promptsService;
        this._languageModelToolsService = _languageModelToolsService;
    }
    async openAndRewriteTools(uri, newTools, token) {
        const editor = await this._codeEditorService.openCodeEditor({
            resource: uri
        }, this._codeEditorService.getFocusedCodeEditor());
        if (!editor || !editor.hasModel()) {
            return;
        }
        const model = editor.getModel();
        const promptAST = this._promptsService.getParsedPromptFile(model);
        if (!promptAST.header) {
            return undefined;
        }
        const toolsAttr = promptAST.header.getAttribute(PromptHeaderAttributes.tools);
        if (!toolsAttr) {
            return undefined;
        }
        editor.setSelection(toolsAttr.range);
        if (newTools === undefined) {
            this.rewriteAttribute(model, "", toolsAttr.range);
            return;
        } else {
            this.rewriteTools(model, newTools, toolsAttr.value.range, toolsAttr.value.type === "scalar");
        }
    }
    rewriteTools(model, newTools, range, isString) {
        const newToolNames = this._languageModelToolsService.toFullReferenceNames(newTools);
        const newEntries = ( newToolNames.map(toolName => formatArrayValue(toolName))).join(", ");
        const newValue = isString ? newEntries : `[${newEntries}]`;
        this.rewriteAttribute(model, newValue, range);
    }
    rewriteAttribute(model, newValue, range) {
        model.pushStackElement();
        model.pushEditOperations(null, [EditOperation.replaceMove(range, newValue)], () => null);
        model.pushStackElement();
    }
    async openAndRewriteName(uri, newName, token) {
        const editor = await this._codeEditorService.openCodeEditor({
            resource: uri
        }, this._codeEditorService.getFocusedCodeEditor());
        if (!editor || !editor.hasModel()) {
            return;
        }
        const model = editor.getModel();
        const promptAST = this._promptsService.getParsedPromptFile(model);
        if (!promptAST.header) {
            return;
        }
        const nameAttr = promptAST.header.getAttribute(PromptHeaderAttributes.name);
        if (!nameAttr) {
            return;
        }
        if (nameAttr.value.type === "scalar" && nameAttr.value.value === newName) {
            return;
        }
        editor.setSelection(nameAttr.range);
        this.rewriteAttribute(model, newName, nameAttr.value.range);
    }
};
PromptFileRewriter = ( __decorate([( __param(0, ICodeEditorService)), ( __param(1, IPromptsService)), ( __param(2, ILanguageModelToolsService))], PromptFileRewriter));

export { PromptFileRewriter };
