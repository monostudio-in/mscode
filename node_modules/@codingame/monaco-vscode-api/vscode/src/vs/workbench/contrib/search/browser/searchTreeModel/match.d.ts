import { ISearchRange, ITextSearchMatch } from "../../../../services/search/common/search.js";
import { ISearchTreeMatch, ISearchTreeFileMatch } from "./searchTreeCommon.js";
import { Range } from "../../../../../editor/common/core/range.js";
export declare function textSearchResultToMatches(rawMatch: ITextSearchMatch, fileMatch: ISearchTreeFileMatch, isAiContributed: boolean): ISearchTreeMatch[];
export declare class MatchImpl implements ISearchTreeMatch {
    protected _parent: ISearchTreeFileMatch;
    private _fullPreviewLines;
    private readonly _isReadonly;
    private static readonly MAX_PREVIEW_CHARS;
    protected _id: string;
    protected _range: Range;
    private _oneLinePreviewText;
    private _rangeInPreviewText;
    private _fullPreviewRange;
    constructor(_parent: ISearchTreeFileMatch, _fullPreviewLines: string[], _fullPreviewRange: ISearchRange, _documentRange: ISearchRange, _isReadonly?: boolean);
    id(): string;
    parent(): ISearchTreeFileMatch;
    text(): string;
    range(): Range;
    preview(): {
        before: string;
        fullBefore: string;
        inside: string;
        after: string;
    };
    get replaceString(): string;
    fullMatchText(includeSurrounding?: boolean): string;
    rangeInPreview(): {
        startColumn: number;
        endColumn: number;
        startLineNumber: number;
        endLineNumber: number;
    };
    fullPreviewLines(): string[];
    getMatchString(): string;
    get isReadonly(): boolean;
}
