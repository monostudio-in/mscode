
import { safeIntl } from '../../../base/common/date.js';

function createContentSegmenter(lineData, options) {
    if (lineData.isBasicASCII && options.useMonospaceOptimizations) {
        return ( new AsciiContentSegmenter(lineData));
    }
    return ( new GraphemeContentSegmenter(lineData));
}
class AsciiContentSegmenter {
    constructor(lineData) {
        this._content = lineData.content;
    }
    getSegmentAtIndex(index) {
        return this._content[index];
    }
    getSegmentData(index) {
        return undefined;
    }
}
class GraphemeContentSegmenter {
    constructor(lineData) {
        this._segments = [];
        const content = lineData.content;
        const segmenter = safeIntl.Segmenter(undefined, {
            granularity: "grapheme"
        }).value;
        const segmentedContent = Array.from(segmenter.segment(content));
        let segmenterIndex = 0;
        for (let x = 0; x < content.length; x++) {
            const segment = segmentedContent[segmenterIndex];
            if (!segment) {
                break;
            }
            if (segment.index !== x) {
                this._segments.push(undefined);
                continue;
            }
            segmenterIndex++;
            this._segments.push(segment);
        }
    }
    getSegmentAtIndex(index) {
        return this._segments[index]?.segment;
    }
    getSegmentData(index) {
        return this._segments[index];
    }
}

export { createContentSegmenter };
