
import { Range } from '../core/range.js';
import { Searcher } from '../model/textModelSearch.js';
import { isHighSurrogate, AmbiguousCharacters, escapeRegExpCharacters, InvisibleCharacters, isBasicASCII } from '../../../base/common/strings.js';
import { assertNever } from '../../../base/common/assert.js';
import { getWordAtText, DEFAULT_WORD_REGEXP } from '../core/wordHelper.js';

class UnicodeTextModelHighlighter {
    static computeUnicodeHighlights(model, options, range) {
        const startLine = range ? range.startLineNumber : 1;
        const endLine = range ? range.endLineNumber : model.getLineCount();
        const codePointHighlighter = ( new CodePointHighlighter(options));
        const candidates = codePointHighlighter.getCandidateCodePoints();
        let regex;
        if (candidates === "allNonBasicAscii") {
            regex = ( new RegExp("[^\\t\\n\\r\\x20-\\x7E]", "g"));
        } else {
            regex = ( new RegExp(`${buildRegExpCharClassExpr(Array.from(candidates))}`, "g"));
        }
        const searcher = ( new Searcher(null, regex));
        const ranges = [];
        let hasMore = false;
        let m;
        let ambiguousCharacterCount = 0;
        let invisibleCharacterCount = 0;
        let nonBasicAsciiCharacterCount = 0;
        forLoop:
        for (let lineNumber = startLine, lineCount = endLine; lineNumber <= lineCount; lineNumber++) {
            const lineContent = model.getLineContent(lineNumber);
            const lineLength = lineContent.length;
            searcher.reset(0);
            do {
                m = searcher.next(lineContent);
                if (m) {
                    let startIndex = m.index;
                    let endIndex = m.index + m[0].length;
                    if (startIndex > 0) {
                        const charCodeBefore = lineContent.charCodeAt(startIndex - 1);
                        if (isHighSurrogate(charCodeBefore)) {
                            startIndex--;
                        }
                    }
                    if (endIndex + 1 < lineLength) {
                        const charCodeBefore = lineContent.charCodeAt(endIndex - 1);
                        if (isHighSurrogate(charCodeBefore)) {
                            endIndex++;
                        }
                    }
                    const str = lineContent.substring(startIndex, endIndex);
                    let word = getWordAtText(startIndex + 1, DEFAULT_WORD_REGEXP, lineContent, 0);
                    if (word && word.endColumn <= startIndex + 1) {
                        word = null;
                    }
                    const highlightReason = codePointHighlighter.shouldHighlightNonBasicASCII(str, word ? word.word : null);
                    if (highlightReason !== SimpleHighlightReason.None) {
                        if (highlightReason === SimpleHighlightReason.Ambiguous) {
                            ambiguousCharacterCount++;
                        } else if (highlightReason === SimpleHighlightReason.Invisible) {
                            invisibleCharacterCount++;
                        } else if (highlightReason === SimpleHighlightReason.NonBasicASCII) {
                            nonBasicAsciiCharacterCount++;
                        } else {
                            assertNever();
                        }
                        const MAX_RESULT_LENGTH = 1000;
                        if (ranges.length >= MAX_RESULT_LENGTH) {
                            hasMore = true;
                            break forLoop;
                        }
                        ranges.push(( new Range(lineNumber, startIndex + 1, lineNumber, endIndex + 1)));
                    }
                }
            } while (m);
        }
        return {
            ranges,
            hasMore,
            ambiguousCharacterCount,
            invisibleCharacterCount,
            nonBasicAsciiCharacterCount
        };
    }
    static computeUnicodeHighlightReason(char, options) {
        const codePointHighlighter = ( new CodePointHighlighter(options));
        const reason = codePointHighlighter.shouldHighlightNonBasicASCII(char, null);
        switch (reason) {
        case SimpleHighlightReason.None:
            return null;
        case SimpleHighlightReason.Invisible:
            return {
                kind: UnicodeHighlighterReasonKind.Invisible
            };
        case SimpleHighlightReason.Ambiguous:
            {
                const codePoint = char.codePointAt(0);
                const primaryConfusable = codePointHighlighter.ambiguousCharacters.getPrimaryConfusable(codePoint);
                const notAmbiguousInLocales = AmbiguousCharacters.getLocales().filter(l => !AmbiguousCharacters.getInstance(( new Set([...options.allowedLocales, l]))).isAmbiguous(codePoint));
                return {
                    kind: UnicodeHighlighterReasonKind.Ambiguous,
                    confusableWith: String.fromCodePoint(primaryConfusable),
                    notAmbiguousInLocales
                };
            }
        case SimpleHighlightReason.NonBasicASCII:
            return {
                kind: UnicodeHighlighterReasonKind.NonBasicAscii
            };
        }
    }
}
function buildRegExpCharClassExpr(codePoints, flags) {
    const src = `[${escapeRegExpCharacters(( codePoints.map(i => String.fromCodePoint(i))).join(""))}]`;
    return src;
}
var UnicodeHighlighterReasonKind;
(function(UnicodeHighlighterReasonKind) {
    UnicodeHighlighterReasonKind[UnicodeHighlighterReasonKind["Ambiguous"] = 0] = "Ambiguous";
    UnicodeHighlighterReasonKind[UnicodeHighlighterReasonKind["Invisible"] = 1] = "Invisible";
    UnicodeHighlighterReasonKind[UnicodeHighlighterReasonKind["NonBasicAscii"] = 2] = "NonBasicAscii";
})(UnicodeHighlighterReasonKind || (UnicodeHighlighterReasonKind = {}));
class CodePointHighlighter {
    constructor(options) {
        this.options = options;
        this.allowedCodePoints = ( new Set(options.allowedCodePoints));
        this.ambiguousCharacters = AmbiguousCharacters.getInstance(( new Set(options.allowedLocales)));
    }
    getCandidateCodePoints() {
        if (this.options.nonBasicASCII) {
            return "allNonBasicAscii";
        }
        const set = ( new Set());
        if (this.options.invisibleCharacters) {
            for (const cp of InvisibleCharacters.codePoints) {
                if (!isAllowedInvisibleCharacter(String.fromCodePoint(cp))) {
                    set.add(cp);
                }
            }
        }
        if (this.options.ambiguousCharacters) {
            for (const cp of this.ambiguousCharacters.getConfusableCodePoints()) {
                set.add(cp);
            }
        }
        for (const cp of this.allowedCodePoints) {
            set.delete(cp);
        }
        return set;
    }
    shouldHighlightNonBasicASCII(character, wordContext) {
        const codePoint = character.codePointAt(0);
        if (( this.allowedCodePoints.has(codePoint))) {
            return SimpleHighlightReason.None;
        }
        if (this.options.nonBasicASCII) {
            return SimpleHighlightReason.NonBasicASCII;
        }
        let hasBasicASCIICharacters = false;
        let hasNonConfusableNonBasicAsciiCharacter = false;
        if (wordContext) {
            for (const char of wordContext) {
                const codePoint = char.codePointAt(0);
                const isBasicASCII$1 = isBasicASCII(char);
                hasBasicASCIICharacters = hasBasicASCIICharacters || isBasicASCII$1;
                if (!isBasicASCII$1 && !this.ambiguousCharacters.isAmbiguous(codePoint) && !InvisibleCharacters.isInvisibleCharacter(codePoint)) {
                    hasNonConfusableNonBasicAsciiCharacter = true;
                }
            }
        }
        if ( !hasBasicASCIICharacters &&  hasNonConfusableNonBasicAsciiCharacter) {
            return SimpleHighlightReason.None;
        }
        if (this.options.invisibleCharacters) {
            if (!isAllowedInvisibleCharacter(character) && InvisibleCharacters.isInvisibleCharacter(codePoint)) {
                return SimpleHighlightReason.Invisible;
            }
        }
        if (this.options.ambiguousCharacters) {
            if (this.ambiguousCharacters.isAmbiguous(codePoint)) {
                return SimpleHighlightReason.Ambiguous;
            }
        }
        return SimpleHighlightReason.None;
    }
}
function isAllowedInvisibleCharacter(character) {
    return character === " " || character === "\n" || character === "\t";
}
var SimpleHighlightReason;
(function(SimpleHighlightReason) {
    SimpleHighlightReason[SimpleHighlightReason["None"] = 0] = "None";
    SimpleHighlightReason[SimpleHighlightReason["NonBasicASCII"] = 1] = "NonBasicASCII";
    SimpleHighlightReason[SimpleHighlightReason["Invisible"] = 2] = "Invisible";
    SimpleHighlightReason[SimpleHighlightReason["Ambiguous"] = 3] = "Ambiguous";
})(SimpleHighlightReason || (SimpleHighlightReason = {}));

export { UnicodeHighlighterReasonKind, UnicodeTextModelHighlighter };
