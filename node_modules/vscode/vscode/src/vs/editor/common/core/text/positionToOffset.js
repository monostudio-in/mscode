
import { StringReplacement, StringEdit } from '../edits/stringEdit.js';
import { TextEdit, TextReplacement } from '../edits/textEdit.js';
import { _setPositionOffsetTransformerDependencies } from './positionToOffsetImpl.js';
export { PositionOffsetTransformer, PositionOffsetTransformerBase } from './positionToOffsetImpl.js';
import { TextLength } from './textLength.js';

_setPositionOffsetTransformerDependencies({
    StringEdit: StringEdit,
    StringReplacement: StringReplacement,
    TextReplacement: TextReplacement,
    TextEdit: TextEdit,
    TextLength: TextLength,
});
