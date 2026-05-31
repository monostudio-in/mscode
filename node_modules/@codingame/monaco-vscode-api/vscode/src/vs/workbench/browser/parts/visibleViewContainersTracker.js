
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { Disposable, DisposableMap } from '../../../base/common/lifecycle.js';
import { Emitter } from '../../../base/common/event.js';
import { IViewDescriptorService } from '../../common/views.service.js';

let VisibleViewContainersTracker = class VisibleViewContainersTracker extends Disposable {
    constructor(location, viewDescriptorService) {
        super();
        this.location = location;
        this.viewDescriptorService = viewDescriptorService;
        this.viewContainerModelListeners = this._register(( new DisposableMap()));
        this._onDidChange = this._register(( new Emitter()));
        this.onDidChange = this._onDidChange.event;
        this._visibleCount = 0;
        this.registerListeners();
        this.initializeViewContainerListeners();
        this.updateVisibleCount();
    }
    get visibleCount() {
        return this._visibleCount;
    }
    registerListeners() {
        this._register(this.viewDescriptorService.onDidChangeViewContainers((
            {
                added,
                removed
            }
        ) => {
            for (const {
                container,
                location
            } of added) {
                if (location === this.location) {
                    this.addViewContainerModelListener(container.id);
                }
            }
            for (const {
                container,
                location
            } of removed) {
                if (location === this.location) {
                    this.viewContainerModelListeners.deleteAndDispose(container.id);
                }
            }
            const relevantChange = ( [...added, ...removed].some((
                {
                    location
                }
            ) => location === this.location));
            if (relevantChange) {
                this.updateVisibleCount();
            }
        }));
        this._register(this.viewDescriptorService.onDidChangeContainerLocation((
            {
                viewContainer,
                from,
                to
            }
        ) => {
            if (from === this.location) {
                this.viewContainerModelListeners.deleteAndDispose(viewContainer.id);
            }
            if (to === this.location) {
                this.addViewContainerModelListener(viewContainer.id);
            }
            if (from === this.location || to === this.location) {
                this.updateVisibleCount();
            }
        }));
    }
    initializeViewContainerListeners() {
        for (const container of this.viewDescriptorService.getViewContainersByLocation(this.location)) {
            this.addViewContainerModelListener(container.id);
        }
    }
    addViewContainerModelListener(containerId) {
        const container = this.viewDescriptorService.getViewContainerById(containerId);
        if (container) {
            const model = this.viewDescriptorService.getViewContainerModel(container);
            const listener = model.onDidChangeActiveViewDescriptors(() => this.updateVisibleCount());
            this.viewContainerModelListeners.set(containerId, listener);
        }
    }
    updateVisibleCount() {
        const viewContainers = this.viewDescriptorService.getViewContainersByLocation(this.location);
        const visibleViewContainers = viewContainers.filter(
            container => this.viewDescriptorService.getViewContainerModel(container).activeViewDescriptors.length > 0
        );
        const newCount = visibleViewContainers.length;
        if (this._visibleCount !== newCount) {
            const before = this._visibleCount;
            this._visibleCount = newCount;
            this._onDidChange.fire({
                before,
                after: newCount
            });
        }
    }
};
VisibleViewContainersTracker = ( __decorate([( __param(1, IViewDescriptorService))], VisibleViewContainersTracker));

export { VisibleViewContainersTracker };
