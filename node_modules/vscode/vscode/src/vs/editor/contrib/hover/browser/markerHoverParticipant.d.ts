import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { Range } from "../../../common/core/range.js";
import { IModelDecoration } from "../../../common/model.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.service.js";
import { IMarkerDecorationsService } from "../../../common/services/markerDecorations.service.js";
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart, IRenderedHoverParts } from "./hoverTypes.js";
import { IMenuService } from "../../../../platform/actions/common/actions.service.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IMarker } from "../../../../platform/markers/common/markers.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.service.js";
export declare class MarkerHover implements IHoverPart {
    readonly owner: IEditorHoverParticipant<MarkerHover>;
    readonly range: Range;
    readonly marker: IMarker;
    constructor(owner: IEditorHoverParticipant<MarkerHover>, range: Range, marker: IMarker);
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
}
export declare class MarkerHoverParticipant implements IEditorHoverParticipant<MarkerHover> {
    private readonly _editor;
    private readonly _markerDecorationsService;
    private readonly _openerService;
    private readonly _languageFeaturesService;
    private readonly _menuService;
    private readonly _contextKeyService;
    readonly hoverOrdinal: number;
    private recentMarkerCodeActionsInfo;
    constructor(_editor: ICodeEditor, _markerDecorationsService: IMarkerDecorationsService, _openerService: IOpenerService, _languageFeaturesService: ILanguageFeaturesService, _menuService: IMenuService, _contextKeyService: IContextKeyService);
    computeSync(anchor: HoverAnchor, lineDecorations: IModelDecoration[]): MarkerHover[];
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: MarkerHover[]): IRenderedHoverParts<MarkerHover>;
    getAccessibleContent(hoverPart: MarkerHover): string;
    private _renderMarkerHover;
    private _renderMarkerStatusbar;
    private getCodeActions;
}
