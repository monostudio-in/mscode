
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.service.js';
import { registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ListResizeColumnAction } from './listResizeColumnAction.js';

let ListContext = class ListContext {
    static {
        this.ID = "workbench.contrib.listContext";
    }
    constructor(contextKeyService) {
        contextKeyService.createKey("listSupportsTypeNavigation", true);
        contextKeyService.createKey("listSupportsKeyboardNavigation", true);
    }
};
ListContext = ( __decorate([( __param(0, IContextKeyService))], ListContext));
registerWorkbenchContribution2(ListContext.ID, ListContext, WorkbenchPhase.BlockStartup);
registerAction2(ListResizeColumnAction);

export { ListContext };
