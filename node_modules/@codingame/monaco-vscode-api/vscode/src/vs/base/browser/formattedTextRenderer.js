
import { createElement, createTextNode, addStandardDisposableListener } from './dom.js';

function renderText(text, _options, target) {
    const element = target ?? createElement("div");
    element.textContent = text;
    return element;
}
function renderFormattedText(formattedText, options, target) {
    const element = target ?? createElement("div");
    element.textContent = "";
    _renderFormattedText(
        element,
        parseFormattedText(formattedText, !!options?.renderCodeSegments),
        options?.actionHandler,
        options?.renderCodeSegments
    );
    return element;
}
class StringStream {
    constructor(source) {
        this.source = source;
        this.index = 0;
    }
    eos() {
        return this.index >= this.source.length;
    }
    next() {
        const next = this.peek();
        this.advance();
        return next;
    }
    peek() {
        return this.source[this.index];
    }
    advance() {
        this.index++;
    }
}
var FormatType;
(function(FormatType) {
    FormatType[FormatType["Invalid"] = 0] = "Invalid";
    FormatType[FormatType["Root"] = 1] = "Root";
    FormatType[FormatType["Text"] = 2] = "Text";
    FormatType[FormatType["Bold"] = 3] = "Bold";
    FormatType[FormatType["Italics"] = 4] = "Italics";
    FormatType[FormatType["Action"] = 5] = "Action";
    FormatType[FormatType["ActionClose"] = 6] = "ActionClose";
    FormatType[FormatType["Code"] = 7] = "Code";
    FormatType[FormatType["NewLine"] = 8] = "NewLine";
})(FormatType || (FormatType = {}));
function _renderFormattedText(element, treeNode, actionHandler, renderCodeSegments) {
    let child;
    if (treeNode.type === FormatType.Text) {
        child = createTextNode(treeNode.content || "");
    } else if (treeNode.type === FormatType.Bold) {
        child = createElement("b");
    } else if (treeNode.type === FormatType.Italics) {
        child = createElement("i");
    } else if (treeNode.type === FormatType.Code && renderCodeSegments) {
        child = createElement("code");
    } else if (treeNode.type === FormatType.Action && actionHandler) {
        const a = createElement("a");
        actionHandler.disposables.add(addStandardDisposableListener(a, "click", event => {
            actionHandler.callback(String(treeNode.index), event);
        }));
        child = a;
    } else if (treeNode.type === FormatType.NewLine) {
        child = createElement("br");
    } else if (treeNode.type === FormatType.Root) {
        child = element;
    }
    if (child && element !== child) {
        element.appendChild(child);
    }
    if (child && Array.isArray(treeNode.children)) {
        treeNode.children.forEach(nodeChild => {
            _renderFormattedText(child, nodeChild, actionHandler, renderCodeSegments);
        });
    }
}
function parseFormattedText(content, parseCodeSegments) {
    const root = {
        type: FormatType.Root,
        children: []
    };
    let actionViewItemIndex = 0;
    let current = root;
    const stack = [];
    const stream = ( new StringStream(content));
    while (!stream.eos()) {
        let next = stream.next();
        const isEscapedFormatType = (next === "\\" && formatTagType(stream.peek(), parseCodeSegments) !== FormatType.Invalid);
        if (isEscapedFormatType) {
            next = stream.next();
        }
        if (!isEscapedFormatType && isFormatTag(next, parseCodeSegments) && next === stream.peek()) {
            stream.advance();
            if (current.type === FormatType.Text) {
                current = stack.pop();
            }
            const type = formatTagType(next, parseCodeSegments);
            if (current.type === type || (current.type === FormatType.Action && type === FormatType.ActionClose)) {
                current = stack.pop();
            } else {
                const newCurrent = {
                    type: type,
                    children: []
                };
                if (type === FormatType.Action) {
                    newCurrent.index = actionViewItemIndex;
                    actionViewItemIndex++;
                }
                current.children.push(newCurrent);
                stack.push(current);
                current = newCurrent;
            }
        } else if (next === "\n") {
            if (current.type === FormatType.Text) {
                current = stack.pop();
            }
            current.children.push({
                type: FormatType.NewLine
            });
        } else {
            if (current.type !== FormatType.Text) {
                const textCurrent = {
                    type: FormatType.Text,
                    content: next
                };
                current.children.push(textCurrent);
                stack.push(current);
                current = textCurrent;
            } else {
                current.content += next;
            }
        }
    }
    if (current.type === FormatType.Text) {
        current = stack.pop();
    }
    return root;
}
function isFormatTag(char, supportCodeSegments) {
    return formatTagType(char, supportCodeSegments) !== FormatType.Invalid;
}
function formatTagType(char, supportCodeSegments) {
    switch (char) {
    case "*":
        return FormatType.Bold;
    case "_":
        return FormatType.Italics;
    case "[":
        return FormatType.Action;
    case "]":
        return FormatType.ActionClose;
    case "`":
        return supportCodeSegments ? FormatType.Code : FormatType.Invalid;
    default:
        return FormatType.Invalid;
    }
}

export { renderFormattedText, renderText };
