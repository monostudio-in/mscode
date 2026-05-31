
import { onUnexpectedError } from '../../../../../base/common/errors.js';
import { AbstractText } from '../../../../common/core/text/abstractText.js';
import { TextLength } from '../../../../common/core/text/textLength.js';

class TextModelValueReference extends AbstractText {
    static snapshot(textModel) {
        return ( new TextModelValueReference(textModel));
    }
    constructor(_textModel) {
        super();
        this._textModel = _textModel;
        this._version = _textModel.getVersionId();
    }
    get uri() {
        return this._textModel.uri;
    }
    get version() {
        return this._version;
    }
    _assertValid() {
        if (this._textModel.getVersionId() !== this._version) {
            onUnexpectedError(( new Error(
                `TextModel has changed: expected version ${this._version}, got ${this._textModel.getVersionId()}`
            )));
        }
    }
    targets(textModel) {
        return ( this._textModel.uri.toString()) === ( textModel.uri.toString());
    }
    getValueOfRange(range) {
        this._assertValid();
        return this._textModel.getValueInRange(range);
    }
    getLineLength(lineNumber) {
        this._assertValid();
        return this._textModel.getLineLength(lineNumber);
    }
    get length() {
        this._assertValid();
        const lastLineNumber = this._textModel.getLineCount();
        const lastLineLen = this._textModel.getLineLength(lastLineNumber);
        return ( new TextLength(lastLineNumber - 1, lastLineLen));
    }
    getEOL() {
        this._assertValid();
        return this._textModel.getEOL();
    }
    getPositionAt(offset) {
        this._assertValid();
        return this._textModel.getPositionAt(offset);
    }
    getValueInRange(range) {
        this._assertValid();
        return this._textModel.getValueInRange(range);
    }
    getVersionId() {
        return this._version;
    }
    dangerouslyGetUnderlyingModel() {
        return this._textModel;
    }
}

export { TextModelValueReference };
