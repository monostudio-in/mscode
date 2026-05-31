import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { ILanguageService } from "../../../../editor/common/languages/language.service.js";
import { IMenuService } from "../../../../platform/actions/common/actions.service.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { IContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.service.js";
import { IContextViewService } from "../../../../platform/contextview/browser/contextView.service.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.service.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
import { ILabelService } from "../../../../platform/label/common/label.service.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.service.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.service.js";
import { ViewPane } from "../../../browser/parts/views/viewPane.js";
import { IViewletViewOptions } from "../../../browser/parts/views/viewsViewlet.js";
import { IEditorPane } from "../../../common/editor.js";
import { IViewDescriptorService } from "../../../common/views.service.js";
import { IEditorService } from "../../../services/editor/common/editorService.service.js";
import { IBreakpoint, IDataBreakpoint, IDebugModel, IExceptionBreakpoint, IFunctionBreakpoint, IInstructionBreakpoint, State } from "../common/debug.js";
import { IDebugService } from "../common/debug.service.js";
export declare function getExpandedBodySize(model: IDebugModel, sessionId: string | undefined, countLimit: number): number;
type BreakpointItem = IBreakpoint | IFunctionBreakpoint | IDataBreakpoint | IExceptionBreakpoint | IInstructionBreakpoint;
/**
 * Represents a file node in the breakpoints tree that groups breakpoints by file.
 */
export declare class BreakpointsFolderItem {
    readonly uri: URI;
    readonly breakpoints: IBreakpoint[];
    constructor(uri: URI, breakpoints: IBreakpoint[]);
    getId(): string;
    get enabled(): boolean;
    get indeterminate(): boolean;
}
interface InputBoxData {
    breakpoint: IFunctionBreakpoint | IExceptionBreakpoint | IDataBreakpoint;
    type: "condition" | "hitCount" | "name";
}
export declare class BreakpointsView extends ViewPane {
    private readonly debugService;
    private readonly editorService;
    private readonly contextViewService;
    private readonly labelService;
    private readonly languageService;
    private tree;
    private needsRefresh;
    private needsStateChange;
    private ignoreLayout;
    private menu;
    private breakpointItemType;
    private breakpointIsDataBytes;
    private breakpointHasMultipleModes;
    private breakpointSupportsCondition;
    private _inputBoxData;
    breakpointInputFocused: IContextKey<boolean>;
    private autoFocusedElement;
    private collapsedState;
    private hintContainer;
    private hintDelayer;
    private getPresentation;
    constructor(options: IViewletViewOptions, contextMenuService: IContextMenuService, debugService: IDebugService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, themeService: IThemeService, editorService: IEditorService, contextViewService: IContextViewService, configurationService: IConfigurationService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, openerService: IOpenerService, labelService: ILabelService, menuService: IMenuService, hoverService: IHoverService, languageService: ILanguageService);
    protected renderBody(container: HTMLElement): void;
    protected renderHeaderTitle(container: HTMLElement, title: string): void;
    focus(): void;
    renderInputBox(data: InputBoxData | undefined): void;
    get inputBoxData(): InputBoxData | undefined;
    protected layoutBody(height: number, width: number): void;
    private onTreeContextMenu;
    private updateSize;
    private updateBreakpointsHint;
    private onBreakpointsChange;
    private onStateChange;
    private setTreeInput;
    private getTreeElements;
    private get flatElements();
}
export declare function openBreakpointSource(breakpoint: IBreakpoint, sideBySide: boolean, preserveFocus: boolean, pinned: boolean, debugService: IDebugService, editorService: IEditorService): Promise<IEditorPane | undefined>;
export declare function getBreakpointMessageAndIcon(state: State, breakpointsActivated: boolean, breakpoint: BreakpointItem, labelService: ILabelService, debugModel: IDebugModel): {
    message?: string;
    icon: ThemeIcon;
    showAdapterUnverifiedMessage?: boolean;
};
export {};
