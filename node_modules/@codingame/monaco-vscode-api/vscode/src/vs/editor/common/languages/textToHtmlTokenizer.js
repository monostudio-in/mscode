
import { CharCode } from '../../../base/common/charCode.js';
import { isFullWidthCharacter, splitLines, escape } from '../../../base/common/strings.js';
import { LineTokens } from '../tokens/lineTokens.js';
import { TokenizationRegistry } from '../languages.js';
import { LanguageId } from '../encodedTokenAttributes.js';
import { nullTokenizeEncoded, NullState } from './nullTokenize.js';

const fallback = {
    getInitialState: () => NullState,
    tokenizeEncoded: (buffer, hasEOL, state) => nullTokenizeEncoded(LanguageId.Null, state)
};
function tokenizeToStringSync(languageService, text, languageId) {
    return _tokenizeToString(
        text,
        languageService.languageIdCodec,
        TokenizationRegistry.get(languageId) || fallback
    );
}
async function tokenizeToString(languageService, text, languageId) {
    if (!languageId) {
        return _tokenizeToString(text, languageService.languageIdCodec, fallback);
    }
    const tokenizationSupport = await TokenizationRegistry.getOrCreate(languageId);
    return _tokenizeToString(text, languageService.languageIdCodec, tokenizationSupport || fallback);
}
function tokenizeLineToHTML(text, viewLineTokens, colorMap, startOffset, endOffset, tabSize, useNbsp) {
    let result = `<div>`;
    let charIndex = 0;
    let width = 0;
    let prevIsSpace = true;
    for (let tokenIndex = 0, tokenCount = viewLineTokens.getCount(); tokenIndex < tokenCount; tokenIndex++) {
        const tokenEndIndex = viewLineTokens.getEndOffset(tokenIndex);
        let partContent = "";
        for (; charIndex < tokenEndIndex && charIndex < endOffset; charIndex++) {
            const charCode = text.charCodeAt(charIndex);
            const isTab = charCode === CharCode.Tab;
            width += isFullWidthCharacter(charCode) ? 2 : (isTab ? 0 : 1);
            if (charIndex < startOffset) {
                if (isTab) {
                    const remainder = width % tabSize;
                    width += remainder === 0 ? tabSize : tabSize - remainder;
                }
                continue;
            }
            switch (charCode) {
            case CharCode.Tab:
                {
                    const remainder = width % tabSize;
                    const insertSpacesCount = remainder === 0 ? tabSize : tabSize - remainder;
                    width += insertSpacesCount;
                    let spacesRemaining = insertSpacesCount;
                    while (spacesRemaining > 0) {
                        if (useNbsp && prevIsSpace) {
                            partContent += "&#160;";
                            prevIsSpace = false;
                        } else {
                            partContent += " ";
                            prevIsSpace = true;
                        }
                        spacesRemaining--;
                    }
                    break;
                }
            case CharCode.LessThan:
                partContent += "&lt;";
                prevIsSpace = false;
                break;
            case CharCode.GreaterThan:
                partContent += "&gt;";
                prevIsSpace = false;
                break;
            case CharCode.Ampersand:
                partContent += "&amp;";
                prevIsSpace = false;
                break;
            case CharCode.Null:
                partContent += "&#00;";
                prevIsSpace = false;
                break;
            case CharCode.UTF8_BOM:
            case CharCode.LINE_SEPARATOR:
            case CharCode.PARAGRAPH_SEPARATOR:
            case CharCode.NEXT_LINE:
                partContent += "�";
                prevIsSpace = false;
                break;
            case CharCode.CarriageReturn:
                partContent += "&#8203";
                prevIsSpace = false;
                break;
            case CharCode.Space:
                if (useNbsp && prevIsSpace) {
                    partContent += "&#160;";
                    prevIsSpace = false;
                } else {
                    partContent += " ";
                    prevIsSpace = true;
                }
                break;
            default:
                partContent += String.fromCharCode(charCode);
                prevIsSpace = false;
            }
        }
        if (tokenEndIndex <= startOffset) {
            continue;
        }
        result += `<span style="${viewLineTokens.getInlineStyle(tokenIndex, colorMap)}">${partContent}</span>`;
        if (tokenEndIndex > endOffset || charIndex >= endOffset || startOffset >= endOffset) {
            break;
        }
    }
    result += `</div>`;
    return result;
}
function _tokenizeToString(text, languageIdCodec, tokenizationSupport) {
    let result = `<div class="monaco-tokenized-source">`;
    const lines = splitLines(text);
    let currentState = tokenizationSupport.getInitialState();
    for (let i = 0, len = lines.length; i < len; i++) {
        const line = lines[i];
        if (i > 0) {
            result += `<br/>`;
        }
        const tokenizationResult = tokenizationSupport.tokenizeEncoded(line, true, currentState);
        LineTokens.convertToEndOffset(tokenizationResult.tokens, line.length);
        const lineTokens = ( new LineTokens(tokenizationResult.tokens, line, languageIdCodec));
        const viewLineTokens = lineTokens.inflate();
        let startOffset = 0;
        for (let j = 0, lenJ = viewLineTokens.getCount(); j < lenJ; j++) {
            const type = viewLineTokens.getClassName(j);
            const endIndex = viewLineTokens.getEndOffset(j);
            result += `<span class="${type}">${escape(line.substring(startOffset, endIndex))}</span>`;
            startOffset = endIndex;
        }
        currentState = tokenizationResult.endState;
    }
    result += `</div>`;
    return result;
}

export { _tokenizeToString, tokenizeLineToHTML, tokenizeToString, tokenizeToStringSync };
