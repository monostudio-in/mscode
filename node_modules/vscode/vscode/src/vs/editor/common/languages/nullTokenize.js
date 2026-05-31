
import { TokenizationResult, Token, EncodedTokenizationResult } from '../languages.js';
import { MetadataConsts, StandardTokenType, FontStyle, ColorId } from '../encodedTokenAttributes.js';

const NullState = new class {
    clone() {
        return this;
    }
    equals(other) {
        return (this === other);
    }
}();
function nullTokenize(languageId, state) {
    return ( new TokenizationResult([( new Token(0, "", languageId))], state));
}
function nullTokenizeEncoded(languageId, state) {
    const tokens = ( new Uint32Array(2));
    tokens[0] = 0;
    tokens[1] = ((languageId << MetadataConsts.LANGUAGEID_OFFSET) | (StandardTokenType.Other << MetadataConsts.TOKEN_TYPE_OFFSET) | (FontStyle.None << MetadataConsts.FONT_STYLE_OFFSET) | (ColorId.DefaultForeground << MetadataConsts.FOREGROUND_OFFSET) | (ColorId.DefaultBackground << MetadataConsts.BACKGROUND_OFFSET)) >>> 0;
    return ( new EncodedTokenizationResult(tokens, [], state === null ? NullState : state));
}

export { NullState, nullTokenize, nullTokenizeEncoded };
