import { ColorIdentifier } from "../../../../platform/theme/common/colorUtils.js";
import { ISCMHistoryItem, ISCMHistoryItemGraphNode, ISCMHistoryItemRef, ISCMHistoryItemViewModel } from "../common/history.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { IMarkdownRendererService } from "../../../../platform/markdown/browser/markdownRenderer.service.js";
export declare const SWIMLANE_HEIGHT = 22;
export declare const SWIMLANE_WIDTH = 11;
/**
 * History item reference colors (local, remote, base)
 */
export declare const historyItemRefColor: string;
export declare const historyItemRemoteRefColor: string;
export declare const historyItemBaseRefColor: string;
/**
 * History item hover color
 */
export declare const historyItemHoverDefaultLabelForeground: string;
export declare const historyItemHoverDefaultLabelBackground: string;
export declare const historyItemHoverLabelForeground: string;
export declare const historyItemHoverAdditionsForeground: string;
export declare const historyItemHoverDeletionsForeground: string;
/**
 * History graph color registry
 */
export declare const colorRegistry: ColorIdentifier[];
export declare function renderSCMHistoryItemGraph(historyItemViewModel: ISCMHistoryItemViewModel): SVGElement;
export declare function renderSCMHistoryGraphPlaceholder(columns: ISCMHistoryItemGraphNode[], highlightIndex?: number): HTMLElement;
export declare function toISCMHistoryItemViewModelArray(historyItems: ISCMHistoryItem[], colorMap?: Map<string, string | undefined>, currentHistoryItemRef?: ISCMHistoryItemRef, currentHistoryItemRemoteRef?: ISCMHistoryItemRef, currentHistoryItemBaseRef?: ISCMHistoryItemRef, addIncomingChanges?: boolean, addOutgoingChanges?: boolean, mergeBase?: string): ISCMHistoryItemViewModel[];
export declare function getHistoryItemIndex(historyItemViewModel: ISCMHistoryItemViewModel): number;
export declare function compareHistoryItemRefs(ref1: ISCMHistoryItemRef, ref2: ISCMHistoryItemRef, currentHistoryItemRef?: ISCMHistoryItemRef, currentHistoryItemRemoteRef?: ISCMHistoryItemRef, currentHistoryItemBaseRef?: ISCMHistoryItemRef): number;
export declare function toHistoryItemHoverContent(markdownRendererService: IMarkdownRendererService, historyItem: ISCMHistoryItem, includeReferences: boolean): {
    content: string | IMarkdownString | HTMLElement;
    disposables: IDisposable;
};
