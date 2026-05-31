
import { __decorate } from '../../../../../external/tslib/tslib.es6.js';
import { memoize } from './decorators.js';

class LinkedText {
    constructor(nodes) {
        this.nodes = nodes;
    }
    toString() {
        return ( this.nodes.map(node => typeof node === "string" ? node : node.label)).join("");
    }
}
LinkedText.__decorator = ( __decorate([memoize], LinkedText.prototype, "toString", null));
const LINK_REGEX = /\[([^\]]+)\]\(((?:https?:\/\/|command:|file:)[^\)\s]+)(?: (["'])(.+?)(\3))?\)/gi;
function parseLinkedText(text) {
    const result = [];
    let index = 0;
    let match;
    while (match = LINK_REGEX.exec(text)) {
        if (match.index - index > 0) {
            result.push(text.substring(index, match.index));
        }
        const [, label, href,, title] = match;
        if (title) {
            result.push({
                label,
                href,
                title
            });
        } else {
            result.push({
                label,
                href
            });
        }
        index = match.index + match[0].length;
    }
    if (index < text.length) {
        result.push(text.substring(index));
    }
    return ( new LinkedText(result));
}

export { LinkedText, parseLinkedText };
