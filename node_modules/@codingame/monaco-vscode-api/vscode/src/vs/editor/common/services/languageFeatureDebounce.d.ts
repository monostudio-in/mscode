import { LanguageFeatureRegistry } from "../languageFeatureRegistry.js";
import { ITextModel } from "../model.js";
import { IEnvironmentService } from "../../../platform/environment/common/environment.service.js";
import { ILogService } from "../../../platform/log/common/log.service.js";
import { ILanguageFeatureDebounceService } from "./languageFeatureDebounce.service.js";
export interface IFeatureDebounceInformation {
    get(model: ITextModel): number;
    update(model: ITextModel, value: number): number;
    default(): number;
}
export declare class LanguageFeatureDebounceService implements ILanguageFeatureDebounceService {
    private readonly _logService;
    _serviceBrand: undefined;
    private readonly _data;
    private readonly _isDev;
    constructor(_logService: ILogService, envService: IEnvironmentService);
    for(feature: LanguageFeatureRegistry<object>, name: string, config?: {
        min?: number;
        max?: number;
        key?: string;
    }): IFeatureDebounceInformation;
    private _overallAverage;
}
