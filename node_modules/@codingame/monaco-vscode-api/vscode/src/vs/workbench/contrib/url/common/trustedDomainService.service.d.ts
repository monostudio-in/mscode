import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
export declare const ITrustedDomainService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITrustedDomainService>;
export interface ITrustedDomainService {
    _serviceBrand: undefined;
    readonly onDidChangeTrustedDomains: Event<void>;
    isValid(resource: URI): boolean;
    readonly trustedDomains: string[];
}
