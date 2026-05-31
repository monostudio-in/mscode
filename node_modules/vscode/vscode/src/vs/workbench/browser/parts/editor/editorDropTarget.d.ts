import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Themable } from "../../../../platform/theme/common/themeService.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.service.js";
import { IEditorGroupsView } from "./editor.js";
import { IEditorDropTargetDelegate } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.service.js";
export declare class EditorDropTarget extends Themable {
    private readonly groupsView;
    private readonly container;
    private readonly delegate;
    private readonly editorGroupService;
    private readonly configurationService;
    private readonly instantiationService;
    private _overlay?;
    private counter;
    private readonly editorTransfer;
    private readonly groupTransfer;
    constructor(groupsView: IEditorGroupsView, container: HTMLElement, delegate: IEditorDropTargetDelegate, editorGroupService: IEditorGroupsService, themeService: IThemeService, configurationService: IConfigurationService, instantiationService: IInstantiationService);
    private get overlay();
    private registerListeners;
    private onDragEnter;
    private onDragLeave;
    private onDragEnd;
    private findTargetGroupView;
    private updateContainer;
    dispose(): void;
    private disposeOverlay;
}
