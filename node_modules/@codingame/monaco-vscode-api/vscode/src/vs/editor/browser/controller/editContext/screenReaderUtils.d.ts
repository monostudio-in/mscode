import { Position } from "../../../common/core/position.js";
import { Selection } from "../../../common/core/selection.js";
import { IComputedEditorOptions } from "../../../common/config/editorOptions.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
import { ISimpleModel } from "../../../common/viewModel/screenReaderSimpleModel.js";
export interface IPagedScreenReaderStrategy<T> {
    fromEditorSelection(model: ISimpleModel, selection: Selection, linesPerPage: number, trimLongText: boolean): T;
}
export interface ISimpleScreenReaderContentState {
    value: string;
    /** the offset where selection starts inside `value` */
    selectionStart: number;
    /** the offset where selection ends inside `value` */
    selectionEnd: number;
    /** the editor range in the view coordinate system that matches the selection inside `value` */
    selection: Selection;
    /** the position of the start of the `value` in the editor */
    startPositionWithinEditor: Position;
    /** the visible line count (wrapped, not necessarily matching \n characters) for the text in `value` before `selectionStart` */
    newlineCountBeforeSelection: number;
}
export declare class SimplePagedScreenReaderStrategy implements IPagedScreenReaderStrategy<ISimpleScreenReaderContentState> {
    private _getPageOfLine;
    private _getRangeForPage;
    fromEditorSelection(model: ISimpleModel, selection: Selection, linesPerPage: number, trimLongText: boolean): ISimpleScreenReaderContentState;
}
export declare function ariaLabelForScreenReaderContent(options: IComputedEditorOptions, keybindingService: IKeybindingService): string;
export declare function newlinecount(text: string): number;
