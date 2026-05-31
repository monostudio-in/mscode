import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { IMarkdownRendererService } from "../../../../platform/markdown/browser/markdownRenderer.service.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { IModelDecoration } from "../../../common/model.js";
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart, IRenderedHoverParts } from "./hoverTypes.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.service.js";
import { Hover, HoverProvider, HoverVerbosityAction } from "../../../common/languages.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.service.js";
import { ICommandService } from "../../../../platform/commands/common/commands.service.js";
import { HoverStartSource } from "./hoverOperation.js";
import { ScrollEvent } from "../../../../base/common/scrollable.js";
export declare class MarkdownHover implements IHoverPart {
    readonly owner: IEditorHoverParticipant<MarkdownHover>;
    readonly range: Range;
    readonly contents: IMarkdownString[];
    readonly isBeforeContent: boolean;
    readonly ordinal: number;
    readonly source: HoverSource | undefined;
    constructor(owner: IEditorHoverParticipant<MarkdownHover>, range: Range, contents: IMarkdownString[], isBeforeContent: boolean, ordinal: number, source?: HoverSource | undefined);
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
}
declare class HoverSource {
    readonly hover: Hover;
    readonly hoverProvider: HoverProvider;
    readonly hoverPosition: Position;
    constructor(hover: Hover, hoverProvider: HoverProvider, hoverPosition: Position);
    supportsVerbosityAction(hoverVerbosityAction: HoverVerbosityAction): boolean;
}
export declare class MarkdownHoverParticipant implements IEditorHoverParticipant<MarkdownHover> {
    protected readonly _editor: ICodeEditor;
    private readonly _markdownRendererService;
    private readonly _configurationService;
    protected readonly _languageFeaturesService: ILanguageFeaturesService;
    private readonly _keybindingService;
    private readonly _hoverService;
    private readonly _commandService;
    readonly hoverOrdinal: number;
    private _renderedHoverParts;
    constructor(_editor: ICodeEditor, _markdownRendererService: IMarkdownRendererService, _configurationService: IConfigurationService, _languageFeaturesService: ILanguageFeaturesService, _keybindingService: IKeybindingService, _hoverService: IHoverService, _commandService: ICommandService);
    createLoadingMessage(anchor: HoverAnchor): MarkdownHover | null;
    computeSync(anchor: HoverAnchor, lineDecorations: IModelDecoration[]): MarkdownHover[];
    computeAsync(anchor: HoverAnchor, lineDecorations: IModelDecoration[], source: HoverStartSource, token: CancellationToken): AsyncIterable<MarkdownHover>;
    private _getMarkdownHovers;
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: MarkdownHover[]): IRenderedHoverParts<MarkdownHover>;
    handleScroll(e: ScrollEvent): void;
    getAccessibleContent(hoverPart: MarkdownHover): string;
    doesMarkdownHoverAtIndexSupportVerbosityAction(index: number, action: HoverVerbosityAction): boolean;
    updateMarkdownHoverVerbosityLevel(action: HoverVerbosityAction, index: number): Promise<{
        hoverPart: MarkdownHover;
        hoverElement: HTMLElement;
    } | undefined>;
}
export declare function renderMarkdownHovers(context: IEditorHoverRenderContext, markdownHovers: MarkdownHover[], editor: ICodeEditor, markdownRendererService: IMarkdownRendererService): IRenderedHoverParts<MarkdownHover>;
export declare function labelForHoverVerbosityAction(keybindingService: IKeybindingService, action: HoverVerbosityAction): string;
export {};
