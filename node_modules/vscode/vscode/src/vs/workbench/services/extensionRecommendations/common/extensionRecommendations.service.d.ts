import { IStringDictionary } from "../../../../base/common/collections.js";
import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { IExtensionRecommendationReason, type IgnoredRecommendationChangeNotification } from "./extensionRecommendations.js";
export declare const IExtensionRecommendationsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtensionRecommendationsService>;
export interface IExtensionRecommendationsService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeRecommendations: Event<void>;
    getAllRecommendationsWithReason(): IStringDictionary<IExtensionRecommendationReason>;
    getImportantRecommendations(): Promise<string[]>;
    getOtherRecommendations(): Promise<string[]>;
    getFileBasedRecommendations(): string[];
    getExeBasedRecommendations(exe?: string): Promise<{
        important: string[];
        others: string[];
    }>;
    getConfigBasedRecommendations(): Promise<{
        important: string[];
        others: string[];
    }>;
    getWorkspaceRecommendations(): Promise<Array<string | URI>>;
    getKeymapRecommendations(): string[];
    getLanguageRecommendations(): string[];
    getRemoteRecommendations(): string[];
}
export declare const IExtensionIgnoredRecommendationsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtensionIgnoredRecommendationsService>;
export interface IExtensionIgnoredRecommendationsService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeIgnoredRecommendations: Event<void>;
    readonly ignoredRecommendations: string[];
    readonly onDidChangeGlobalIgnoredRecommendation: Event<IgnoredRecommendationChangeNotification>;
    readonly globalIgnoredRecommendations: string[];
    toggleGlobalIgnoredRecommendation(extensionId: string, ignore: boolean): void;
}
