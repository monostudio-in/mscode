import { Event } from "../../../../base/common/event.js";
import Severity from "../../../../base/common/severity.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { IExtensionFeatureAccessData } from "./extensionFeatures.js";
export declare const IExtensionFeaturesManagementService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtensionFeaturesManagementService>;
export interface IExtensionFeaturesManagementService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeEnablement: Event<{
        readonly extension: ExtensionIdentifier;
        readonly featureId: string;
        readonly enabled: boolean;
    }>;
    isEnabled(extension: ExtensionIdentifier, featureId: string): boolean;
    setEnablement(extension: ExtensionIdentifier, featureId: string, enabled: boolean): void;
    getEnablementData(featureId: string): {
        readonly extension: ExtensionIdentifier;
        readonly enabled: boolean;
    }[];
    getAccess(extension: ExtensionIdentifier, featureId: string, justification?: string): Promise<boolean>;
    readonly onDidChangeAccessData: Event<{
        readonly extension: ExtensionIdentifier;
        readonly featureId: string;
        readonly accessData: IExtensionFeatureAccessData;
    }>;
    getAllAccessDataForExtension(extension: ExtensionIdentifier): Map<string, IExtensionFeatureAccessData>;
    getAccessData(extension: ExtensionIdentifier, featureId: string): IExtensionFeatureAccessData | undefined;
    setStatus(extension: ExtensionIdentifier, featureId: string, status: {
        readonly severity: Severity;
        readonly message: string;
    } | undefined): void;
}
