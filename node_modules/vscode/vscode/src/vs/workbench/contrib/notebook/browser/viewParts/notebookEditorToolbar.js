
import { __decorate, __param } from '../../../../../../../../external/tslib/tslib.es6.js';
import { addDisposableListener, EventType, getWindow, createElement, append } from '../../../../../base/browser/dom.js';
import { StandardMouseEvent } from '../../../../../base/browser/mouseEvent.js';
import { DomScrollableElement } from '../../../../../base/browser/ui/scrollbar/scrollableElement.js';
import { ToolBar } from '../../../../../base/browser/ui/toolbar/toolbar.js';
import { Separator } from '../../../../../base/common/actions.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ScrollbarVisibility } from '../../../../../base/common/scrollable.js';
import { MenuEntryActionViewItem, SubmenuEntryActionViewItem } from '../../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { MenuItemAction, SubmenuItemAction, MenuId } from '../../../../../platform/actions/common/actions.js';
import { IMenuService } from '../../../../../platform/actions/common/actions.service.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.service.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.service.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.service.js';
import { SELECT_KERNEL_ID } from '../controller/coreActions.js';
import { NOTEBOOK_EDITOR_ID, NotebookSetting } from '../../common/notebookCommon.js';
import { NotebooKernelActionViewItem } from './notebookKernelView.js';
import { ActionViewWithLabel, UnifiedSubmenuActionView } from '../view/cellParts/cellActionView.js';
import { IEditorService } from '../../../../services/editor/common/editorService.service.js';
import { disposableTimeout } from '../../../../../base/common/async.js';
import { HiddenItemStrategy, WorkbenchToolBar } from '../../../../../platform/actions/browser/toolbar.js';
import { WorkbenchHoverDelegate } from '../../../../../platform/hover/browser/hover.js';

