import { URI } from "../../../../base/common/uri.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.service.js";
import { IStorageService } from "../../../../platform/storage/common/storage.service.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.service.js";
import { IEditorService } from "../../../services/editor/common/editorService.service.js";
export declare const TRUSTED_DOMAINS_STORAGE_KEY = "http.linkProtectionTrustedDomains";
export declare const TRUSTED_DOMAINS_CONTENT_STORAGE_KEY = "http.linkProtectionTrustedDomainsContent";
export declare const manageTrustedDomainSettingsCommand: {
    id: string;
    description: {
        description: import("../../../../nls.js").ILocalizedString;
        args: never[];
    };
    handler: (accessor: ServicesAccessor) => Promise<void>;
};
export declare function configureOpenerTrustedDomainsHandler(trustedDomains: string[], domainToConfigure: string, resource: URI, quickInputService: IQuickInputService, storageService: IStorageService, editorService: IEditorService, telemetryService: ITelemetryService): Promise<string[]>;
export interface IStaticTrustedDomains {
    readonly defaultTrustedDomains: string[];
    readonly trustedDomains: string[];
}
export declare function readTrustedDomains(accessor: ServicesAccessor): Promise<IStaticTrustedDomains>;
export declare function readStaticTrustedDomains(accessor: ServicesAccessor): IStaticTrustedDomains;
