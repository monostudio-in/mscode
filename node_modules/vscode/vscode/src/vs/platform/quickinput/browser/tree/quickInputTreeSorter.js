
import { Disposable } from '../../../../base/common/lifecycle.js';

class QuickInputTreeSorter extends Disposable {
    constructor() {
        super(...arguments);
        this._sortByLabel = true;
    }
    get sortByLabel() {
        return this._sortByLabel;
    }
    set sortByLabel(value) {
        this._sortByLabel = value;
    }
    compare(a, b) {
        if (!this._sortByLabel) {
            return 0;
        }
        if (a.label < b.label) {
            return -1;
        }
        else if (a.label > b.label) {
            return 1;
        }
        if (a.description && b.description) {
            if (a.description < b.description) {
                return -1;
            }
            else if (a.description > b.description) {
                return 1;
            }
        }
        else if (a.description) {
            return -1;
        }
        else if (b.description) {
            return 1;
        }
        return 0;
    }
}

export { QuickInputTreeSorter };
