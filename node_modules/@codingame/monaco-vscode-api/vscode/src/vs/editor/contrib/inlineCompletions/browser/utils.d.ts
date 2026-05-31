import { CancellationToken } from "../../../../base/common/cancellation.js";
import { DisposableStore, IDisposable } from "../../../../base/common/lifecycle.js";
import { IObservable, IReader } from "../../../../base/common/observable.js";
import { ContextKeyValue, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { TextReplacement } from "../../../common/core/edits/textEdit.js";
import { ITextModel } from "../../../common/model.js";
export declare function getReadonlyEmptyArray<T>(): readonly T[];
export declare function addPositions(pos1: Position, pos2: Position): Position;
export declare function subtractPositions(pos1: Position, pos2: Position): Position;
export declare function substringPos(text: string, pos: Position): string;
export declare function getEndPositionsAfterApplying(edits: readonly TextReplacement[]): Position[];
export declare function getModifiedRangesAfterApplying(edits: readonly TextReplacement[]): Range[];
export declare function removeTextReplacementCommonSuffixPrefix(edits: readonly TextReplacement[], textModel: ITextModel): TextReplacement[];
export declare function convertItemsToStableObservables<T>(items: IObservable<readonly T[]>, store: DisposableStore): IObservable<IObservable<T>[]>;
export declare class ObservableContextKeyService {
    private readonly _contextKeyService;
    constructor(_contextKeyService: IContextKeyService);
    bind<T extends ContextKeyValue>(key: RawContextKey<T>, obs: IObservable<T>): IDisposable;
    bind<T extends ContextKeyValue>(key: RawContextKey<T>, fn: (reader: IReader) => T): IDisposable;
}
export declare function wait(ms: number, cancellationToken?: CancellationToken): Promise<void>;
export declare class ErrorResult<T = void> {
    readonly error: T;
    readonly message: string | undefined;
    static message(message: string): ErrorResult;
    constructor(error: T, message?: string | undefined);
    static is<TOther>(obj: TOther | ErrorResult): obj is ErrorResult;
    logError(): void;
}
