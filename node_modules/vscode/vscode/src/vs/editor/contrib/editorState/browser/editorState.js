
import { format } from '../../../../base/common/strings.js';
import { Range } from '../../../common/core/range.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { EditorKeybindingCancellationTokenSource } from './keybindingCancellation.js';

var CodeEditorStateFlag;
(function(CodeEditorStateFlag) {
    CodeEditorStateFlag[CodeEditorStateFlag["Value"] = 1] = "Value";
    CodeEditorStateFlag[CodeEditorStateFlag["Selection"] = 2] = "Selection";
    CodeEditorStateFlag[CodeEditorStateFlag["Position"] = 4] = "Position";
    CodeEditorStateFlag[CodeEditorStateFlag["Scroll"] = 8] = "Scroll";
})(CodeEditorStateFlag || (CodeEditorStateFlag = {}));
class EditorState {
    constructor(editor, flags) {
        this.flags = flags;
        if ((this.flags & CodeEditorStateFlag.Value) !== 0) {
            const model = editor.getModel();
            this.modelVersionId = model ? format("{0}#{1}", ( model.uri.toString()), model.getVersionId()) : null;
        } else {
            this.modelVersionId = null;
        }
        if ((this.flags & CodeEditorStateFlag.Position) !== 0) {
            this.position = editor.getPosition();
        } else {
            this.position = null;
        }
        if ((this.flags & CodeEditorStateFlag.Selection) !== 0) {
            this.selection = editor.getSelection();
        } else {
            this.selection = null;
        }
        if ((this.flags & CodeEditorStateFlag.Scroll) !== 0) {
            this.scrollLeft = editor.getScrollLeft();
            this.scrollTop = editor.getScrollTop();
        } else {
            this.scrollLeft = -1;
            this.scrollTop = -1;
        }
    }
    _equals(other) {
        if (!(other instanceof EditorState)) {
            return false;
        }
        const state = other;
        if (this.modelVersionId !== state.modelVersionId) {
            return false;
        }
        if (this.scrollLeft !== state.scrollLeft || this.scrollTop !== state.scrollTop) {
            return false;
        }
        if (!this.position && state.position || this.position && !state.position || this.position && state.position && !this.position.equals(state.position)) {
            return false;
        }
        if (!this.selection && state.selection || this.selection && !state.selection || this.selection && state.selection && !this.selection.equalsRange(state.selection)) {
            return false;
        }
        return true;
    }
    validate(editor) {
        return this._equals(( new EditorState(editor, this.flags)));
    }
}
class EditorStateCancellationTokenSource extends EditorKeybindingCancellationTokenSource {
    constructor(editor, flags, range, parent) {
        super(editor, parent);
        this._listener = ( new DisposableStore());
        if (flags & CodeEditorStateFlag.Position) {
            this._listener.add(editor.onDidChangeCursorPosition(e => {
                if (!range || !Range.containsPosition(range, e.position)) {
                    this.cancel();
                }
            }));
        }
        if (flags & CodeEditorStateFlag.Selection) {
            this._listener.add(editor.onDidChangeCursorSelection(e => {
                if (!range || !Range.containsRange(range, e.selection)) {
                    this.cancel();
                }
            }));
        }
        if (flags & CodeEditorStateFlag.Scroll) {
            this._listener.add(editor.onDidScrollChange(_ => this.cancel()));
        }
        if (flags & CodeEditorStateFlag.Value) {
            this._listener.add(editor.onDidChangeModel(_ => this.cancel()));
            this._listener.add(editor.onDidChangeModelContent(_ => this.cancel()));
        }
    }
    dispose() {
        this._listener.dispose();
        super.dispose();
    }
}
class TextModelCancellationTokenSource extends CancellationTokenSource {
    constructor(model, parent) {
        super(parent);
        this._listener = model.onDidChangeContent(() => this.cancel());
    }
    dispose() {
        this._listener.dispose();
        super.dispose();
    }
}

export { CodeEditorStateFlag, EditorState, EditorStateCancellationTokenSource, TextModelCancellationTokenSource };
