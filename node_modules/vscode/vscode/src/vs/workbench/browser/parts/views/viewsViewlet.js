
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.service.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.service.js';
import { IViewDescriptorService } from '../../../common/views.service.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.service.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.service.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.service.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.service.js';
import { ViewPaneContainer } from './viewPaneContainer.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.service.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.service.js';
import { ILogService } from '../../../../platform/log/common/log.service.js';

let FilterViewPaneContainer = class FilterViewPaneContainer extends ViewPaneContainer {
    constructor(
        viewletId,
        onDidChangeFilterValue,
        configurationService,
        layoutService,
        telemetryService,
        storageService,
        instantiationService,
        themeService,
        contextMenuService,
        extensionService,
        contextService,
        viewDescriptorService,
        logService
    ) {
        super(viewletId, {
            mergeViewWithContainerWhenSingleView: false
        }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService, logService);
        this.constantViewDescriptors = ( new Map());
        this.allViews = ( new Map());
        this._register(onDidChangeFilterValue(newFilterValue => {
            this.filterValue = newFilterValue;
            this.onFilterChanged(newFilterValue);
        }));
        this._register(this.viewContainerModel.onDidChangeActiveViewDescriptors(() => {
            this.updateAllViews(this.viewContainerModel.activeViewDescriptors);
        }));
    }
    updateAllViews(viewDescriptors) {
        viewDescriptors.forEach(descriptor => {
            const filterOnValue = this.getFilterOn(descriptor);
            if (!filterOnValue) {
                return;
            }
            if (!( this.allViews.has(filterOnValue))) {
                this.allViews.set(filterOnValue, ( new Map()));
            }
            this.allViews.get(filterOnValue).set(descriptor.id, descriptor);
            if (this.filterValue && !this.filterValue.includes(filterOnValue) && this.panes.find(pane => pane.id === descriptor.id)) {
                this.viewContainerModel.setVisible(descriptor.id, false);
            }
        });
    }
    addConstantViewDescriptors(constantViewDescriptors) {
        constantViewDescriptors.forEach(
            viewDescriptor => this.constantViewDescriptors.set(viewDescriptor.id, viewDescriptor)
        );
    }
    onFilterChanged(newFilterValue) {
        if (this.allViews.size === 0) {
            this.updateAllViews(this.viewContainerModel.activeViewDescriptors);
        }
        this.getViewsNotForTarget(newFilterValue).forEach(item => this.viewContainerModel.setVisible(item.id, false));
        this.getViewsForTarget(newFilterValue).forEach(item => this.viewContainerModel.setVisible(item.id, true));
    }
    getViewsForTarget(target) {
        const views = [];
        for (let i = 0; i < target.length; i++) {
            if (( this.allViews.has(target[i]))) {
                views.push(...Array.from(( this.allViews.get(target[i]).values())));
            }
        }
        return views;
    }
    getViewsNotForTarget(target) {
        const iterable = ( this.allViews.keys());
        let key = iterable.next();
        let views = [];
        while (!key.done) {
            let isForTarget = false;
            target.forEach(value => {
                if (key.value === value) {
                    isForTarget = true;
                }
            });
            if (!isForTarget) {
                views = views.concat(this.getViewsForTarget([key.value]));
            }
            key = iterable.next();
        }
        return views;
    }
    onDidAddViewDescriptors(added) {
        const panes = super.onDidAddViewDescriptors(added);
        for (let i = 0; i < added.length; i++) {
            if (( this.constantViewDescriptors.has(added[i].viewDescriptor.id))) {
                panes[i].setExpanded(false);
            }
        }
        if (this.allViews.size === 0) {
            this.updateAllViews(this.viewContainerModel.activeViewDescriptors);
        }
        return panes;
    }
    openView(id, focus) {
        const result = super.openView(id, focus);
        if (result) {
            const descriptorMap = Array.from(this.allViews.entries()).find(entry => ( entry[1].has(id)));
            if (descriptorMap && !this.filterValue?.includes(descriptorMap[0])) {
                this.setFilter(descriptorMap[1].get(id));
            }
        }
        return result;
    }
};
FilterViewPaneContainer = ( __decorate([( __param(2, IConfigurationService)), ( __param(3, IWorkbenchLayoutService)), ( __param(4, ITelemetryService)), ( __param(5, IStorageService)), ( __param(6, IInstantiationService)), ( __param(7, IThemeService)), ( __param(8, IContextMenuService)), ( __param(9, IExtensionService)), ( __param(10, IWorkspaceContextService)), ( __param(11, IViewDescriptorService)), ( __param(12, ILogService))], FilterViewPaneContainer));

export { FilterViewPaneContainer };
