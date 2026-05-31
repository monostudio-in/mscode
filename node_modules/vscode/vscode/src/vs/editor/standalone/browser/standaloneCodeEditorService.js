
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { windowOpenNoOpener } from '../../../base/browser/dom.js';
import { Schemas } from '../../../base/common/network.js';
import { AbstractCodeEditorService } from '../../browser/services/abstractCodeEditorService.js';
import { ICodeEditorService } from '../../browser/services/codeEditorService.service.js';
import { ScrollType } from '../../common/editorCommon.js';
import { IContextKeyService } from '../../../platform/contextkey/common/contextkey.service.js';
import { registerSingleton, InstantiationType } from '../../../platform/instantiation/common/extensions.js';
import { IThemeService } from '../../../platform/theme/common/themeService.service.js';

let StandaloneCodeEditorService = class StandaloneCodeEditorService extends AbstractCodeEditorService {
    constructor(contextKeyService, themeService) {
        super(themeService);
        this._register(this.onCodeEditorAdd(() => this._checkContextKey()));
        this._register(this.onCodeEditorRemove(() => this._checkContextKey()));
        this._editorIsOpen = contextKeyService.createKey("editorIsOpen", false);
        this._activeCodeEditor = null;
        this._register(this.registerCodeEditorOpenHandler(async (input, source, sideBySide) => {
            if (!source) {
                return null;
            }
            return this.doOpenEditor(source, input);
        }));
    }
    _checkContextKey() {
        let hasCodeEditor = false;
        for (const editor of this.listCodeEditors()) {
            if (!editor.isSimpleWidget) {
                hasCodeEditor = true;
                break;
            }
        }
        this._editorIsOpen.set(hasCodeEditor);
    }
    setActiveCodeEditor(activeCodeEditor) {
        this._activeCodeEditor = activeCodeEditor;
    }
    getActiveCodeEditor() {
        return this._activeCodeEditor;
    }
    doOpenEditor(editor, input) {
        const model = this.findModel(editor, input.resource);
        if (!model) {
            if (input.resource) {
                const schema = input.resource.scheme;
                if (schema === Schemas.http || schema === Schemas.https) {
                    windowOpenNoOpener(( input.resource.toString()));
                    return editor;
                }
            }
            return null;
        }
        const selection = (input.options ? input.options.selection : null);
        if (selection) {
            if (typeof selection.endLineNumber === "number" && typeof selection.endColumn === "number") {
                editor.setSelection(selection);
                editor.revealRangeInCenter(selection, ScrollType.Immediate);
            } else {
                const pos = {
                    lineNumber: selection.startLineNumber,
                    column: selection.startColumn
                };
                editor.setPosition(pos);
                editor.revealPositionInCenter(pos, ScrollType.Immediate);
            }
        }
        return editor;
    }
    findModel(editor, resource) {
        const model = editor.getModel();
        if (model && ( model.uri.toString()) !== ( resource.toString())) {
            return null;
        }
        return model;
    }
};
StandaloneCodeEditorService = ( __decorate([( __param(0, IContextKeyService)), ( __param(1, IThemeService))], StandaloneCodeEditorService));
registerSingleton(ICodeEditorService, StandaloneCodeEditorService, InstantiationType.Eager);

export { StandaloneCodeEditorService };
