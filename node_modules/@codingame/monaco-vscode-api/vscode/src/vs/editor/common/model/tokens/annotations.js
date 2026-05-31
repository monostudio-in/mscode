
import { binarySearch2 } from '../../../../base/common/arrays.js';
import { OffsetRange } from '../../core/ranges/offsetRange.js';

class AnnotatedString {
    constructor(annotations = []) {
        this._annotations = [];
        this._annotations = annotations;
    }
    setAnnotations(annotations) {
        for (const annotation of annotations.annotations) {
            const startIndex = this._getStartIndexOfIntersectingAnnotation(annotation.range.start);
            const endIndexExclusive = this._getEndIndexOfIntersectingAnnotation(annotation.range.endExclusive);
            if (annotation.annotation !== undefined) {
                this._annotations.splice(startIndex, endIndexExclusive - startIndex, {
                    range: annotation.range,
                    annotation: annotation.annotation
                });
            } else {
                this._annotations.splice(startIndex, endIndexExclusive - startIndex);
            }
        }
    }
    getAnnotationsIntersecting(range) {
        const startIndex = this._getStartIndexOfIntersectingAnnotation(range.start);
        const endIndexExclusive = this._getEndIndexOfIntersectingAnnotation(range.endExclusive);
        return this._annotations.slice(startIndex, endIndexExclusive);
    }
    _getStartIndexOfIntersectingAnnotation(offset) {
        const startIndexWhereToReplace = binarySearch2(this._annotations.length, index => {
            return this._annotations[index].range.start - offset;
        });
        let startIndex;
        if (startIndexWhereToReplace >= 0) {
            startIndex = startIndexWhereToReplace;
            const nextCandidate = this._annotations[startIndex]?.range;
            if (nextCandidate && nextCandidate.endExclusive === offset) {
                startIndex--;
            }
        } else {
            const candidate = this._annotations[-(startIndexWhereToReplace + 2)]?.range;
            if (candidate && offset >= candidate.start && offset < candidate.endExclusive) {
                startIndex = -(startIndexWhereToReplace + 2);
            } else {
                startIndex = -(startIndexWhereToReplace + 1);
            }
        }
        return startIndex;
    }
    _getEndIndexOfIntersectingAnnotation(offset) {
        const endIndexWhereToReplace = binarySearch2(this._annotations.length, index => {
            return this._annotations[index].range.endExclusive - offset;
        });
        let endIndexExclusive;
        if (endIndexWhereToReplace >= 0) {
            endIndexExclusive = endIndexWhereToReplace + 1;
            const nextCandidate = this._annotations[endIndexExclusive]?.range;
            if (nextCandidate && nextCandidate.start === offset) {
                endIndexExclusive++;
            }
        } else {
            const candidate = this._annotations[-(endIndexWhereToReplace + 1)]?.range;
            if (candidate && offset >= candidate.start && offset <= candidate.endExclusive) {
                endIndexExclusive = -endIndexWhereToReplace;
            } else {
                endIndexExclusive = -(endIndexWhereToReplace + 1);
            }
        }
        return endIndexExclusive;
    }
    getAllAnnotations() {
        return this._annotations.slice();
    }
    applyEdit(edit) {
        const annotations = this._annotations.slice();
        const finalAnnotations = [];
        const deletedAnnotations = [];
        let offset = 0;
        for (const e of edit.replacements) {
            while (true) {
                const annotation = annotations[0];
                if (!annotation) {
                    break;
                }
                const range = annotation.range;
                if (range.endExclusive >= e.replaceRange.start) {
                    break;
                }
                annotations.shift();
                const newAnnotation = {
                    range: range.delta(offset),
                    annotation: annotation.annotation
                };
                if (!newAnnotation.range.isEmpty) {
                    finalAnnotations.push(newAnnotation);
                } else {
                    deletedAnnotations.push(newAnnotation);
                }
            }
            const intersecting = [];
            while (true) {
                const annotation = annotations[0];
                if (!annotation) {
                    break;
                }
                const range = annotation.range;
                if (!range.intersectsOrTouches(e.replaceRange)) {
                    break;
                }
                annotations.shift();
                intersecting.push(annotation);
            }
            for (let i = intersecting.length - 1; i >= 0; i--) {
                const annotation = intersecting[i];
                let r = annotation.range;
                const shouldExtend = i === 0 && (e.replaceRange.endExclusive > r.start) && (e.replaceRange.start < r.endExclusive);
                const overlap = r.intersect(e.replaceRange).length;
                r = r.deltaEnd(-overlap + (shouldExtend ? e.newText.length : 0));
                const rangeAheadOfReplaceRange = r.start - e.replaceRange.start;
                if (rangeAheadOfReplaceRange > 0) {
                    r = r.delta(-rangeAheadOfReplaceRange);
                }
                if (!shouldExtend && rangeAheadOfReplaceRange >= 0) {
                    r = r.delta(e.newText.length);
                }
                r = r.delta(-(e.newText.length - e.replaceRange.length));
                annotations.unshift({
                    annotation: annotation.annotation,
                    range: r
                });
            }
            offset += e.newText.length - e.replaceRange.length;
        }
        while (true) {
            const annotation = annotations[0];
            if (!annotation) {
                break;
            }
            annotations.shift();
            const newAnnotation = {
                annotation: annotation.annotation,
                range: annotation.range.delta(offset)
            };
            if (!newAnnotation.range.isEmpty) {
                finalAnnotations.push(newAnnotation);
            } else {
                deletedAnnotations.push(newAnnotation);
            }
        }
        this._annotations = finalAnnotations;
        return deletedAnnotations;
    }
    clone() {
        return ( new AnnotatedString(this._annotations.slice()));
    }
}
class AnnotationsUpdate {
    static create(annotations) {
        return ( new AnnotationsUpdate(annotations));
    }
    constructor(annotations) {
        this._annotations = annotations;
    }
    get annotations() {
        return this._annotations;
    }
    rebase(edit) {
        const annotatedString = ( new AnnotatedString(this._annotations));
        annotatedString.applyEdit(edit);
        this._annotations = annotatedString.getAllAnnotations();
    }
    serialize(serializingFunc) {
        return ( this._annotations.map(annotation => {
            const range = {
                start: annotation.range.start,
                endExclusive: annotation.range.endExclusive
            };
            if (!annotation.annotation) {
                return {
                    range,
                    annotation: undefined
                };
            }
            return {
                range,
                annotation: serializingFunc(annotation.annotation)
            };
        }));
    }
    static deserialize(serializedAnnotations, deserializingFunc) {
        const annotations = ( serializedAnnotations.map(serializedAnnotation => {
            const range = ( new OffsetRange(serializedAnnotation.range.start, serializedAnnotation.range.endExclusive));
            if (!serializedAnnotation.annotation) {
                return {
                    range,
                    annotation: undefined
                };
            }
            return {
                range,
                annotation: deserializingFunc(serializedAnnotation.annotation)
            };
        }));
        return ( new AnnotationsUpdate(annotations));
    }
}

export { AnnotatedString, AnnotationsUpdate };
