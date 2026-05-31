import { DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { DetailedLineRangeMapping } from "../../../../../common/diff/rangeMapping.js";
import { ITextModel } from "../../../../../common/model.js";
import { IClipboardService } from "../../../../../../platform/clipboard/common/clipboardService.service.js";
import { RenderLinesResult } from "./renderLines.js";
export interface IEnableViewZoneCopySelectionOptions {
    /** The view zone HTML element that contains the deleted codes. */
    domNode: HTMLElement;
    /** The diff entry for the current view zone. */
    diffEntry: DetailedLineRangeMapping;
    /** The original text model, to get the original text based on selection. */
    originalModel: ITextModel;
    /** The render lines result that can translate DOM positions to model positions. */
    renderLinesResult: RenderLinesResult;
    /** The clipboard service to write the selected text to. */
    clipboardService: IClipboardService;
}
export declare function enableCopySelection(options: IEnableViewZoneCopySelectionOptions): DisposableStore;
