import type { ViewLineRenderingData } from "../../common/viewModel.js";
import type { ViewLineOptions } from "../viewParts/viewLines/viewLineOptions.js";
export interface IContentSegmenter {
    /**
     * Gets the content segment at an index within the line data's contents. This will be undefined
     * when the index should not be rendered, ie. when it's part of an earlier segment like the tail
     * end of an emoji, or when the line is not that long.
     * @param index The index within the line data's content string.
     */
    getSegmentAtIndex(index: number): string | undefined;
    getSegmentData(index: number): Intl.SegmentData | undefined;
}
export declare function createContentSegmenter(lineData: ViewLineRenderingData, options: ViewLineOptions): IContentSegmenter;