var RenderLabel;
(function(RenderLabel) {
    RenderLabel[RenderLabel["Always"] = 0] = "Always";
    RenderLabel[RenderLabel["Never"] = 1] = "Never";
    RenderLabel[RenderLabel["Dynamic"] = 2] = "Dynamic";
})(RenderLabel || (RenderLabel = {}));
const ICON_ONLY_ACTION_WIDTH = 21;
const TOGGLE_MORE_ACTION_WIDTH = 21;
const ACTION_PADDING = 8;
class WorkbenchAlwaysLabelStrategy {
    constructor(notebookEditor, editorToolbar, goToMenu, instantiationService) {
        this.notebookEditor = notebookEditor;
        this.editorToolbar = editorToolbar;
        this.goToMenu = goToMenu;
        this.instantiationService = instantiationService;
    }
    actionProvider(action, options) {
        if (action.id === SELECT_KERNEL_ID) {
            return this.instantiationService.createInstance(NotebooKernelActionViewItem, action, this.notebookEditor, options);
        }
        if (action instanceof MenuItemAction) {
            return this.instantiationService.createInstance(ActionViewWithLabel, action, {
                hoverDelegate: options.hoverDelegate
            });
        }
        if (action instanceof SubmenuItemAction && action.item.submenu.id === MenuId.NotebookCellExecuteGoTo.id) {
            return this.instantiationService.createInstance(UnifiedSubmenuActionView, action, {
                hoverDelegate: options.hoverDelegate
            }, true, {
                getActions: () => {
                    return this.goToMenu.getActions().find(([group]) => group === "navigation/execute")?.[1] ?? [];
                }
            }, this.actionProvider.bind(this));
        }
        return undefined;
    }
    calculateActions(leftToolbarContainerMaxWidth) {
        const initialPrimaryActions = this.editorToolbar.primaryActions;
        const initialSecondaryActions = this.editorToolbar.secondaryActions;
        const actionOutput = workbenchCalculateActions(
            initialPrimaryActions,
            initialSecondaryActions,
            leftToolbarContainerMaxWidth
        );
        return {
            primaryActions: ( actionOutput.primaryActions.map(a => a.action)),
            secondaryActions: actionOutput.secondaryActions
        };
    }
}
class WorkbenchNeverLabelStrategy {
    constructor(notebookEditor, editorToolbar, goToMenu, instantiationService) {
        this.notebookEditor = notebookEditor;
        this.editorToolbar = editorToolbar;
        this.goToMenu = goToMenu;
        this.instantiationService = instantiationService;
    }
    actionProvider(action, options) {
        if (action.id === SELECT_KERNEL_ID) {
            return this.instantiationService.createInstance(NotebooKernelActionViewItem, action, this.notebookEditor, options);
        }
        if (action instanceof MenuItemAction) {
            return this.instantiationService.createInstance(MenuEntryActionViewItem, action, {
                hoverDelegate: options.hoverDelegate
            });
        }
        if (action instanceof SubmenuItemAction) {
            if (action.item.submenu.id === MenuId.NotebookCellExecuteGoTo.id) {
                return this.instantiationService.createInstance(UnifiedSubmenuActionView, action, {
                    hoverDelegate: options.hoverDelegate
                }, false, {
                    getActions: () => {
                        return this.goToMenu.getActions().find(([group]) => group === "navigation/execute")?.[1] ?? [];
                    }
                }, this.actionProvider.bind(this));
            } else {
                return this.instantiationService.createInstance(SubmenuEntryActionViewItem, action, {
                    hoverDelegate: options.hoverDelegate
                });
            }
        }
        return undefined;
    }
    calculateActions(leftToolbarContainerMaxWidth) {
        const initialPrimaryActions = this.editorToolbar.primaryActions;
        const initialSecondaryActions = this.editorToolbar.secondaryActions;
        const actionOutput = workbenchCalculateActions(
            initialPrimaryActions,
            initialSecondaryActions,
            leftToolbarContainerMaxWidth
        );
        return {
            primaryActions: ( actionOutput.primaryActions.map(a => a.action)),
            secondaryActions: actionOutput.secondaryActions
        };
    }
}
class WorkbenchDynamicLabelStrategy {
    constructor(notebookEditor, editorToolbar, goToMenu, instantiationService) {
        this.notebookEditor = notebookEditor;
        this.editorToolbar = editorToolbar;
        this.goToMenu = goToMenu;
        this.instantiationService = instantiationService;
    }
    actionProvider(action, options) {
        if (action.id === SELECT_KERNEL_ID) {
            return this.instantiationService.createInstance(NotebooKernelActionViewItem, action, this.notebookEditor, options);
        }
        const a = this.editorToolbar.primaryActions.find(a => a.action.id === action.id);
        if (!a || a.renderLabel) {
            if (action instanceof MenuItemAction) {
                return this.instantiationService.createInstance(ActionViewWithLabel, action, {
                    hoverDelegate: options.hoverDelegate
                });
            }
            if (action instanceof SubmenuItemAction && action.item.submenu.id === MenuId.NotebookCellExecuteGoTo.id) {
                return this.instantiationService.createInstance(UnifiedSubmenuActionView, action, {
                    hoverDelegate: options.hoverDelegate
                }, true, {
                    getActions: () => {
                        return this.goToMenu.getActions().find(([group]) => group === "navigation/execute")?.[1] ?? [];
                    }
                }, this.actionProvider.bind(this));
            }
            return undefined;
        } else {
            if (action instanceof MenuItemAction) {
                return this.instantiationService.createInstance(MenuEntryActionViewItem, action, {
                    hoverDelegate: options.hoverDelegate
                });
            }
            if (action instanceof SubmenuItemAction) {
                if (action.item.submenu.id === MenuId.NotebookCellExecuteGoTo.id) {
                    return this.instantiationService.createInstance(UnifiedSubmenuActionView, action, {
                        hoverDelegate: options.hoverDelegate
                    }, false, {
                        getActions: () => {
                            return this.goToMenu.getActions().find(([group]) => group === "navigation/execute")?.[1] ?? [];
                        }
                    }, this.actionProvider.bind(this));
                } else {
                    return this.instantiationService.createInstance(SubmenuEntryActionViewItem, action, {
                        hoverDelegate: options.hoverDelegate
                    });
                }
            }
            return undefined;
        }
    }
    calculateActions(leftToolbarContainerMaxWidth) {
        const initialPrimaryActions = this.editorToolbar.primaryActions;
        const initialSecondaryActions = this.editorToolbar.secondaryActions;
        const actionOutput = workbenchDynamicCalculateActions(
            initialPrimaryActions,
            initialSecondaryActions,
            leftToolbarContainerMaxWidth
        );
        return {
            primaryActions: ( actionOutput.primaryActions.map(a => a.action)),
            secondaryActions: actionOutput.secondaryActions
        };
    }
}
let NotebookEditorWorkbenchToolbar = class NotebookEditorWorkbenchToolbar extends Disposable {
    get primaryActions() {
        return this._primaryActions;
    }
    get secondaryActions() {
        return this._secondaryActions;
    }
    set visible(visible) {
        if (this._visible !== visible) {
            this._visible = visible;
            this._onDidChangeVisibility.fire(visible);
        }
    }
    get useGlobalToolbar() {
        return this._useGlobalToolbar;
    }
    constructor(
        notebookEditor,
        contextKeyService,
        notebookOptions,
        domNode,
        instantiationService,
        configurationService,
        contextMenuService,
        menuService,
        editorService,
        keybindingService
    ) {
        super();
        this.notebookEditor = notebookEditor;
        this.contextKeyService = contextKeyService;
        this.notebookOptions = notebookOptions;
        this.domNode = domNode;
        this.instantiationService = instantiationService;
        this.configurationService = configurationService;
        this.contextMenuService = contextMenuService;
        this.menuService = menuService;
        this.editorService = editorService;
        this.keybindingService = keybindingService;
        this._useGlobalToolbar = false;
        this._renderLabel = RenderLabel.Always;
        this._visible = false;
        this._onDidChangeVisibility = this._register(( new Emitter()));
        this.onDidChangeVisibility = this._onDidChangeVisibility.event;
        this._dimension = null;
        this._primaryActions = [];
        this._secondaryActions = [];
        this._buildBody();
        this._register(
            Event.debounce(this.editorService.onDidActiveEditorChange, (last, _current) => last, 200)(this._updatePerEditorChange, this)
        );
        this._registerNotebookActionsToolbar();
        this._register(addDisposableListener(this.domNode, EventType.CONTEXT_MENU, e => {
            const event = ( new StandardMouseEvent(getWindow(this.domNode), e));
            this.contextMenuService.showContextMenu({
                menuId: MenuId.NotebookToolbarContext,
                getAnchor: () => event,
                menuActionOptions: {
                    renderShortTitle: true
                }
            });
        }));
    }
    _buildBody() {
        this._notebookTopLeftToolbarContainer = createElement("div");
        this._notebookTopLeftToolbarContainer.classList.add("notebook-toolbar-left");
        this._leftToolbarScrollable = ( new DomScrollableElement(this._notebookTopLeftToolbarContainer, {
            vertical: ScrollbarVisibility.Hidden,
            horizontal: ScrollbarVisibility.Visible,
            horizontalScrollbarSize: 3,
            useShadows: false,
            scrollYToX: true
        }));
        this._register(this._leftToolbarScrollable);
        append(this.domNode, this._leftToolbarScrollable.getDomNode());
        this._notebookTopRightToolbarContainer = createElement("div");
        this._notebookTopRightToolbarContainer.classList.add("notebook-toolbar-right");
        append(this.domNode, this._notebookTopRightToolbarContainer);
    }
    _updatePerEditorChange() {
        if (this.editorService.activeEditorPane?.getId() === NOTEBOOK_EDITOR_ID) {
            const notebookEditor = this.editorService.activeEditorPane.getControl();
            if (notebookEditor === this.notebookEditor) {
                this._showNotebookActionsinEditorToolbar();
                return;
            }
        }
    }
    _registerNotebookActionsToolbar() {
        this._notebookGlobalActionsMenu = this._register(this.menuService.createMenu(
            this.notebookEditor.creationOptions.menuIds.notebookToolbar,
            this.contextKeyService
        ));
        this._executeGoToActionsMenu = this._register(
            this.menuService.createMenu(MenuId.NotebookCellExecuteGoTo, this.contextKeyService)
        );
        this._useGlobalToolbar = this.notebookOptions.getDisplayOptions().globalToolbar;
        this._renderLabel = this._convertConfiguration(this.configurationService.getValue(NotebookSetting.globalToolbarShowLabel));
        this._updateStrategy();
        const context = {
            ui: true,
            notebookEditor: this.notebookEditor,
            source: "notebookToolbar"
        };
        const actionProvider = (action, options) => {
            if (action.id === SELECT_KERNEL_ID) {
                return this.instantiationService.createInstance(NotebooKernelActionViewItem, action, this.notebookEditor, options);
            }
            if (this._renderLabel !== RenderLabel.Never) {
                const a = this._primaryActions.find(a => a.action.id === action.id);
                if (a && a.renderLabel) {
                    return action instanceof MenuItemAction ? this.instantiationService.createInstance(ActionViewWithLabel, action, {
                        hoverDelegate: options.hoverDelegate
                    }) : undefined;
                } else {
                    return action instanceof MenuItemAction ? this.instantiationService.createInstance(MenuEntryActionViewItem, action, {
                        hoverDelegate: options.hoverDelegate
                    }) : undefined;
                }
            } else {
                return action instanceof MenuItemAction ? this.instantiationService.createInstance(MenuEntryActionViewItem, action, {
                    hoverDelegate: options.hoverDelegate
                }) : undefined;
            }
        };
        const hoverDelegate = this._register(
            this.instantiationService.createInstance(WorkbenchHoverDelegate, "element", {
                instantHover: true
            }, {})
        );
        hoverDelegate.setInstantHoverTimeLimit(600);
        const leftToolbarOptions = {
            hiddenItemStrategy: HiddenItemStrategy.RenderInSecondaryGroup,
            resetMenu: MenuId.NotebookToolbar,
            actionViewItemProvider: (action, options) => {
                return this._strategy.actionProvider(action, options);
            },
            getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id),
            renderDropdownAsChildElement: true,
            hoverDelegate
        };
        this._notebookLeftToolbar = this.instantiationService.createInstance(
            WorkbenchToolBar,
            this._notebookTopLeftToolbarContainer,
            leftToolbarOptions
        );
        this._register(this._notebookLeftToolbar);
        this._notebookLeftToolbar.context = context;
        this._notebookRightToolbar = ( new ToolBar(this._notebookTopRightToolbarContainer, this.contextMenuService, {
            getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id),
            actionViewItemProvider: actionProvider,
            renderDropdownAsChildElement: true,
            hoverDelegate
        }));
        this._register(this._notebookRightToolbar);
        this._notebookRightToolbar.context = context;
        this._showNotebookActionsinEditorToolbar();
        let dropdownIsVisible = false;
        let deferredUpdate;
        this._register(this._notebookGlobalActionsMenu.onDidChange(() => {
            if (dropdownIsVisible) {
                deferredUpdate = () => this._showNotebookActionsinEditorToolbar();
                return;
            }
            if (this.notebookEditor.isVisible) {
                this._showNotebookActionsinEditorToolbar();
            }
        }));
        this._register(this._notebookLeftToolbar.onDidChangeDropdownVisibility(visible => {
            dropdownIsVisible = visible;
            if (deferredUpdate && !visible) {
                setTimeout(() => {
                    deferredUpdate?.();
                }, 0);
                deferredUpdate = undefined;
            }
        }));
        this._register(this.notebookOptions.onDidChangeOptions(e => {
            if (e.globalToolbar !== undefined) {
                this._useGlobalToolbar = this.notebookOptions.getDisplayOptions().globalToolbar;
                this._showNotebookActionsinEditorToolbar();
            }
        }));
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(NotebookSetting.globalToolbarShowLabel)) {
                this._renderLabel = this._convertConfiguration(this.configurationService.getValue(NotebookSetting.globalToolbarShowLabel));
                this._updateStrategy();
                const oldElement = this._notebookLeftToolbar.getElement();
                oldElement.remove();
                this._notebookLeftToolbar.dispose();
                this._notebookLeftToolbar = this.instantiationService.createInstance(
                    WorkbenchToolBar,
                    this._notebookTopLeftToolbarContainer,
                    leftToolbarOptions
                );
                this._register(this._notebookLeftToolbar);
                this._notebookLeftToolbar.context = context;
                this._showNotebookActionsinEditorToolbar();
                return;
            }
        }));
    }
    _updateStrategy() {
        switch (this._renderLabel) {
        case RenderLabel.Always:
            this._strategy = ( new WorkbenchAlwaysLabelStrategy(
                this.notebookEditor,
                this,
                this._executeGoToActionsMenu,
                this.instantiationService
            ));
            break;
        case RenderLabel.Never:
            this._strategy = ( new WorkbenchNeverLabelStrategy(
                this.notebookEditor,
                this,
                this._executeGoToActionsMenu,
                this.instantiationService
            ));
            break;
        case RenderLabel.Dynamic:
            this._strategy = ( new WorkbenchDynamicLabelStrategy(
                this.notebookEditor,
                this,
                this._executeGoToActionsMenu,
                this.instantiationService
            ));
            break;
        }
    }
    _convertConfiguration(value) {
        switch (value) {
        case true:
            return RenderLabel.Always;
        case false:
            return RenderLabel.Never;
        case "always":
            return RenderLabel.Always;
        case "never":
            return RenderLabel.Never;
        case "dynamic":
            return RenderLabel.Dynamic;
        }
    }
    _showNotebookActionsinEditorToolbar() {
        if (!this.notebookEditor.hasModel()) {
            this._deferredActionUpdate?.dispose();
            this._deferredActionUpdate = undefined;
            this.visible = false;
            return;
        }
        if (this._deferredActionUpdate) {
            return;
        }
        if (!this._useGlobalToolbar) {
            this.domNode.style.display = "none";
            this._deferredActionUpdate = undefined;
            this.visible = false;
        } else {
            this._deferredActionUpdate = disposableTimeout(async () => {
                await this._setNotebookActions();
                this.visible = true;
                this._deferredActionUpdate?.dispose();
                this._deferredActionUpdate = undefined;
            }, 50);
        }
    }
    async _setNotebookActions() {
        const groups = this._notebookGlobalActionsMenu.getActions({
            shouldForwardArgs: true,
            renderShortTitle: true
        });
        this.domNode.style.display = "flex";
        const primaryLeftGroups = groups.filter(group => /^navigation/.test(group[0]));
        const primaryActions = [];
        primaryLeftGroups.sort((a, b) => {
            if (a[0] === "navigation") {
                return 1;
            }
            if (b[0] === "navigation") {
                return -1;
            }
            return 0;
        }).forEach((group, index) => {
            primaryActions.push(...group[1]);
            if (index < primaryLeftGroups.length - 1) {
                primaryActions.push(( new Separator()));
            }
        });
        const primaryRightGroup = groups.find(group => /^status/.test(group[0]));
        const primaryRightActions = primaryRightGroup ? primaryRightGroup[1] : [];
        const secondaryActions = groups.filter(group => !/^navigation/.test(group[0]) && !/^status/.test(group[0])).reduce((prev, curr) => {
            prev.push(...curr[1]);
            return prev;
        }, []);
        this._notebookLeftToolbar.setActions([], []);
        this._primaryActions = ( primaryActions.map(action => ({
            action: action,
            size: (action instanceof Separator ? 1 : 0),
            renderLabel: true,
            visible: true
        })));
        this._notebookLeftToolbar.setActions(primaryActions, secondaryActions);
        this._secondaryActions = secondaryActions;
        this._notebookRightToolbar.setActions(primaryRightActions, []);
        this._secondaryActions = secondaryActions;
        if (this._dimension && this._dimension.width >= 0 && this._dimension.height >= 0) {
            this._cacheItemSizes(this._notebookLeftToolbar);
        }
        this._computeSizes();
    }
    _cacheItemSizes(toolbar) {
        for (let i = 0; i < toolbar.getItemsLength(); i++) {
            const action = toolbar.getItemAction(i);
            if (action && action.id !== "toolbar.toggle.more") {
                const existing = this._primaryActions.find(a => a.action.id === action.id);
                if (existing) {
                    existing.size = toolbar.getItemWidth(i);
                }
            }
        }
    }
    _computeSizes() {
        const toolbar = this._notebookLeftToolbar;
        const rightToolbar = this._notebookRightToolbar;
        if (toolbar && rightToolbar && this._dimension && this._dimension.height >= 0 && this._dimension.width >= 0) {
            if (this._primaryActions.length === 0 && toolbar.getItemsLength() !== this._primaryActions.length) {
                this._cacheItemSizes(this._notebookLeftToolbar);
            }
            if (this._primaryActions.length === 0) {
                return;
            }
            const kernelWidth = (rightToolbar.getItemsLength() ? rightToolbar.getItemWidth(0) : 0) + ACTION_PADDING;
            const leftToolbarContainerMaxWidth = this._dimension.width - kernelWidth - (ACTION_PADDING + TOGGLE_MORE_ACTION_WIDTH) - ACTION_PADDING - ACTION_PADDING;
            const calculatedActions = this._strategy.calculateActions(leftToolbarContainerMaxWidth);
            this._notebookLeftToolbar.setActions(calculatedActions.primaryActions, calculatedActions.secondaryActions);
        }
    }
    layout(dimension) {
        this._dimension = dimension;
        if (!this._useGlobalToolbar) {
            this.domNode.style.display = "none";
        } else {
            this.domNode.style.display = "flex";
        }
        this._computeSizes();
    }
    dispose() {
        this._notebookLeftToolbar.context = undefined;
        this._notebookRightToolbar.context = undefined;
        this._notebookLeftToolbar.dispose();
        this._notebookRightToolbar.dispose();
        this._notebookLeftToolbar = null;
        this._notebookRightToolbar = null;
        this._deferredActionUpdate?.dispose();
        this._deferredActionUpdate = undefined;
        super.dispose();
    }
};
NotebookEditorWorkbenchToolbar = ( __decorate([( __param(4, IInstantiationService)), ( __param(5, IConfigurationService)), ( __param(6, IContextMenuService)), ( __param(7, IMenuService)), ( __param(8, IEditorService)), ( __param(9, IKeybindingService))], NotebookEditorWorkbenchToolbar));
function workbenchCalculateActions(
    initialPrimaryActions,
    initialSecondaryActions,
    leftToolbarContainerMaxWidth
) {
    return actionOverflowHelper(
        initialPrimaryActions,
        initialSecondaryActions,
        leftToolbarContainerMaxWidth,
        false
    );
}
function workbenchDynamicCalculateActions(
    initialPrimaryActions,
    initialSecondaryActions,
    leftToolbarContainerMaxWidth
) {
    if (initialPrimaryActions.length === 0) {
        return {
            primaryActions: [],
            secondaryActions: initialSecondaryActions
        };
    }
    const visibleActionLength = initialPrimaryActions.filter(action => action.size !== 0).length;
    const totalWidthWithLabels = ( initialPrimaryActions.map(action => action.size)).reduce((a, b) => a + b, 0) + (visibleActionLength - 1) * ACTION_PADDING;
    if (totalWidthWithLabels <= leftToolbarContainerMaxWidth) {
        initialPrimaryActions.forEach(action => {
            action.renderLabel = true;
        });
        return actionOverflowHelper(
            initialPrimaryActions,
            initialSecondaryActions,
            leftToolbarContainerMaxWidth,
            false
        );
    }
    if ((visibleActionLength * ICON_ONLY_ACTION_WIDTH + (visibleActionLength - 1) * ACTION_PADDING) > leftToolbarContainerMaxWidth) {
        initialPrimaryActions.forEach(action => {
            action.renderLabel = false;
        });
        return actionOverflowHelper(
            initialPrimaryActions,
            initialSecondaryActions,
            leftToolbarContainerMaxWidth,
            true
        );
    }
    let sum = 0;
    let lastActionWithLabel = -1;
    for (let i = 0; i < initialPrimaryActions.length; i++) {
        sum += initialPrimaryActions[i].size + ACTION_PADDING;
        if (initialPrimaryActions[i].action instanceof Separator) {
            const remainingItems = initialPrimaryActions.slice(i + 1).filter(action => action.size !== 0);
            const newTotalSum = sum + (remainingItems.length === 0 ? 0 : (remainingItems.length * ICON_ONLY_ACTION_WIDTH + (remainingItems.length - 1) * ACTION_PADDING));
            if (newTotalSum <= leftToolbarContainerMaxWidth) {
                lastActionWithLabel = i;
            }
        } else {
            continue;
        }
    }
    if (lastActionWithLabel < 0) {
        initialPrimaryActions.forEach(action => {
            action.renderLabel = false;
        });
        return actionOverflowHelper(
            initialPrimaryActions,
            initialSecondaryActions,
            leftToolbarContainerMaxWidth,
            true
        );
    }
    initialPrimaryActions.slice(0, lastActionWithLabel + 1).forEach(action => {
        action.renderLabel = true;
    });
    initialPrimaryActions.slice(lastActionWithLabel + 1).forEach(action => {
        action.renderLabel = false;
    });
    return {
        primaryActions: initialPrimaryActions,
        secondaryActions: initialSecondaryActions
    };
}
function actionOverflowHelper(
    initialPrimaryActions,
    initialSecondaryActions,
    leftToolbarContainerMaxWidth,
    iconOnly
) {
    const renderActions = [];
    const overflow = [];
    let currentSize = 0;
    let nonZeroAction = false;
    let containerFull = false;
    if (initialPrimaryActions.length === 0) {
        return {
            primaryActions: [],
            secondaryActions: initialSecondaryActions
        };
    }
    for (let i = 0; i < initialPrimaryActions.length; i++) {
        const actionModel = initialPrimaryActions[i];
        const itemSize = iconOnly ? (actionModel.size === 0 ? 0 : ICON_ONLY_ACTION_WIDTH) : actionModel.size;
        if (actionModel.action instanceof Separator && renderActions.length > 0 && renderActions[renderActions.length - 1].action instanceof Separator) {
            continue;
        }
        if (actionModel.action instanceof Separator && !nonZeroAction) {
            continue;
        }
        if (currentSize + itemSize <= leftToolbarContainerMaxWidth && !containerFull) {
            currentSize += ACTION_PADDING + itemSize;
            renderActions.push(actionModel);
            if (itemSize !== 0) {
                nonZeroAction = true;
            }
            if (actionModel.action instanceof Separator) {
                nonZeroAction = false;
            }
        } else {
            containerFull = true;
            if (itemSize === 0) {
                renderActions.push(actionModel);
            } else {
                if (actionModel.action instanceof Separator) {
                    continue;
                }
                overflow.push(actionModel.action);
            }
        }
    }
    for (let i = (renderActions.length - 1); i > 0; i--) {
        const temp = renderActions[i];
        if (temp.size === 0) {
            continue;
        }
        if (temp.action instanceof Separator) {
            renderActions.splice(i, 1);
        }
        break;
    }
    if (renderActions.length && renderActions[renderActions.length - 1].action instanceof Separator) {
        renderActions.pop();
    }
    if (overflow.length !== 0) {
        overflow.push(( new Separator()));
    }
    if (iconOnly) {
        const markdownIndex = renderActions.findIndex(a => a.action.id === "notebook.cell.insertMarkdownCellBelow");
        if (markdownIndex !== -1) {
            renderActions.splice(markdownIndex, 1);
        }
    }
    return {
        primaryActions: renderActions,
        secondaryActions: [...overflow, ...initialSecondaryActions]
    };
}

export { NotebookEditorWorkbenchToolbar, RenderLabel, workbenchCalculateActions, workbenchDynamicCalculateActions };
