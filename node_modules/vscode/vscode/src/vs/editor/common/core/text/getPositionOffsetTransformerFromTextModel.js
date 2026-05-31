
import './positionToOffset.js';
import { PositionOffsetTransformerBase } from './positionToOffsetImpl.js';

function getPositionOffsetTransformerFromTextModel(textModel) {
    return ( new PositionOffsetTransformerWithTextModel(textModel));
}
class PositionOffsetTransformerWithTextModel extends PositionOffsetTransformerBase {
    constructor(_textModel) {
        super();
        this._textModel = _textModel;
    }
    getOffset(position) {
        return this._textModel.getOffsetAt(position);
    }
    getPosition(offset) {
        return this._textModel.getPositionAt(offset);
    }
}

export { getPositionOffsetTransformerFromTextModel };
