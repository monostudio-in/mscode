
import { ActionRunner } from '../../../../base/common/actions.js';

class ActionRunnerWithContext extends ActionRunner {
    constructor(_getContext) {
        super();
        this._getContext = _getContext;
    }
    runAction(action, _context) {
        const ctx = this._getContext();
        return super.runAction(action, ctx);
    }
}

export { ActionRunnerWithContext };
