
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { isEqualOrParent } from '../../../../base/common/resources.js';
import { score } from '../../../../editor/common/languageSelector.js';
import { Emitter } from '../../../../base/common/event.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.service.js';
import { StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IStorageService } from '../../../../platform/storage/common/storage.service.js';

var QuickDiffService_1;
function createProviderComparer(uri) {
    return (a, b) => {
        if (a.rootUri && !b.rootUri) {
            return -1;
        } else if (!a.rootUri && b.rootUri) {
            return 1;
        } else if (!a.rootUri && !b.rootUri) {
            return 0;
        }
        const aIsParent = isEqualOrParent(uri, a.rootUri);
        const bIsParent = isEqualOrParent(uri, b.rootUri);
        if (aIsParent && bIsParent) {
            return providerComparer(a, b);
        } else if (aIsParent) {
            return -1;
        } else if (bIsParent) {
            return 1;
        } else {
            return 0;
        }
    };
}
function providerComparer(a, b) {
    if (a.kind === "primary") {
        return -1;
    } else if (b.kind === "primary") {
        return 1;
    } else if (a.kind === "secondary") {
        return -1;
    } else if (b.kind === "secondary") {
        return 1;
    }
    return 0;
}
let QuickDiffService = class QuickDiffService extends Disposable {
    static {
        QuickDiffService_1 = this;
    }
    static {
        this.STORAGE_KEY = "workbench.scm.quickDiffProviders.hidden";
    }
    get providers() {
        return Array.from(this.quickDiffProviders).sort(providerComparer);
    }
    constructor(storageService, uriIdentityService) {
        super();
        this.storageService = storageService;
        this.uriIdentityService = uriIdentityService;
        this.quickDiffProviders = ( new Set());
        this._onDidChangeQuickDiffProviders = this._register(( new Emitter()));
        this.onDidChangeQuickDiffProviders = this._onDidChangeQuickDiffProviders.event;
        this.hiddenQuickDiffProviders = ( new Set());
        this.loadState();
    }
    addQuickDiffProvider(quickDiff) {
        this.quickDiffProviders.add(quickDiff);
        this._onDidChangeQuickDiffProviders.fire();
        return {
            dispose: () => {
                this.quickDiffProviders.delete(quickDiff);
                this._onDidChangeQuickDiffProviders.fire();
            }
        };
    }
    async getQuickDiffs(uri, language = "", isSynchronized = false) {
        const providers = Array.from(this.quickDiffProviders).filter(
            provider => !provider.rootUri || this.uriIdentityService.extUri.isEqualOrParent(uri, provider.rootUri)
        ).sort(createProviderComparer(uri));
        const quickDiffOriginalResources = await Promise.allSettled(( providers.map(async provider => {
            const scoreValue = provider.selector ? score(provider.selector, uri, language, isSynchronized, undefined, undefined) : 10;
            const originalResource = scoreValue > 0 ? (await provider.getOriginalResource(uri)) ?? undefined : undefined;
            return {
                provider,
                originalResource
            };
        })));
        const quickDiffs = [];
        for (const quickDiffOriginalResource of quickDiffOriginalResources) {
            if (quickDiffOriginalResource.status === "rejected") {
                continue;
            }
            const {
                provider,
                originalResource
            } = quickDiffOriginalResource.value;
            if (!originalResource) {
                continue;
            }
            quickDiffs.push({
                id: provider.id,
                label: provider.label,
                kind: provider.kind,
                originalResource
            });
        }
        return quickDiffs;
    }
    toggleQuickDiffProviderVisibility(id) {
        if (this.isQuickDiffProviderVisible(id)) {
            this.hiddenQuickDiffProviders.add(id);
        } else {
            this.hiddenQuickDiffProviders.delete(id);
        }
        this.saveState();
        this._onDidChangeQuickDiffProviders.fire();
    }
    isQuickDiffProviderVisible(id) {
        return !( this.hiddenQuickDiffProviders.has(id));
    }
    loadState() {
        const raw = this.storageService.get(QuickDiffService_1.STORAGE_KEY, StorageScope.PROFILE);
        if (raw) {
            try {
                this.hiddenQuickDiffProviders = ( new Set(JSON.parse(raw)));
            } catch {}
        }
    }
    saveState() {
        if (this.hiddenQuickDiffProviders.size === 0) {
            this.storageService.remove(QuickDiffService_1.STORAGE_KEY, StorageScope.PROFILE);
        } else {
            this.storageService.store(
                QuickDiffService_1.STORAGE_KEY,
                JSON.stringify(Array.from(this.hiddenQuickDiffProviders)),
                StorageScope.PROFILE,
                StorageTarget.USER
            );
        }
    }
};
QuickDiffService = QuickDiffService_1 = ( __decorate([( __param(0, IStorageService)), ( __param(1, IUriIdentityService))], QuickDiffService));
async function getOriginalResource(quickDiffService, uri, language, isSynchronized) {
    const quickDiffs = await quickDiffService.getQuickDiffs(uri, language, isSynchronized);
    const primaryQuickDiffs = quickDiffs.find(quickDiff => quickDiff.kind === "primary");
    return primaryQuickDiffs ? primaryQuickDiffs.originalResource : null;
}

export { QuickDiffService, getOriginalResource };
