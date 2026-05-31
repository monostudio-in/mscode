
import { __decorate, __param } from '../../../../../../../../external/tslib/tslib.es6.js';
import { $, clearNode } from '../../../../../base/browser/dom.js';
import { Disposable, MutableDisposable, DisposableStore } from '../../../../../base/common/lifecycle.js';
import { MenuWorkbenchToolBar, HiddenItemStrategy } from '../../../../../platform/actions/browser/toolbar.js';
import { MenuItemAction } from '../../../../../platform/actions/common/actions.js';
import { IMenuService } from '../../../../../platform/actions/common/actions.service.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.service.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { CodiconActionViewItem } from '../view/cellParts/cellActionView.js';

let ListTopCellToolbar = class ListTopCellToolbar extends Disposable {
    constructor(
        notebookEditor,
        notebookOptions,
        instantiationService,
        contextMenuService,
        menuService
    ) {
        super();
        this.notebookEditor = notebookEditor;
        this.notebookOptions = notebookOptions;
        this.instantiationService = instantiationService;
        this.contextMenuService = contextMenuService;
        this.menuService = menuService;
        this.viewZone = this._register(( new MutableDisposable()));
        this._modelDisposables = this._register(( new DisposableStore()));
        this.topCellToolbarContainer = $("div");
        this.topCellToolbar = $(".cell-list-top-cell-toolbar-container");
        this.topCellToolbarContainer.appendChild(this.topCellToolbar);
        this._register(this.notebookEditor.onDidAttachViewModel(() => {
            this.updateTopToolbar();
        }));
        this._register(this.notebookOptions.onDidChangeOptions(e => {
            if (e.insertToolbarAlignment || e.insertToolbarPosition || e.cellToolbarLocation) {
                this.updateTopToolbar();
            }
        }));
    }
    updateTopToolbar() {
        const layoutInfo = this.notebookOptions.getLayoutConfiguration();
        this.viewZone.value = ( new DisposableStore());
        if (layoutInfo.insertToolbarPosition === "hidden" || layoutInfo.insertToolbarPosition === "notebookToolbar") {
            const height = this.notebookOptions.computeTopInsertToolbarHeight(this.notebookEditor.textModel?.viewType);
            if (height !== 0) {
                this.notebookEditor.changeViewZones(accessor => {
                    const id = accessor.addZone({
                        afterModelPosition: 0,
                        heightInPx: height,
                        domNode: $("div")
                    });
                    accessor.layoutZone(id);
                    this.viewZone.value?.add({
                        dispose: () => {
                            if (!this.notebookEditor.isDisposed) {
                                this.notebookEditor.changeViewZones(accessor => {
                                    accessor.removeZone(id);
                                });
                            }
                        }
                    });
                });
            }
            return;
        }
        this.notebookEditor.changeViewZones(accessor => {
            const height = this.notebookOptions.computeTopInsertToolbarHeight(this.notebookEditor.textModel?.viewType);
            const id = accessor.addZone({
                afterModelPosition: 0,
                heightInPx: height,
                domNode: this.topCellToolbarContainer
            });
            accessor.layoutZone(id);
            this.viewZone.value?.add({
                dispose: () => {
                    if (!this.notebookEditor.isDisposed) {
                        this.notebookEditor.changeViewZones(accessor => {
                            accessor.removeZone(id);
                        });
                    }
                }
            });
            clearNode(this.topCellToolbar);
            const toolbar = this.instantiationService.createInstance(
                MenuWorkbenchToolBar,
                this.topCellToolbar,
                this.notebookEditor.creationOptions.menuIds.cellTopInsertToolbar,
                {
                    actionViewItemProvider: (action, options) => {
                        if (action instanceof MenuItemAction) {
                            const item = this.instantiationService.createInstance(CodiconActionViewItem, action, {
                                hoverDelegate: options.hoverDelegate
                            });
                            return item;
                        }
                        return undefined;
                    },
                    menuOptions: {
                        shouldForwardArgs: true
                    },
                    toolbarOptions: {
                        primaryGroup: g => /^inline/.test(g)
                    },
                    hiddenItemStrategy: HiddenItemStrategy.Ignore
                }
            );
            if (this.notebookEditor.hasModel()) {
                toolbar.context = {
                    notebookEditor: this.notebookEditor
                };
            }
            this.viewZone.value?.add(toolbar);
            this.viewZone.value?.add(this.notebookEditor.onDidChangeModel(() => {
                this._modelDisposables.clear();
                if (this.notebookEditor.hasModel()) {
                    this._modelDisposables.add(this.notebookEditor.onDidChangeViewCells(() => {
                        this.updateClass();
                    }));
                    this.updateClass();
                }
            }));
            this.updateClass();
        });
    }
    updateClass() {
        if (this.notebookEditor.hasModel() && this.notebookEditor.getLength() === 0) {
            this.topCellToolbar.classList.add("emptyNotebook");
        } else {
            this.topCellToolbar.classList.remove("emptyNotebook");
        }
    }
};
ListTopCellToolbar = ( __decorate([( __param(2, IInstantiationService)), ( __param(3, IContextMenuService)), ( __param(4, IMenuService))], ListTopCellToolbar));

export { ListTopCellToolbar };
