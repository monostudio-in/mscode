
import { CharCode } from '../../../base/common/charCode.js';

function computeIndentLevel(line, tabSize) {
    let indent = 0;
    let i = 0;
    const len = line.length;
    while (i < len) {
        const chCode = line.charCodeAt(i);
        if (chCode === CharCode.Space) {
            indent++;
        }
        else if (chCode === CharCode.Tab) {
            indent = indent - indent % tabSize + tabSize;
        }
        else {
            break;
        }
        i++;
    }
    if (i === len) {
        return -1;
    }
    return indent;
}

export { computeIndentLevel };
