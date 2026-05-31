import { AsyncIterableProducer } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { ICodeEditor, IEditorMouseEvent } from "../../../browser/editorBrowser.js";
import { IModelDecoration } from "../../../common/model.js";
import { HoverAnchor, IEditorHoverParticipant } from "../../hover/browser/hoverTypes.js";
import { ITextModelService } from "../../../common/services/resolverService.service.js";
import { MarkdownHover, MarkdownHoverParticipant } from "../../hover/browser/markdownHoverParticipant.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.service.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.service.js";
import { ICommandService } from "../../../../platform/commands/common/commands.service.js";
import { HoverStartSource } from "../../hover/browser/hoverOperation.js";
import { IMarkdownRendererService } from "../../../../platform/markdown/browser/markdownRenderer.service.js";
export declare class InlayHintsHover extends MarkdownHoverParticipant implements IEditorHoverParticipant<MarkdownHover> {
    private readonly _resolverService;
    readonly hoverOrdinal: number;
    constructor(editor: ICodeEditor, markdownRendererService: IMarkdownRendererService, keybindingService: IKeybindingService, hoverService: IHoverService, configurationService: IConfigurationService, _resolverService: ITextModelService, languageFeaturesService: ILanguageFeaturesService, commandService: ICommandService);
    suggestHoverAnchor(mouseEvent: IEditorMouseEvent): HoverAnchor | null;
    computeSync(): MarkdownHover[];
    computeAsync(anchor: HoverAnchor, _lineDecorations: IModelDecoration[], source: HoverStartSource, token: CancellationToken): AsyncIterableProducer<MarkdownHover>;
    private _resolveInlayHintLabelPartHover;
}
