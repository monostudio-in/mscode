
import { __decorate } from '../../../../../../../external/tslib/tslib.es6.js';
import { coalesceInPlace } from '../../../../base/common/arrays.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { CellEditType } from '../../../contrib/notebook/common/notebookCommon.js';
import { NotebookEdit } from './notebooks.js';
import { SnippetTextEdit } from './snippetTextEdit.js';
import { es5ClassCompat } from './es5ClassCompat.js';
import { Range } from './range.js';
import { TextEdit } from './textEdit.js';

var FileEditType;
(function(FileEditType) {
    FileEditType[FileEditType["File"] = 1] = "File";
    FileEditType[FileEditType["Text"] = 2] = "Text";
    FileEditType[FileEditType["Cell"] = 3] = "Cell";
    FileEditType[FileEditType["CellReplace"] = 5] = "CellReplace";
    FileEditType[FileEditType["Snippet"] = 6] = "Snippet";
})(FileEditType || (FileEditType = {}));
let WorkspaceEdit = class WorkspaceEdit {
    constructor() {
        this._edits = [];
    }
    _allEntries() {
        return this._edits;
    }
    renameFile(from, to, options, metadata) {
        this._edits.push({
            _type: FileEditType.File,
            from,
            to,
            options,
            metadata
        });
    }
    createFile(uri, options, metadata) {
        this._edits.push({
            _type: FileEditType.File,
            from: undefined,
            to: uri,
            options,
            metadata
        });
    }
    deleteFile(uri, options, metadata) {
        this._edits.push({
            _type: FileEditType.File,
            from: uri,
            to: undefined,
            options,
            metadata
        });
    }
    replaceNotebookMetadata(uri, value, metadata) {
        this._edits.push({
            _type: FileEditType.Cell,
            metadata,
            uri,
            edit: {
                editType: CellEditType.DocumentMetadata,
                metadata: value
            }
        });
    }
    replaceNotebookCells(uri, startOrRange, cellData, metadata) {
        const start = startOrRange.start;
        const end = startOrRange.end;
        if (start !== end || cellData.length > 0) {
            this._edits.push({
                _type: FileEditType.CellReplace,
                uri,
                index: start,
                count: end - start,
                cells: cellData,
                metadata
            });
        }
    }
    replaceNotebookCellMetadata(uri, index, cellMetadata, metadata) {
        this._edits.push({
            _type: FileEditType.Cell,
            metadata,
            uri,
            edit: {
                editType: CellEditType.Metadata,
                index,
                metadata: cellMetadata
            }
        });
    }
    replace(uri, range, newText, metadata) {
        this._edits.push({
            _type: FileEditType.Text,
            uri,
            edit: ( new TextEdit(range, newText)),
            metadata
        });
    }
    insert(resource, position, newText, metadata) {
        this.replace(resource, ( new Range(position, position)), newText, metadata);
    }
    delete(resource, range, metadata) {
        this.replace(resource, range, "", metadata);
    }
    has(uri) {
        return ( this._edits.some(edit => edit._type === FileEditType.Text && ( edit.uri.toString()) === ( uri.toString())));
    }
    set(uri, edits) {
        if (!edits) {
            for (let i = 0; i < this._edits.length; i++) {
                const element = this._edits[i];
                switch (element._type) {
                case FileEditType.Text:
                case FileEditType.Snippet:
                case FileEditType.Cell:
                case FileEditType.CellReplace:
                    if (( element.uri.toString()) === ( uri.toString())) {
                        this._edits[i] = undefined;
                    }
                    break;
                }
            }
            coalesceInPlace(this._edits);
        } else {
            for (const editOrTuple of edits) {
                if (!editOrTuple) {
                    continue;
                }
                let edit;
                let metadata;
                if (Array.isArray(editOrTuple)) {
                    edit = editOrTuple[0];
                    metadata = editOrTuple[1];
                } else {
                    edit = editOrTuple;
                }
                if (NotebookEdit.isNotebookCellEdit(edit)) {
                    if (edit.newCellMetadata) {
                        this.replaceNotebookCellMetadata(uri, edit.range.start, edit.newCellMetadata, metadata);
                    } else if (edit.newNotebookMetadata) {
                        this.replaceNotebookMetadata(uri, edit.newNotebookMetadata, metadata);
                    } else {
                        this.replaceNotebookCells(uri, edit.range, edit.newCells, metadata);
                    }
                } else if (SnippetTextEdit.isSnippetTextEdit(edit)) {
                    this._edits.push({
                        _type: FileEditType.Snippet,
                        uri,
                        range: edit.range,
                        edit: edit.snippet,
                        metadata,
                        keepWhitespace: edit.keepWhitespace
                    });
                } else {
                    this._edits.push({
                        _type: FileEditType.Text,
                        uri,
                        edit,
                        metadata
                    });
                }
            }
        }
    }
    get(uri) {
        const res = [];
        for (const candidate of this._edits) {
            if (candidate._type === FileEditType.Text && ( candidate.uri.toString()) === ( uri.toString())) {
                res.push(candidate.edit);
            }
        }
        return res;
    }
    entries() {
        const textEdits = ( new ResourceMap());
        for (const candidate of this._edits) {
            if (candidate._type === FileEditType.Text) {
                let textEdit = textEdits.get(candidate.uri);
                if (!textEdit) {
                    textEdit = [candidate.uri, []];
                    textEdits.set(candidate.uri, textEdit);
                }
                textEdit[1].push(candidate.edit);
            }
        }
        return [...( textEdits.values())];
    }
    get size() {
        return this.entries().length;
    }
    toJSON() {
        return this.entries();
    }
};
WorkspaceEdit = ( __decorate([es5ClassCompat], WorkspaceEdit));

export { FileEditType, WorkspaceEdit };
