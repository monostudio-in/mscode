import { BaseTextEditorModel } from "./textEditorModel.js";
import { URI } from "../../../base/common/uri.js";
import { ILanguageService } from "../../../editor/common/languages/language.service.js";
import { IModelService } from "../../../editor/common/services/model.service.js";
import { ILanguageDetectionService } from "../../services/languageDetection/common/languageDetectionWorkerService.service.js";
import { IAccessibilityService } from "../../../platform/accessibility/common/accessibility.service.js";
/**
 * An editor model for in-memory, readonly text content that
 * is backed by an existing editor model.
 */
export declare class TextResourceEditorModel extends BaseTextEditorModel {
    constructor(resource: URI, languageService: ILanguageService, modelService: IModelService, languageDetectionService: ILanguageDetectionService, accessibilityService: IAccessibilityService);
    dispose(): void;
}
