export interface IAnchor {
    x: number;
    y: number;
    width?: number;
    height?: number;
}
export declare enum AnchorAlignment {
    LEFT = 0,
    RIGHT = 1
}
export declare enum AnchorPosition {
    BELOW = 0,
    ABOVE = 1
}
export declare enum AnchorAxisAlignment {
    VERTICAL = 0,
    HORIZONTAL = 1
}
interface IPosition {
    readonly top: number;
    readonly left: number;
}
interface ISize {
    readonly width: number;
    readonly height: number;
}
export interface IRect extends IPosition, ISize {
}
export declare enum LayoutAnchorPosition {
    Before = 0,
    After = 1
}
export declare enum LayoutAnchorMode {
    AVOID = 0,
    ALIGN = 1
}
export interface ILayoutAnchor {
    offset: number;
    size: number;
    mode?: LayoutAnchorMode;
    position: LayoutAnchorPosition;
}
export interface ILayoutResult {
    position: number;
    result: "ok" | "flipped" | "overlap";
}
/**
 * Lays out a one dimensional view next to an anchor in a viewport.
 *
 * @returns The view offset within the viewport.
 */
export declare function layout(viewportSize: number, viewSize: number, anchor: ILayoutAnchor): ILayoutResult;
interface ILayout2DOptions {
    readonly anchorAlignment?: AnchorAlignment;
    readonly anchorPosition?: AnchorPosition;
    readonly anchorAxisAlignment?: AnchorAxisAlignment;
}
export interface ILayout2DResult {
    top: number;
    left: number;
    bottom: number;
    right: number;
    anchorAlignment: AnchorAlignment;
    anchorPosition: AnchorPosition;
}
export declare function layout2d(viewport: IRect, view: ISize, anchor: IRect, options?: ILayout2DOptions): ILayout2DResult;
export {};
