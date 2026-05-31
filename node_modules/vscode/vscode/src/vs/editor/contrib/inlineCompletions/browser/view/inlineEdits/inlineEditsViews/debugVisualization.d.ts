import { IDisposable } from "../../../../../../../base/common/lifecycle.js";
import { IReader } from "../../../../../../../base/common/observable.js";
import { Rect } from "../../../../../../common/core/2d/rect.js";
export interface IVisualizationEffect {
    visualize(): IDisposable;
}
export declare function setVisualization(data: object, visualization: IVisualizationEffect): void;
export declare function debugLogRects(rects: Record<string, Rect> | Rect[], elem: HTMLElement): object;
export declare function debugLogRect(rect: Rect, elem: HTMLElement, name: string): Rect;
export declare function debugLogHorizontalOffsetRange(rect: Rect, elem: HTMLElement, name: string): Rect;
export declare function debugLogHorizontalOffsetRanges(rects: Record<string, Rect> | Rect[], elem: HTMLElement): object;
export declare function debugView(value: unknown, reader: IReader): void;
