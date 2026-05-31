
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { isCodeEditor, isDiffEditor, isCompositeEditor, getCodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { AbstractCodeEditorService } from '../../../../editor/browser/services/abstractCodeEditorService.js';
import { ScrollType } from '../../../../editor/common/editorCommon.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.service.js';
import { SIDE_GROUP, ACTIVE_GROUP } from '../common/editorService.js';
import { IEditorService } from '../common/editorService.service.js';
import '../../../../platform/instantiation/common/instantiation.js';
import '../../../../platform/instantiation/common/extensions.js';
import { isEqual } from '../../../../base/common/resources.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.service.js';
import { applyTextEditorOptions } from '../../../common/editor/editorOptions.js';

let CodeEditorService = class CodeEditorService extends AbstractCodeEditorService {
    constructor(editorService, themeService, configurationService) {
        super(themeService);
        this.editorService = editorService;
        this.configurationService = configurationService;
        this._register(this.registerCodeEditorOpenHandler(this.doOpenCodeEditor.bind(this)));
        this._register(
            this.registerCodeEditorOpenHandler(this.doOpenCodeEditorFromDiff.bind(this))
        );
    }
    getActiveCodeEditor() {
        const activeTextEditorControl = this.editorService.activeTextEditorControl;
        if (isCodeEditor(activeTextEditorControl)) {
            return activeTextEditorControl;
        }
        if (isDiffEditor(activeTextEditorControl)) {
            return activeTextEditorControl.getModifiedEditor();
        }
        const activeControl = this.editorService.activeEditorPane?.getControl();
        if (isCompositeEditor(activeControl) && isCodeEditor(activeControl.activeCodeEditor)) {
            return activeControl.activeCodeEditor;
        }
        return null;
    }
    async doOpenCodeEditorFromDiff(input, source, sideBySide) {
        const activeTextEditorControl = this.editorService.activeTextEditorControl;
        if (
        !sideBySide && isDiffEditor(activeTextEditorControl) && input.options && input.resource && source === activeTextEditorControl.getModifiedEditor() && activeTextEditorControl.getModel() && isEqual(input.resource, activeTextEditorControl.getModel()?.modified.uri)) {
            const targetEditor = activeTextEditorControl.getModifiedEditor();
            applyTextEditorOptions(input.options, targetEditor, ScrollType.Smooth);
            return targetEditor;
        }
        return null;
    }
    async doOpenCodeEditor(input, source, sideBySide) {
        const enablePreviewFromCodeNavigation = this.configurationService.getValue().workbench?.editor?.enablePreviewFromCodeNavigation;
        if (
        !enablePreviewFromCodeNavigation && source && !input.options?.pinned && !sideBySide && !isEqual(source.getModel()?.uri, input.resource)) {
            for (const visiblePane of this.editorService.visibleEditorPanes) {
                if (getCodeEditor(visiblePane.getControl()) === source) {
                    visiblePane.group.pinEditor();
                    break;
                }
            }
        }
        const control = await this.editorService.openEditor(input, sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
        if (control) {
            const widget = control.getControl();
            if (isCodeEditor(widget)) {
                return widget;
            }
            if (isCompositeEditor(widget) && isCodeEditor(widget.activeCodeEditor)) {
                return widget.activeCodeEditor;
            }
        }
        return null;
    }
};
CodeEditorService = ( __decorate([( __param(0, IEditorService)), ( __param(1, IThemeService)), ( __param(2, IConfigurationService))], CodeEditorService));

export { CodeEditorService };
