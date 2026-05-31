import { ISetting, ISettingsGroup } from "../../../services/preferences/common/preferences.js";
export interface ITOCFilter {
    include?: {
        keyPatterns?: string[];
        tags?: string[];
    };
    exclude?: {
        keyPatterns?: string[];
        tags?: string[];
    };
}
export interface ITOCEntry<T> {
    id: string;
    label: string;
    order?: number;
    children?: ITOCEntry<T>[];
    settings?: Array<T>;
    hide?: boolean;
}
export declare function getCommonlyUsedData(settingGroups: ISettingsGroup[]): ITOCEntry<ISetting>;
export declare const tocData: ITOCEntry<string>;
