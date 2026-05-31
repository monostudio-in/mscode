import { ISingleEditOperation } from "../../../common/core/editOperation.js";
import { ILanguageConfigurationService } from "../../../common/languages/languageConfigurationRegistry.service.js";
import { ITextModel } from "../../../common/model.js";
export declare function getReindentEditOperations(model: ITextModel, languageConfigurationService: ILanguageConfigurationService, startLineNumber: number, endLineNumber: number): ISingleEditOperation[];
