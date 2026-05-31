
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { BaseTextEditorModel } from './textEditorModel.js';
import { ILanguageService } from '../../../editor/common/languages/language.service.js';
import { IModelService } from '../../../editor/common/services/model.service.js';
import { ILanguageDetectionService } from '../../services/languageDetection/common/languageDetectionWorkerService.service.js';
import { IAccessibilityService } from '../../../platform/accessibility/common/accessibility.service.js';

let TextResourceEditorModel = class TextResourceEditorModel extends BaseTextEditorModel {
    constructor(
        resource,
        languageService,
        modelService,
        languageDetectionService,
        accessibilityService
    ) {
        super(
            modelService,
            languageService,
            languageDetectionService,
            accessibilityService,
            resource
        );
    }
    dispose() {
        if (this.textEditorModelHandle) {
            this.modelService.destroyModel(this.textEditorModelHandle);
        }
        super.dispose();
    }
};
TextResourceEditorModel = ( __decorate([( __param(1, ILanguageService)), ( __param(2, IModelService)), ( __param(3, ILanguageDetectionService)), ( __param(4, IAccessibilityService))], TextResourceEditorModel));

export { TextResourceEditorModel };
