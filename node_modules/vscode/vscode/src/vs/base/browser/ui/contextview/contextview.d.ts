import { StandardMouseEvent } from "../../mouseEvent.js";
import { Disposable, IDisposable } from "../../../common/lifecycle.js";
import { AnchorAlignment, AnchorAxisAlignment, AnchorPosition, IRect } from "../../../common/layout.js";
import { OmitOptional } from "../../../common/types.js";
export { AnchorAlignment, AnchorAxisAlignment, AnchorPosition } from "../../../common/layout.js";
export declare enum ContextViewDOMPosition {
    ABSOLUTE = 1,
    FIXED = 2,
    FIXED_SHADOW = 3
}
export interface IAnchor {
    x: number;
    y: number;
    width?: number;
    height?: number;
}
export declare function isAnchor(obj: unknown): obj is IAnchor | OmitOptional<IAnchor>;
export interface IDelegate {
    /**
     * The anchor where to position the context view.
     * Use a `HTMLElement` to position the view at the element,
     * a `StandardMouseEvent` to position it at the mouse position
     * or an `IAnchor` to position it at a specific location.
     */
    getAnchor(): HTMLElement | StandardMouseEvent | IAnchor;
    render(container: HTMLElement): IDisposable | null;
    focus?(): void;
    layout?(): void;
    anchorAlignment?: AnchorAlignment;
    anchorPosition?: AnchorPosition;
    anchorAxisAlignment?: AnchorAxisAlignment;
    canRelayout?: boolean;
    onDOMEvent?(e: Event, activeElement: HTMLElement): void;
    onHide?(data?: unknown): void;
    /**
     * context views with higher layers are rendered higher in z-index order
     */
    layer?: number;
}
export interface IContextViewProvider {
    showContextView(delegate: IDelegate, container?: HTMLElement): void;
    hideContextView(): void;
    layout(): void;
}
export declare function getAnchorRect(anchor: HTMLElement | StandardMouseEvent | IAnchor): IRect;
export declare class ContextView extends Disposable {
    private static readonly BUBBLE_UP_EVENTS;
    private static readonly BUBBLE_DOWN_EVENTS;
    private container;
    private view;
    private useFixedPosition;
    private useShadowDOM;
    private delegate;
    private toDisposeOnClean;
    private toDisposeOnSetContainer;
    private shadowRoot;
    private shadowRootHostElement;
    constructor(container: HTMLElement, domPosition: ContextViewDOMPosition);
    setContainer(container: HTMLElement | null, domPosition: ContextViewDOMPosition): void;
    show(delegate: IDelegate): void;
    getViewElement(): HTMLElement;
    layout(): void;
    private doLayout;
    hide(data?: unknown): void;
    private isVisible;
    private onDOMEvent;
    dispose(): void;
}
