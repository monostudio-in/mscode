

var PromptNodeType;
(function (PromptNodeType) {
    PromptNodeType[PromptNodeType["Piece"] = 1] = "Piece";
    PromptNodeType[PromptNodeType["Text"] = 2] = "Text";
})(PromptNodeType || (PromptNodeType = {}));
var PieceCtorKind;
(function (PieceCtorKind) {
    PieceCtorKind[PieceCtorKind["BaseChatMessage"] = 1] = "BaseChatMessage";
    PieceCtorKind[PieceCtorKind["Other"] = 2] = "Other";
    PieceCtorKind[PieceCtorKind["ImageChatMessage"] = 3] = "ImageChatMessage";
})(PieceCtorKind || (PieceCtorKind = {}));
function stringifyPromptElementJSON(element) {
    const strs = [];
    stringifyPromptNodeJSON(element.node, strs);
    return strs.join('');
}
function stringifyPromptNodeJSON(node, strs) {
    if (node.type === PromptNodeType.Text) {
        if (node.lineBreakBefore) {
            strs.push('\n');
        }
        if (typeof node.text === 'string') {
            strs.push(node.text);
        }
    }
    else if (node.ctor === PieceCtorKind.ImageChatMessage) {
        strs.push('<image>');
    }
    else if (node.ctor === PieceCtorKind.BaseChatMessage || node.ctor === PieceCtorKind.Other) {
        for (const child of node.children) {
            stringifyPromptNodeJSON(child, strs);
        }
    }
}

export { PieceCtorKind, PromptNodeType, stringifyPromptElementJSON };
