
import { CharCode } from '../../../base/common/charCode.js';
import { safeIntl } from '../../../base/common/date.js';
import { LRUCache } from '../../../base/common/map.js';
import { CharacterClassifier } from './characterClassifier.js';

var WordCharacterClass;
(function(WordCharacterClass) {
    WordCharacterClass[WordCharacterClass["Regular"] = 0] = "Regular";
    WordCharacterClass[WordCharacterClass["Whitespace"] = 1] = "Whitespace";
    WordCharacterClass[WordCharacterClass["WordSeparator"] = 2] = "WordSeparator";
})(WordCharacterClass || (WordCharacterClass = {}));
class WordCharacterClassifier extends CharacterClassifier {
    constructor(wordSeparators, intlSegmenterLocales) {
        super(WordCharacterClass.Regular);
        this._segmenter = null;
        this._cachedLine = null;
        this._cachedSegments = [];
        this.intlSegmenterLocales = intlSegmenterLocales;
        if (this.intlSegmenterLocales.length > 0) {
            this._segmenter = safeIntl.Segmenter(this.intlSegmenterLocales, {
                granularity: "word"
            });
        } else {
            this._segmenter = null;
        }
        for (let i = 0, len = wordSeparators.length; i < len; i++) {
            this.set(wordSeparators.charCodeAt(i), WordCharacterClass.WordSeparator);
        }
        this.set(CharCode.Space, WordCharacterClass.Whitespace);
        this.set(CharCode.Tab, WordCharacterClass.Whitespace);
    }
    findPrevIntlWordBeforeOrAtOffset(line, offset) {
        let candidate = null;
        for (const segment of this._getIntlSegmenterWordsOnLine(line)) {
            if (segment.index > offset) {
                break;
            }
            candidate = segment;
        }
        return candidate;
    }
    findNextIntlWordAtOrAfterOffset(lineContent, offset) {
        for (const segment of this._getIntlSegmenterWordsOnLine(lineContent)) {
            if (segment.index < offset) {
                continue;
            }
            return segment;
        }
        return null;
    }
    _getIntlSegmenterWordsOnLine(line) {
        if (!this._segmenter) {
            return [];
        }
        if (this._cachedLine === line) {
            return this._cachedSegments;
        }
        this._cachedLine = line;
        this._cachedSegments = this._filterWordSegments(this._segmenter.value.segment(line));
        return this._cachedSegments;
    }
    _filterWordSegments(segments) {
        const result = [];
        for (const segment of segments) {
            if (this._isWordLike(segment)) {
                result.push(segment);
            }
        }
        return result;
    }
    _isWordLike(segment) {
        if (segment.isWordLike) {
            return true;
        }
        return false;
    }
}
const wordClassifierCache = ( new LRUCache(10));
function getMapForWordSeparators(wordSeparators, intlSegmenterLocales) {
    const key = `${wordSeparators}/${intlSegmenterLocales.join(",")}`;
    let result = wordClassifierCache.get(key);
    if (!result) {
        result = ( new WordCharacterClassifier(wordSeparators, intlSegmenterLocales));
        wordClassifierCache.set(key, result);
    }
    return result;
}

export { WordCharacterClass, WordCharacterClassifier, getMapForWordSeparators };
