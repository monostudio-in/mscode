
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { registerEditorContribution, EditorContributionInstantiation } from '../../../../editor/browser/editorExtensions.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.service.js';
import { ReferencesController } from '../../../../editor/contrib/gotoSymbol/browser/peek/referencesController.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.service.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.service.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.service.js';
import { IStorageService } from '../../../../platform/storage/common/storage.service.js';

let WorkbenchReferencesController = class WorkbenchReferencesController extends ReferencesController {
    constructor(
        editor,
        contextKeyService,
        editorService,
        notificationService,
        instantiationService,
        storageService,
        configurationService
    ) {
        super(
            false,
            editor,
            contextKeyService,
            editorService,
            notificationService,
            instantiationService,
            storageService,
            configurationService
        );
    }
};
WorkbenchReferencesController = ( __decorate([( __param(1, IContextKeyService)), ( __param(2, ICodeEditorService)), ( __param(3, INotificationService)), ( __param(4, IInstantiationService)), ( __param(5, IStorageService)), ( __param(6, IConfigurationService))], WorkbenchReferencesController));
registerEditorContribution(
    ReferencesController.ID,
    WorkbenchReferencesController,
    EditorContributionInstantiation.Lazy
);

export { WorkbenchReferencesController };
