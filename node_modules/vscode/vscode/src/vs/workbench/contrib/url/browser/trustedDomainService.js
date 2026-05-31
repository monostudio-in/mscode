
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { WindowIdleValue } from '../../../../base/browser/dom.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { StorageScope } from '../../../../platform/storage/common/storage.js';
import { IStorageService } from '../../../../platform/storage/common/storage.service.js';
import { readStaticTrustedDomains, TRUSTED_DOMAINS_STORAGE_KEY } from './trustedDomains.js';
import { isURLDomainTrusted } from '../../../../platform/url/common/trustedDomains.js';
import { Emitter } from '../../../../base/common/event.js';

let TrustedDomainService = class TrustedDomainService extends Disposable {
    constructor(_instantiationService, _storageService) {
        super();
        this._instantiationService = _instantiationService;
        this._storageService = _storageService;
        this._onDidChangeTrustedDomains = this._register(( new Emitter()));
        this.onDidChangeTrustedDomains = this._onDidChangeTrustedDomains.event;
        const initStaticDomainsResult = () => {
            return new WindowIdleValue(mainWindow, () => {
                const {
                    defaultTrustedDomains,
                    trustedDomains
                } = this._instantiationService.invokeFunction(readStaticTrustedDomains);
                return [...defaultTrustedDomains, ...trustedDomains];
            });
        };
        this._staticTrustedDomainsResult = initStaticDomainsResult();
        this._register(
            this._storageService.onDidChangeValue(StorageScope.APPLICATION, TRUSTED_DOMAINS_STORAGE_KEY, this._store)(() => {
                this._staticTrustedDomainsResult?.dispose();
                this._staticTrustedDomainsResult = initStaticDomainsResult();
                this._onDidChangeTrustedDomains.fire();
            })
        );
    }
    get trustedDomains() {
        return this._staticTrustedDomainsResult.value;
    }
    isValid(resource) {
        const {
            defaultTrustedDomains,
            trustedDomains
        } = this._instantiationService.invokeFunction(readStaticTrustedDomains);
        const allTrustedDomains = [...defaultTrustedDomains, ...trustedDomains];
        return isURLDomainTrusted(resource, allTrustedDomains);
    }
};
TrustedDomainService = ( __decorate([( __param(0, IInstantiationService)), ( __param(1, IStorageService))], TrustedDomainService));

export { TrustedDomainService };
