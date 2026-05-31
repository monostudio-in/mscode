
import { Action } from '../../../common/actions.js';
import { localize } from '../../../../nls.js';

class CollapseAllAction extends Action {
    constructor(viewer, enabled) {
        super("vs.tree.collapse", ( localize(46, "Collapse All")), "collapse-all", enabled);
        this.viewer = viewer;
    }
    async run() {
        this.viewer.collapseAll();
        this.viewer.setSelection([]);
        this.viewer.setFocus([]);
    }
}

export { CollapseAllAction };
