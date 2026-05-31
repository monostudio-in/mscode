import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.service.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.service.js";
import { SideBySideEditor } from "./sideBySideEditor.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.service.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.service.js";
import { IEditorGroup } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.service.js";
import { IEditorService } from "../../../services/editor/common/editorService.service.js";
/**
 * An implementation of editor for diffing binary files like images or videos.
 */
export declare class BinaryResourceDiffEditor extends SideBySideEditor {
    static readonly ID = "workbench.editors.binaryResourceDiffEditor";
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, configurationService: IConfigurationService, textResourceConfigurationService: ITextResourceConfigurationService, editorService: IEditorService, editorGroupService: IEditorGroupsService);
    getMetadata(): string | undefined;
}
