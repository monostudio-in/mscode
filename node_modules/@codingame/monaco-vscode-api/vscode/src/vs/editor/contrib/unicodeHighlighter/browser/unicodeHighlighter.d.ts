import { Disposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorAction, ServicesAccessor } from "../../../browser/editorExtensions.js";
import { Range } from "../../../common/core/range.js";
import { IEditorContribution } from "../../../common/editorCommon.js";
import { IModelDecoration } from "../../../common/model.js";
import { UnicodeHighlighterReason } from "../../../common/services/unicodeTextModelHighlighter.js";
import { IEditorWorkerService } from "../../../common/services/editorWorker.service.js";
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart, IRenderedHoverParts } from "../../hover/browser/hoverTypes.js";
import { MarkdownHover } from "../../hover/browser/markdownHoverParticipant.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.service.js";
import { Action2 } from "../../../../platform/actions/common/actions.js";
import { IMarkdownRendererService } from "../../../../platform/markdown/browser/markdownRenderer.service.js";
export declare const warningIcon: import("../../../../base/common/themables.js").ThemeIcon;
export declare class UnicodeHighlighter extends Disposable implements IEditorContribution {
    private readonly _editor;
    private readonly _editorWorkerService;
    private readonly _workspaceTrustService;
    static readonly ID = "editor.contrib.unicodeHighlighter";
    private _highlighter;
    private _options;
    private readonly _bannerController;
    private _bannerClosed;
    constructor(_editor: ICodeEditor, _editorWorkerService: IEditorWorkerService, _workspaceTrustService: IWorkspaceTrustManagementService, instantiationService: IInstantiationService);
    dispose(): void;
    private readonly _updateState;
    private _updateHighlighter;
    getDecorationInfo(decoration: IModelDecoration): UnicodeHighlighterDecorationInfo | null;
}
export interface UnicodeHighlighterDecorationInfo {
    reason: UnicodeHighlighterReason;
    inComment: boolean;
    inString: boolean;
}
export declare class UnicodeHighlighterHover implements IHoverPart {
    readonly owner: IEditorHoverParticipant<UnicodeHighlighterHover>;
    readonly range: Range;
    readonly decoration: IModelDecoration;
    constructor(owner: IEditorHoverParticipant<UnicodeHighlighterHover>, range: Range, decoration: IModelDecoration);
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
}
export declare class UnicodeHighlighterHoverParticipant implements IEditorHoverParticipant<MarkdownHover> {
    private readonly _editor;
    private readonly _markdownRendererService;
    readonly hoverOrdinal: number;
    constructor(_editor: ICodeEditor, _markdownRendererService: IMarkdownRendererService);
    computeSync(anchor: HoverAnchor, lineDecorations: IModelDecoration[]): MarkdownHover[];
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: MarkdownHover[]): IRenderedHoverParts<MarkdownHover>;
    getAccessibleContent(hoverPart: MarkdownHover): string;
}
interface IDisableUnicodeHighlightAction {
    shortLabel: string;
}
export declare class DisableHighlightingInCommentsAction extends EditorAction implements IDisableUnicodeHighlightAction {
    static ID: string;
    readonly shortLabel: string;
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
    runAction(configurationService: IConfigurationService): Promise<void>;
}
export declare class DisableHighlightingInStringsAction extends EditorAction implements IDisableUnicodeHighlightAction {
    static ID: string;
    readonly shortLabel: string;
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
    runAction(configurationService: IConfigurationService): Promise<void>;
}
export declare class DisableHighlightingOfAmbiguousCharactersAction extends Action2 implements IDisableUnicodeHighlightAction {
    static ID: string;
    readonly shortLabel: string;
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
    runAction(configurationService: IConfigurationService): Promise<void>;
}
export declare class DisableHighlightingOfInvisibleCharactersAction extends Action2 implements IDisableUnicodeHighlightAction {
    static ID: string;
    readonly shortLabel: string;
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
    runAction(configurationService: IConfigurationService): Promise<void>;
}
export declare class DisableHighlightingOfNonBasicAsciiCharactersAction extends Action2 implements IDisableUnicodeHighlightAction {
    static ID: string;
    readonly shortLabel: string;
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
    runAction(configurationService: IConfigurationService): Promise<void>;
}
export declare class ShowExcludeOptions extends Action2 {
    static ID: string;
    constructor();
    run(accessor: ServicesAccessor, args: any): Promise<void>;
}
export {};
