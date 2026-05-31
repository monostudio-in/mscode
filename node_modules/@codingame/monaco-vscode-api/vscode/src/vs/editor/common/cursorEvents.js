

var CursorChangeReason;
(function (CursorChangeReason) {
    CursorChangeReason[CursorChangeReason["NotSet"] = 0] = "NotSet";
    CursorChangeReason[CursorChangeReason["ContentFlush"] = 1] = "ContentFlush";
    CursorChangeReason[CursorChangeReason["RecoverFromMarkers"] = 2] = "RecoverFromMarkers";
    CursorChangeReason[CursorChangeReason["Explicit"] = 3] = "Explicit";
    CursorChangeReason[CursorChangeReason["Paste"] = 4] = "Paste";
    CursorChangeReason[CursorChangeReason["Undo"] = 5] = "Undo";
    CursorChangeReason[CursorChangeReason["Redo"] = 6] = "Redo";
})(CursorChangeReason || (CursorChangeReason = {}));

export { CursorChangeReason };
