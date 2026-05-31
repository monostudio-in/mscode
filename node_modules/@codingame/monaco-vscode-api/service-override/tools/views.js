
import { SyncDescriptor } from '../../vscode/src/vs/platform/instantiation/common/descriptors.js';
import { Extensions } from '../../vscode/src/vs/workbench/common/views.js';
export { ViewContainerLocation } from '../../vscode/src/vs/workbench/common/views.js';
import { MutableDisposable, DisposableStore } from '../../vscode/src/vs/base/common/lifecycle.js';
import { size, $ } from '../../vscode/src/vs/base/browser/dom.js';
import { ViewPane } from '../../vscode/src/vs/workbench/browser/parts/views/viewPane.js';
import { Registry } from '../../vscode/src/vs/platform/registry/common/platform.js';
import { ViewPaneContainer } from '../../vscode/src/vs/workbench/browser/parts/views/viewPaneContainer.js';
import { URI } from '../../vscode/src/vs/base/common/uri.js';
import { Codicon } from '../../vscode/src/vs/base/common/codicons.js';
export { RegisteredEditorPriority } from '../../vscode/src/vs/workbench/services/editor/common/editorResolverService.js';
import { IEditorResolverService } from '../../vscode/src/vs/workbench/services/editor/common/editorResolverService.service.js';
import { EditorInput } from '../../vscode/src/vs/workbench/common/editor/editorInput.js';
import { Verbosity, EditorExtensions } from '../../vscode/src/vs/workbench/common/editor.js';
export { EditorInputCapabilities } from '../../vscode/src/vs/workbench/common/editor.js';
import { registerAction2, Action2, MenuId } from '../../vscode/src/vs/platform/actions/common/actions.js';
import { Categories } from '../../vscode/src/vs/platform/action/common/actionCommonCategories.js';
import { ContextKeyExpr } from '../../vscode/src/vs/platform/contextkey/common/contextkey.js';
import { EditorPaneDescriptor } from '../../vscode/src/vs/workbench/browser/editor.js';
import { EditorPane } from '../../vscode/src/vs/workbench/browser/parts/editor/editorPane.js';
import { ITelemetryService } from '../../vscode/src/vs/platform/telemetry/common/telemetry.service.js';
import { IStorageService } from '../../vscode/src/vs/platform/storage/common/storage.service.js';
import { IThemeService } from '../../vscode/src/vs/platform/theme/common/themeService.service.js';
import '../../vscode/src/vs/base/common/cancellation.js';
import { DomScrollableElement } from '../../vscode/src/vs/base/browser/ui/scrollbar/scrollableElement.js';
import { assertReturnsDefined, assertReturnsAllDefined } from '../../vscode/src/vs/base/common/types.js';
import { ScrollbarVisibility } from '../../vscode/src/vs/base/common/scrollable.js';
export { ConfirmResult } from '../../vscode/src/vs/platform/dialogs/common/dialogs.js';
export { AbstractResourceEditorInput } from '../../vscode/src/vs/workbench/common/editor/resourceEditorInput.js';
export { AbstractTextResourceEditorInput } from '../../vscode/src/vs/workbench/common/editor/textResourceEditorInput.js';
export { Parts } from '../../vscode/src/vs/workbench/services/layout/browser/layoutService.js';
import { IWorkbenchLayoutService } from '../../vscode/src/vs/workbench/services/layout/browser/layoutService.service.js';
import { StandaloneServices } from '../../vscode/src/vs/editor/standalone/browser/standaloneServices.js';
import '../../vscode/src/vs/base/common/event.js';
export { SplitView } from '../../vscode/src/vs/base/browser/ui/splitview/splitview.js';
import { withReadyServices } from '../../services.js';

