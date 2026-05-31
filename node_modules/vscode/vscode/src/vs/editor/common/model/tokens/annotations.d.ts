import { StringEdit } from "../../core/edits/stringEdit.js";
import { OffsetRange } from "../../core/ranges/offsetRange.js";
export interface IAnnotation<T> {
    range: OffsetRange;
    annotation: T;
}
export interface IAnnotatedString<T> {
    /**
     * Set annotations for a specific line.
     * Annotations should be sorted and non-overlapping.
     */
    setAnnotations(annotations: AnnotationsUpdate<T>): void;
    /**
     * Return annotations intersecting with the given offset range.
     */
    getAnnotationsIntersecting(range: OffsetRange): IAnnotation<T>[];
    /**
     * Get all the annotations. Method is used for testing.
     */
    getAllAnnotations(): IAnnotation<T>[];
    /**
     * Apply a string edit to the annotated string.
     * @returns The annotations that were deleted (became empty) as a result of the edit.
     */
    applyEdit(edit: StringEdit): IAnnotation<T>[];
    /**
     * Clone the annotated string.
     */
    clone(): IAnnotatedString<T>;
}
export declare class AnnotatedString<T> implements IAnnotatedString<T> {
    /**
     * Annotations are non intersecting and contiguous in the array.
     */
    private _annotations;
    constructor(annotations?: IAnnotation<T>[]);
    /**
     * Set annotations for a specific range.
     * Annotations should be sorted and non-overlapping.
     * If the annotation value is undefined, the annotation is removed.
     */
    setAnnotations(annotations: AnnotationsUpdate<T>): void;
    /**
     * Returns all annotations that intersect with the given offset range.
     */
    getAnnotationsIntersecting(range: OffsetRange): IAnnotation<T>[];
    private _getStartIndexOfIntersectingAnnotation;
    private _getEndIndexOfIntersectingAnnotation;
    /**
     * Returns a copy of all annotations.
     */
    getAllAnnotations(): IAnnotation<T>[];
    /**
     * Applies a string edit to the annotated string, updating annotation ranges accordingly.
     * @param edit The string edit to apply.
     * @returns The annotations that were deleted (became empty) as a result of the edit.
     */
    applyEdit(edit: StringEdit): IAnnotation<T>[];
    /**
     * Creates a shallow clone of this annotated string.
     */
    clone(): IAnnotatedString<T>;
}
export interface IAnnotationUpdate<T> {
    range: OffsetRange;
    annotation: T | undefined;
}
type DefinedValue = object | string | number | boolean;
export type ISerializedAnnotation<TSerializedProperty extends DefinedValue> = {
    range: {
        start: number;
        endExclusive: number;
    };
    annotation: TSerializedProperty | undefined;
};
export declare class AnnotationsUpdate<T> {
    static create<T>(annotations: IAnnotationUpdate<T>[]): AnnotationsUpdate<T>;
    private _annotations;
    private constructor();
    get annotations(): IAnnotationUpdate<T>[];
    rebase(edit: StringEdit): void;
    serialize<TSerializedProperty extends DefinedValue>(serializingFunc: (annotation: T) => TSerializedProperty): ISerializedAnnotation<TSerializedProperty>[];
    static deserialize<T, TSerializedProperty extends DefinedValue>(serializedAnnotations: ISerializedAnnotation<TSerializedProperty>[], deserializingFunc: (annotation: TSerializedProperty) => T): AnnotationsUpdate<T>;
}
export {};
