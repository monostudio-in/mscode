
import { TreeVisibility } from '../../../../base/browser/ui/tree/tree.js';
import { matchesFuzzyIconAware, parseLabelWithIcons } from '../../../../base/common/iconLabels.js';

class QuickInputTreeFilter {
    constructor() {
        this.filterValue = '';
        this.matchOnLabel = true;
        this.matchOnDescription = false;
    }
    filter(element, parentVisibility) {
        if (!this.filterValue || !(this.matchOnLabel || this.matchOnDescription)) {
            return element.children
                ? { visibility: TreeVisibility.Recurse, data: {} }
                : { visibility: TreeVisibility.Visible, data: {} };
        }
        const labelHighlights = this.matchOnLabel ? matchesFuzzyIconAware(this.filterValue, parseLabelWithIcons(element.label)) ?? undefined : undefined;
        const descriptionHighlights = this.matchOnDescription ? matchesFuzzyIconAware(this.filterValue, parseLabelWithIcons(element.description || '')) ?? undefined : undefined;
        const visibility = parentVisibility === TreeVisibility.Visible
            ? TreeVisibility.Visible
            : (labelHighlights || descriptionHighlights)
                ? TreeVisibility.Visible
                : element.children
                    ? TreeVisibility.Recurse
                    : TreeVisibility.Hidden;
        return {
            visibility,
            data: {
                labelHighlights,
                descriptionHighlights
            }
        };
    }
}

export { QuickInputTreeFilter };
