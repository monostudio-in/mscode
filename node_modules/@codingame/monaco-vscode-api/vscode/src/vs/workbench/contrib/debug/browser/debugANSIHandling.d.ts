import { IHighlight } from "../../../../base/browser/ui/highlightedlabel/highlightedLabel.js";
import { RGBA } from "../../../../base/common/color.js";
import { IWorkspaceFolder } from "../../../../platform/workspace/common/workspace.js";
import { DebugLinkHoverBehaviorTypeData, ILinkDetector } from "./linkDetector.js";
/**
 * @param text The content to stylize.
 * @returns An {@link HTMLSpanElement} that contains the potentially stylized text.
 */
export declare function handleANSIOutput(text: string, linkDetector: ILinkDetector, workspaceFolder: IWorkspaceFolder | undefined, highlights: IHighlight[] | undefined, hoverBehavior: DebugLinkHoverBehaviorTypeData): HTMLSpanElement;
/**
 * @param root The {@link HTMLElement} to append the content to.
 * @param stringContent The text content to be appended.
 * @param cssClasses The list of CSS styles to apply to the text content.
 * @param linkDetector The {@link ILinkDetector} responsible for generating links from {@param stringContent}.
 * @param customTextColor If provided, will apply custom color with inline style.
 * @param customBackgroundColor If provided, will apply custom backgroundColor with inline style.
 * @param customUnderlineColor If provided, will apply custom textDecorationColor with inline style.
 * @param highlights The ranges to highlight.
 * @param offset The starting index of the stringContent in the original text.
 * @param hoverBehavior hover behavior with disposable store for managing event listeners.
 */
export declare function appendStylizedStringToContainer(root: HTMLElement, stringContent: string, cssClasses: string[], linkDetector: ILinkDetector, workspaceFolder: IWorkspaceFolder | undefined, customTextColor: RGBA | string | undefined, customBackgroundColor: RGBA | string | undefined, customUnderlineColor: RGBA | string | undefined, highlights: IHighlight[] | undefined, offset: number, hoverBehavior: DebugLinkHoverBehaviorTypeData): void;
/**
 * Calculate the color from the color set defined in the ANSI 8-bit standard.
 * Standard and high intensity colors are not defined in the standard as specific
 * colors, so these and invalid colors return `undefined`.
 * @see {@link https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit } for info.
 * @param colorNumber The number (ranging from 16 to 255) referring to the color
 * desired.
 */
export declare function calcANSI8bitColor(colorNumber: number): RGBA | undefined;
