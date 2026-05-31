import { URI } from "../../../../../base/common/uri.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { AbstractText } from "../../../../common/core/text/abstractText.js";
import { TextLength } from "../../../../common/core/text/textLength.js";
import { ITextModel } from "../../../../common/model.js";
/**
 * An immutable view of a text model at a specific version.
 * Like TextModelText but throws if the underlying model has changed.
 * This ensures data read from the reference is consistent with
 * the version at construction time.
 */
export declare class TextModelValueReference extends AbstractText {
    private readonly _textModel;
    private readonly _version;
    static snapshot(textModel: ITextModel): TextModelValueReference;
    private constructor();
    get uri(): URI;
    get version(): number;
    private _assertValid;
    targets(textModel: ITextModel): boolean;
    getValueOfRange(range: Range): string;
    getLineLength(lineNumber: number): number;
    get length(): TextLength;
    getEOL(): string;
    getPositionAt(offset: number): Position;
    getValueInRange(range: Range): string;
    getVersionId(): number;
    dangerouslyGetUnderlyingModel(): ITextModel;
}
