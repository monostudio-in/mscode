
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { DeferredPromise } from '../../../base/common/async.js';
import { CancellationTokenSource } from '../../../base/common/cancellation.js';
import { Event } from '../../../base/common/event.js';
import { Disposable, toDisposable, isDisposable, DisposableStore } from '../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../contextkey/common/contextkey.service.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { Extensions, DefaultQuickAccessFilterValue } from '../common/quickAccess.js';
import { ItemActivation } from '../common/quickInput.js';
import { IQuickInputService } from '../common/quickInput.service.js';
import { Registry } from '../../registry/common/platform.js';

let QuickAccessController = class QuickAccessController extends Disposable {
    constructor(quickInputService, instantiationService, contextKeyService) {
        super();
        this.quickInputService = quickInputService;
        this.instantiationService = instantiationService;
        this.contextKeyService = contextKeyService;
        this.registry = ( Registry.as(Extensions.Quickaccess));
        this.mapProviderToDescriptor = ( new Map());
        this.lastAcceptedPickerValues = ( new Map());
        this.visibleQuickAccess = undefined;
        this._register(toDisposable(() => {
            for (const provider of ( this.mapProviderToDescriptor.values())) {
                if (isDisposable(provider)) {
                    provider.dispose();
                }
            }
            this.visibleQuickAccess?.picker.dispose();
        }));
    }
    pick(value = "", options) {
        return this.doShowOrPick(value, true, options);
    }
    show(value = "", options) {
        this.doShowOrPick(value, false, options);
    }
    doShowOrPick(value, pick, options) {
        const [provider, descriptor] = this.getOrInstantiateProvider(value, options?.enabledProviderPrefixes);
        const visibleQuickAccess = this.visibleQuickAccess;
        const visibleDescriptor = visibleQuickAccess?.descriptor;
        if (visibleQuickAccess && descriptor && visibleDescriptor === descriptor) {
            if (value !== descriptor.prefix && !options?.preserveValue) {
                visibleQuickAccess.picker.value = value;
            }
            this.adjustValueSelection(visibleQuickAccess.picker, descriptor, options);
            return;
        }
        if (descriptor && !options?.preserveValue) {
            let newValue = undefined;
            if (visibleQuickAccess && visibleDescriptor && visibleDescriptor !== descriptor) {
                const newValueCandidateWithoutPrefix = visibleQuickAccess.value.substr(visibleDescriptor.prefix.length);
                if (newValueCandidateWithoutPrefix) {
                    newValue = `${descriptor.prefix}${newValueCandidateWithoutPrefix}`;
                }
            }
            if (!newValue) {
                const defaultFilterValue = provider?.defaultFilterValue;
                if (defaultFilterValue === DefaultQuickAccessFilterValue.LAST) {
                    newValue = this.lastAcceptedPickerValues.get(descriptor);
                } else if (typeof defaultFilterValue === "string") {
                    newValue = `${descriptor.prefix}${defaultFilterValue}`;
                }
            }
            if (typeof newValue === "string") {
                value = newValue;
            }
        }
        const visibleSelection = visibleQuickAccess?.picker?.valueSelection;
        const visibleValue = visibleQuickAccess?.picker?.value;
        const disposables = ( new DisposableStore());
        const picker = disposables.add(this.quickInputService.createQuickPick({
            useSeparators: true
        }));
        picker.value = value;
        this.adjustValueSelection(picker, descriptor, options);
        picker.placeholder = options?.placeholder ?? descriptor?.placeholder;
        picker.quickNavigate = options?.quickNavigateConfiguration;
        picker.hideInput = !!picker.quickNavigate && !visibleQuickAccess;
        if (typeof options?.itemActivation === "number" || options?.quickNavigateConfiguration) {
            picker.itemActivation = options?.itemActivation ?? ItemActivation.SECOND ;
        }
        picker.contextKey = descriptor?.contextKey;
        picker.filterValue = value => value.substring(descriptor ? descriptor.prefix.length : 0);
        let pickPromise = undefined;
        if (pick) {
            pickPromise = ( new DeferredPromise());
            disposables.add(Event.once(picker.onWillAccept)(e => {
                e.veto();
                picker.hide();
            }));
        }
        disposables.add(this.registerPickerListeners(picker, provider, descriptor, value, options));
        const cts = disposables.add(( new CancellationTokenSource()));
        if (provider) {
            disposables.add(provider.provide(picker, cts.token, options?.providerOptions));
        }
        Event.once(picker.onDidHide)(() => {
            if (picker.selectedItems.length === 0) {
                cts.cancel();
            }
            disposables.dispose();
            pickPromise?.complete(picker.selectedItems.slice(0));
        });
        picker.show();
        if (visibleSelection && visibleValue === value) {
            picker.valueSelection = visibleSelection;
        }
        if (pick) {
            return pickPromise?.p;
        }
    }
    adjustValueSelection(picker, descriptor, options) {
        let valueSelection;
        if (options?.preserveValue) {
            valueSelection = [picker.value.length, picker.value.length];
        }
        else {
            valueSelection = [descriptor?.prefix.length ?? 0, picker.value.length];
        }
        picker.valueSelection = valueSelection;
    }
    registerPickerListeners(picker, provider, descriptor, value, options) {
        const disposables = ( new DisposableStore());
        const visibleQuickAccess = this.visibleQuickAccess = {
            picker,
            descriptor,
            value
        };
        disposables.add(toDisposable(() => {
            if (visibleQuickAccess === this.visibleQuickAccess) {
                this.visibleQuickAccess = undefined;
            }
        }));
        disposables.add(picker.onDidChangeValue(value => {
            const [providerForValue] = this.getOrInstantiateProvider(value, options?.enabledProviderPrefixes);
            if (providerForValue !== provider) {
                this.show(value, {
                    enabledProviderPrefixes: options?.enabledProviderPrefixes,
                    preserveValue: true,
                    providerOptions: options?.providerOptions
                });
            } else {
                visibleQuickAccess.value = value;
            }
        }));
        if (descriptor) {
            disposables.add(picker.onDidAccept(() => {
                this.lastAcceptedPickerValues.set(descriptor, picker.value);
            }));
        }
        return disposables;
    }
    getOrInstantiateProvider(value, enabledProviderPrefixes) {
        const providerDescriptor = this.registry.getQuickAccessProvider(value, this.contextKeyService);
        if (!providerDescriptor || enabledProviderPrefixes && !enabledProviderPrefixes?.includes(providerDescriptor.prefix)) {
            return [undefined, undefined];
        }
        let provider = this.mapProviderToDescriptor.get(providerDescriptor);
        if (!provider) {
            provider = this.instantiationService.createInstance(providerDescriptor.ctor);
            this.mapProviderToDescriptor.set(providerDescriptor, provider);
        }
        return [provider, providerDescriptor];
    }
};
QuickAccessController = ( __decorate([( __param(0, IQuickInputService)), ( __param(1, IInstantiationService)), ( __param(2, IContextKeyService))], QuickAccessController));

export { QuickAccessController };
