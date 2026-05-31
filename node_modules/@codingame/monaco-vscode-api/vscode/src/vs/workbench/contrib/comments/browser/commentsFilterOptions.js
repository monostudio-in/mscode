
import { matchesFuzzy2, matchesFuzzy } from '../../../../base/common/filters.js';
import { ltrim } from '../../../../base/common/strings.js';

class FilterOptions {
    static { this._filter = matchesFuzzy2; }
    static { this._messageFilter = matchesFuzzy; }
    constructor(filter, showResolved, showUnresolved) {
        this.filter = filter;
        this.showResolved = true;
        this.showUnresolved = true;
        filter = filter.trim();
        this.showResolved = showResolved;
        this.showUnresolved = showUnresolved;
        const negate = filter.startsWith('!');
        this.textFilter = { text: (negate ? ltrim(filter, '!') : filter).trim(), negate };
    }
}

export { FilterOptions };
