
import { Range } from '../../../../../editor/common/core/range.js';

function isSearchTreeAIFileMatch(obj) {
    return obj && obj.getFullRange && obj.getFullRange() instanceof Range;
}

export { isSearchTreeAIFileMatch };
