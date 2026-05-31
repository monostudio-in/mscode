
import { illegalArgument } from '../../../base/common/errors.js';
import { NotebookRange } from './extHostTypeConverters.js';
import { NotebookEditorRevealType } from './extHostTypes.js';
import { NotebookRange as NotebookRange$1 } from './extHostTypes/notebooks.js';

class ExtHostNotebookEditor {
    static {
        this.apiEditorsToExtHost = ( new WeakMap());
    }
    constructor(
        id,
        _proxy,
        notebookData,
        _visibleRanges,
        _selections,
        _viewColumn,
        viewType
    ) {
        this.id = id;
        this._proxy = _proxy;
        this.notebookData = notebookData;
        this._visibleRanges = _visibleRanges;
        this._selections = _selections;
        this._viewColumn = _viewColumn;
        this.viewType = viewType;
        this._visible = false;
    }
    get apiEditor() {
        if (!this._editor) {
            const that = this;
            this._editor = {
                get notebook() {
                    return that.notebookData.apiNotebook;
                },
                get selection() {
                    return that._selections[0];
                },
                set selection(selection) {
                    this.selections = [selection];
                },
                get selections() {
                    return that._selections;
                },
                set selections(value) {
                    if (!Array.isArray(value) || !value.every(NotebookRange$1.isNotebookRange)) {
                        throw illegalArgument("selections");
                    }
                    that._selections = value.length === 0 ? [( new NotebookRange$1(0, 0))] : value;
                    that._trySetSelections(that._selections);
                },
                get visibleRanges() {
                    return that._visibleRanges;
                },
                revealRange(range, revealType) {
                    that._proxy.$tryRevealRange(
                        that.id,
                        NotebookRange.from(range),
                        revealType ?? NotebookEditorRevealType.Default
                    );
                },
                get viewColumn() {
                    return that._viewColumn;
                },
                get replOptions() {
                    if (that.viewType === "repl") {
                        return {
                            appendIndex: this.notebook.cellCount - 1
                        };
                    }
                    return undefined;
                },
                [Symbol.for("debug.description")]() {
                    return `NotebookEditor(${( this.notebook.uri.toString())})`;
                }
            };
            ExtHostNotebookEditor.apiEditorsToExtHost.set(this._editor, this);
        }
        return this._editor;
    }
    get visible() {
        return this._visible;
    }
    _acceptVisibility(value) {
        this._visible = value;
    }
    _acceptVisibleRanges(value) {
        this._visibleRanges = value;
    }
    _acceptSelections(selections) {
        this._selections = selections;
    }
    _trySetSelections(value) {
        this._proxy.$trySetSelections(this.id, ( value.map(NotebookRange.from)));
    }
    _acceptViewColumn(value) {
        this._viewColumn = value;
    }
}

export { ExtHostNotebookEditor };