class InjectedEditorPane extends EditorPane {
    constructor(id, group) {
        super(id, group, StandaloneServices.get(ITelemetryService), StandaloneServices.get(IThemeService), StandaloneServices.get(IStorageService));
    }
}
class SimpleEditorPane extends InjectedEditorPane {
    constructor() {
        super(...arguments);
        this.inputDisposable = this._register(new MutableDisposable());
    }
    createEditor(parent) {
        this.container = this.initialize();
        this.wrapper = document.createElement('div');
        this.wrapper.append(this.container);
        this.scrollbar = this._register(new DomScrollableElement(this.wrapper, {
            horizontal: ScrollbarVisibility.Auto,
            vertical: ScrollbarVisibility.Auto
        }));
        parent.appendChild(this.scrollbar.getDomNode());
        const observer = new ResizeObserver(() => {
            assertReturnsDefined(this.scrollbar).scanDomNode();
        });
        observer.observe(this.container);
        this._register({
            dispose() {
                observer.disconnect();
            }
        });
    }
    async setInput(input, editorOptions, context, token) {
        await super.setInput(input, editorOptions, context, token);
        if (token.isCancellationRequested) {
            return;
        }
        this.inputDisposable.value = await this.renderInput?.(input, editorOptions, context, token);
        assertReturnsDefined(this.scrollbar).scanDomNode();
    }
    layout(dimension) {
        const [wrapper, scrollbar] = assertReturnsAllDefined(this.wrapper, this.scrollbar);
        size(wrapper, dimension.width, dimension.height);
        scrollbar.scanDomNode();
    }
    focus() {
        const container = assertReturnsDefined(this.container);
        container.focus();
    }
    clearInput() {
        this.inputDisposable.clear();
        super.clearInput();
    }
}
class SimpleEditorInput extends EditorInput {
    constructor(resource, closeHandler) {
        super();
        this.closeHandler = closeHandler;
        this.dirty = false;
        this._capabilities = 0;
        this.resource = resource;
    }
    get capabilities() {
        return this._capabilities;
    }
    addCapability(capability) {
        this._capabilities |= capability;
        this._onDidChangeCapabilities.fire();
    }
    removeCapability(capability) {
        this._capabilities &= ~capability;
        this._onDidChangeCapabilities.fire();
    }
    get editorId() {
        return this.typeId;
    }
    setName(name) {
        this.name = name;
        this._onDidChangeLabel.fire();
    }
    setTitle(title) {
        this.title = title;
        this._onDidChangeLabel.fire();
    }
    setDescription(description) {
        this.description = description;
        this._onDidChangeLabel.fire();
    }
    getLabelValue(label, verbosity) {
        if (typeof label === 'string') {
            return label;
        }
        switch (verbosity) {
            case Verbosity.SHORT:
                return label.short;
            case Verbosity.LONG:
                return label.long;
            case Verbosity.MEDIUM:
            default:
                return label.medium;
        }
    }
    getName() {
        return this.name ?? 'Unnamed';
    }
    getTitle(verbosity) {
        return this.getLabelValue(this.title ?? this.getName(), verbosity);
    }
    getDescription(verbosity) {
        return this.getLabelValue(this.description ?? this.getName(), verbosity);
    }
    isDirty() {
        return this.dirty;
    }
    setDirty(dirty) {
        this.dirty = dirty;
        this._onDidChangeDirty.fire();
    }
    toUntyped() {
        if (this.resource == null) {
            return undefined;
        }
        return {
            resource: this.resource
        };
    }
}
function registerEditorPane(typeId, name, ctor,
inputCtors) {
    return Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(ctor, typeId, name), inputCtors.map((ctor) => new SyncDescriptor(ctor)));
}
function registerEditor(globPattern, editorInfo, editorOptions, factory) {
    return withReadyServices((servicesAccessor) => {
        const resolverService = servicesAccessor.get(IEditorResolverService);
        return resolverService.registerEditor(globPattern, editorInfo, editorOptions, factory);
    });
}
function registerEditorSerializer(editorTypeId, ctor) {
    return Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(editorTypeId, ctor);
}
const viewContainerRegistry = Registry.as(Extensions.ViewContainersRegistry);
const viewRegistry = Registry.as(Extensions.ViewsRegistry);
function registerCustomView(options) {
    const iconUrl = options.icon != null ? URI.parse(options.icon) : undefined;
    const viewContainer = options.viewContainer ??
        viewContainerRegistry.registerViewContainer({
            id: options.id,
            title: { value: options.name, original: options.name },
            order: options.order,
            ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [
                options.id,
                { mergeViewWithContainerWhenSingleView: true }
            ]),
            hideIfEmpty: true,
            icon: iconUrl
        }, options.location, {
            isDefault: options.default
        });
    const views = [
        {
            id: options.id,
            name: {
                value: options.name,
                original: options.name
            },
            ctorDescriptor: new SyncDescriptor(class extends ViewPane {
                renderBody(container) {
                    super.renderBody(container);
                    this.wrapper = document.createElement('div');
                    this.scrollbar = this._register(new DomScrollableElement(this.wrapper, {
                        horizontal: ScrollbarVisibility.Auto,
                        vertical: ScrollbarVisibility.Auto
                    }));
                    this.container = $('.view-pane-content');
                    this.container.style.display = 'flex';
                    this.container.style.alignItems = 'stretch';
                    this._register(options.renderBody(this.container, this.scrollbar));
                    this.wrapper.append(this.container);
                    container.appendChild(this.scrollbar.getDomNode());
                    const observer = new ResizeObserver(() => {
                        assertReturnsDefined(this.scrollbar).scanDomNode();
                    });
                    observer.observe(this.container);
                    this._register({
                        dispose() {
                            observer.disconnect();
                        }
                    });
                }
                layoutBody(height, width) {
                    const [wrapper, scrollbar] = assertReturnsAllDefined(this.wrapper, this.scrollbar);
                    size(wrapper, width, height);
                    scrollbar.scanDomNode();
                }
            }),
            canMoveView: options.canMoveView ?? true,
            canToggleVisibility: options.canToggleVisibility ?? false,
            hideByDefault: options.hideByDefault ?? false,
            collapsed: options.collapsed ?? false,
            order: options.order,
            containerIcon: iconUrl
        }
    ];
    viewRegistry.registerViews(views, viewContainer);
    const disposableCollection = new DisposableStore();
    disposableCollection.add({
        dispose() {
            viewRegistry.deregisterViews(views, viewContainer);
            if (options.viewContainer == null) {
                viewContainerRegistry.deregisterViewContainer(viewContainer);
            }
        }
    });
    for (const action of options.actions ?? []) {
        disposableCollection.add(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: action.id,
                    title: { value: action.title, original: action.title },
                    category: Categories.View,
                    menu: [
                        {
                            id: MenuId.ViewTitle,
                            when: ContextKeyExpr.equals('view', options.id),
                            group: 'navigation',
                            order: action.order
                        },
                        {
                            id: MenuId.CommandPalette
                        }
                    ],
                    tooltip: action.tooltip,
                    icon: action.icon != null ? Codicon[action.icon] : undefined
                });
                this.run = action.run ?? (async () => { });
            }
        }));
    }
    return disposableCollection;
}
function isPartVisibile(part) {
    return StandaloneServices.get(IWorkbenchLayoutService).isVisible(part, window);
}
function setPartVisibility(part, visible) {
    StandaloneServices.get(IWorkbenchLayoutService).setPartHidden(!visible, part);
}
const onDidChangePanelPosition = (listener) => {
    return StandaloneServices.get(IWorkbenchLayoutService).onDidChangePanelPosition(listener);
};
function getPanelPosition() {
    return StandaloneServices.get(IWorkbenchLayoutService).getPanelPosition();
}
const onDidChangeSideBarPosition = (listener) => {
    return StandaloneServices.get(IWorkbenchLayoutService).onDidChangeSideBarPosition(listener);
};
function getSideBarPosition() {
    return StandaloneServices.get(IWorkbenchLayoutService).getSideBarPosition();
}

export { DomScrollableElement, EditorInput, InjectedEditorPane as EditorPane, SimpleEditorInput, SimpleEditorPane, ViewPaneContainer, getPanelPosition, getSideBarPosition, isPartVisibile, onDidChangePanelPosition, onDidChangeSideBarPosition, registerCustomView, registerEditor, registerEditorPane, registerEditorSerializer, setPartVisibility, viewContainerRegistry, viewRegistry };
