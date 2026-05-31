
import { setProperty } from '../../../base/common/jsonEdit.js';

function edit(content, originalPath, value, formattingOptions) {
    const edit = setProperty(content, originalPath, value, formattingOptions)[0];
    if (edit) {
        content = content.substring(0, edit.offset) + edit.content + content.substring(edit.offset + edit.length);
    }
    return content;
}

export { edit };
