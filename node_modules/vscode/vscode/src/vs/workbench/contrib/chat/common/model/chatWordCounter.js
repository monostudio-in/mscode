
import { mathInlineRegExp } from '../../../markdown/common/markedKatexExtension.js';

const r = String.raw;
const linkPattern =
r`(?<!\\)` +
r`(!?\[` +  r`(?:` +  r`[^\[\]\\]|` +  r`\\.|` +  r`\[[^\[\]]*\]` +  r`)*` + r`\])` +
r`(\(\s*)` +  r`(` +  r`[^\s\(\)<](?:[^\s\(\)]|\([^\s\(\)]*?\))*|` +  r`<(?:\\[<>]|[^<>])+>` +  r`)` +
 r`\s*(?:"[^"]*"|'[^']*'|\([^\(\)]*\))?\s*` + r`\)`;
function getNWords(str, numWordsToCount) {
    const backtick = "`";
    const wordRegExp = ( new RegExp(
        "(?:" + linkPattern + ")|(?:" + mathInlineRegExp.source + r`)|\p{sc=Han}|=+|\++|-+|[^\s\|\p{sc=Han}|=|\+|\-|${backtick}]+`,
        "gu"
    ));
    const allWordMatches = Array.from(str.matchAll(wordRegExp));
    const targetWords = allWordMatches.slice(0, numWordsToCount);
    const endIndex = numWordsToCount >= allWordMatches.length ?
    str.length : targetWords.length ? targetWords.at(-1).index + targetWords.at(-1)[0].length : 0;
    const value = str.substring(0, endIndex);
    return {
        value,
        returnedWordCount: targetWords.length === 0 ? (value.length ? 1 : 0) : targetWords.length,
        isFullString: endIndex >= str.length,
        totalWordCount: allWordMatches.length
    };
}
function countWords(str) {
    const result = getNWords(str, Number.MAX_SAFE_INTEGER);
    return result.returnedWordCount;
}

export { countWords, getNWords };
