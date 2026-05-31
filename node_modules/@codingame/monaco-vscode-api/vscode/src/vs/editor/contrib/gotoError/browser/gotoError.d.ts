import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorAction, IActionOptions, ServicesAccessor } from "../../../browser/editorExtensions.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.service.js";
import { IEditorContribution } from "../../../common/editorCommon.js";
import { IMarkerNavigationService } from "./markerNavigationService.service.js";
import * as nls from "../../../../nls.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IMarker } from "../../../../platform/markers/common/markers.js";
export declare class MarkerController implements IEditorContribution {
    private readonly _markerNavigationService;
    private readonly _contextKeyService;
    private readonly _editorService;
    private readonly _instantiationService;
    static readonly ID = "editor.contrib.markerController";
    static get(editor: ICodeEditor): MarkerController | null;
    private readonly _editor;
    private readonly _widgetVisible;
    private readonly _sessionDispoables;
    private _model?;
    private _widget?;
    constructor(editor: ICodeEditor, _markerNavigationService: IMarkerNavigationService, _contextKeyService: IContextKeyService, _editorService: ICodeEditorService, _instantiationService: IInstantiationService);
    dispose(): void;
    private _cleanUp;
    private _getOrCreateModel;
    close(focusEditor?: boolean): void;
    showAtMarker(marker: IMarker): void;
    navigate(next: boolean, multiFile: boolean): Promise<void>;
}
declare class MarkerNavigationAction extends EditorAction {
    private readonly _next;
    private readonly _multiFile;
    constructor(_next: boolean, _multiFile: boolean, opts: IActionOptions);
    run(_accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
export declare class NextMarkerAction extends MarkerNavigationAction {
    static readonly ID = "editor.action.marker.next";
    static LABEL: nls.ILocalizedString;
    constructor();
}
export declare class PrevMarkerAction extends MarkerNavigationAction {
    static readonly ID = "editor.action.marker.prev";
    static LABEL: nls.ILocalizedString;
    constructor();
}
export declare class NextMarkerInFilesAction extends MarkerNavigationAction {
    static readonly ID = "editor.action.marker.nextInFiles";
    constructor();
}
export declare class PrevMarkerInFilesAction extends MarkerNavigationAction {
    static readonly ID = "editor.action.marker.prevInFiles";
    constructor();
}
export {};
