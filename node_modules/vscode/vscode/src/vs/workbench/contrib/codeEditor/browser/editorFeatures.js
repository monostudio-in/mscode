
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.service.js';
import { getEditorFeatures } from '../../../../editor/common/editorFeatures.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';

let EditorFeaturesInstantiator = class EditorFeaturesInstantiator extends Disposable {
    static {
        this.ID = "workbench.contrib.editorFeaturesInstantiator";
    }
    constructor(codeEditorService, _instantiationService) {
        super();
        this._instantiationService = _instantiationService;
        this._instantiated = false;
        this._register(codeEditorService.onWillCreateCodeEditor(() => this._instantiate()));
        this._register(codeEditorService.onWillCreateDiffEditor(() => this._instantiate()));
        if (codeEditorService.listCodeEditors().length > 0 || codeEditorService.listDiffEditors().length > 0) {
            this._instantiate();
        }
    }
    _instantiate() {
        if (this._instantiated) {
            return;
        }
        this._instantiated = true;
        const editorFeatures = getEditorFeatures();
        for (const feature of editorFeatures) {
            try {
                const instance = this._instantiationService.createInstance(feature);
                if (typeof instance.dispose === "function") {
                    this._register(instance);
                }
            } catch (err) {
                onUnexpectedError(err);
            }
        }
    }
};
EditorFeaturesInstantiator = ( __decorate([( __param(0, ICodeEditorService)), ( __param(1, IInstantiationService))], EditorFeaturesInstantiator));
registerWorkbenchContribution2(
    EditorFeaturesInstantiator.ID,
    EditorFeaturesInstantiator,
    WorkbenchPhase.BlockRestore
);
