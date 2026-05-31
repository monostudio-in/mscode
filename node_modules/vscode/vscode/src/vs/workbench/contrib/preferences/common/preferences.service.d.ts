import { ISearchProvider, IAiSearchProvider } from "./preferences.js";
export declare const IPreferencesSearchService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IPreferencesSearchService>;
export interface IPreferencesSearchService {
    readonly _serviceBrand: undefined;
    getLocalSearchProvider(filter: string): ISearchProvider;
    getRemoteSearchProvider(filter: string, newExtensionsOnly?: boolean): ISearchProvider | undefined;
    getAiSearchProvider(filter: string): IAiSearchProvider | undefined;
}
