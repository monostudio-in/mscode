import { IEditorMouseEvent } from "../../../browser/editorBrowser.js";
export declare function isMousePositionWithinElement(element: HTMLElement, posx: number, posy: number): boolean;
/**
 * Determines whether hover should be shown based on the hover setting and current keyboard modifiers.
 * When `hoverEnabled` is 'onKeyboardModifier', hover is shown when the user presses the opposite
 * modifier key from the multi-cursor modifier (e.g., if multi-cursor uses Alt, hover shows on Ctrl/Cmd).
 *
 * @param hoverEnabled - The hover enabled setting
 * @param multiCursorModifier - The modifier key used for multi-cursor operations
 * @param mouseEvent - The current mouse event containing modifier key states
 * @returns true if hover should be shown, false otherwise
 */
export declare function shouldShowHover(hoverEnabled: "on" | "off" | "onKeyboardModifier", multiCursorModifier: "altKey" | "ctrlKey" | "metaKey", mouseEvent: IEditorMouseEvent): boolean;
/**
 * Returns true if the trigger modifier (inverse of multi-cursor modifier) is pressed.
 * This works with both mouse and keyboard events by relying only on the modifier flags.
 */
export declare function isTriggerModifierPressed(multiCursorModifier: "altKey" | "ctrlKey" | "metaKey", event: {
    ctrlKey: boolean;
    metaKey: boolean;
    altKey: boolean;
}): boolean;
