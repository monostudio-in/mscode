import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.service.js";
import { Event } from "../../../../base/common/event.js";
import { ITrustedDomainService } from "../common/trustedDomainService.service.js";
export { ITrustedDomainService };
export declare class TrustedDomainService extends Disposable implements ITrustedDomainService {
    private readonly _instantiationService;
    private readonly _storageService;
    _serviceBrand: undefined;
    private _staticTrustedDomainsResult;
    private _onDidChangeTrustedDomains;
    readonly onDidChangeTrustedDomains: Event<void>;
    constructor(_instantiationService: IInstantiationService, _storageService: IStorageService);
    get trustedDomains(): string[];
    isValid(resource: URI): boolean;
}
