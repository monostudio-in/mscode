
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { Separator } from '../../../../base/common/actions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { isMacintosh } from '../../../../base/common/platform.js';
import { MouseTargetType } from '../../../../editor/browser/editorBrowser.js';
import { registerEditorContribution, EditorContributionInstantiation } from '../../../../editor/browser/editorExtensions.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { IMenuService } from '../../../../platform/actions/common/actions.service.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.service.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.service.js';
import { TextEditorSelectionSource } from '../../../../platform/editor/common/editor.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Registry } from '../../../../platform/registry/common/platform.js';

class GutterActionsRegistryImpl {
    constructor() {
        this._registeredGutterActionsGenerators = ( new Set());
    }
    registerGutterActionsGenerator(gutterActionsGenerator) {
        this._registeredGutterActionsGenerators.add(gutterActionsGenerator);
        return {
            dispose: () => {
                this._registeredGutterActionsGenerators.delete(gutterActionsGenerator);
            }
        };
    }
    getGutterActionsGenerators() {
        return Array.from(( this._registeredGutterActionsGenerators.values()));
    }
}
Registry.add("gutterActionsRegistry", ( new GutterActionsRegistryImpl()));
const GutterActionsRegistry = ( Registry.as("gutterActionsRegistry"));
let EditorLineNumberContextMenu = class EditorLineNumberContextMenu extends Disposable {
    static {
        this.ID = "workbench.contrib.editorLineNumberContextMenu";
    }
    constructor(
        editor,
        contextMenuService,
        menuService,
        contextKeyService,
        instantiationService
    ) {
        super();
        this.editor = editor;
        this.contextMenuService = contextMenuService;
        this.menuService = menuService;
        this.contextKeyService = contextKeyService;
        this.instantiationService = instantiationService;
        this._register(this.editor.onMouseDown(e => this.doShow(e, false)));
    }
    show(e) {
        this.doShow(e, true);
    }
    doShow(e, force) {
        const model = this.editor.getModel();
        if (!e.event.rightButton && !(isMacintosh && e.event.leftButton && e.event.ctrlKey) && !force || e.target.type !== MouseTargetType.GUTTER_LINE_NUMBERS && e.target.type !== MouseTargetType.GUTTER_GLYPH_MARGIN || !e.target.position || !model) {
            return;
        }
        const lineNumber = e.target.position.lineNumber;
        const contextKeyService = this.contextKeyService.createOverlay([["editorLineNumber", lineNumber]]);
        const menu = this.menuService.createMenu(MenuId.EditorLineNumberContext, contextKeyService);
        const allActions = [];
        this.instantiationService.invokeFunction(accessor => {
            for (const generator of GutterActionsRegistry.getGutterActionsGenerators()) {
                const collectedActions = ( new Map());
                generator({
                    lineNumber,
                    editor: this.editor,
                    accessor
                }, {
                    push: (action, group = "navigation") => {
                        const actions = (collectedActions.get(group) ?? []);
                        actions.push(action);
                        collectedActions.set(group, actions);
                    }
                });
                for (const [group, actions] of collectedActions.entries()) {
                    allActions.push([group, actions]);
                }
            }
            allActions.sort((a, b) => a[0].localeCompare(b[0]));
            const menuActions = menu.getActions({
                arg: {
                    lineNumber,
                    uri: model.uri
                },
                shouldForwardArgs: true
            });
            allActions.push(...menuActions);
            if (e.target.type === MouseTargetType.GUTTER_LINE_NUMBERS) {
                const currentSelections = this.editor.getSelections();
                const lineRange = {
                    startLineNumber: lineNumber,
                    endLineNumber: lineNumber,
                    startColumn: 1,
                    endColumn: model.getLineLength(lineNumber) + 1
                };
                const containsSelection = currentSelections?.some(
                    selection => !selection.isEmpty() && selection.intersectRanges(lineRange) !== null
                );
                if (!containsSelection) {
                    this.editor.setSelection(lineRange, TextEditorSelectionSource.PROGRAMMATIC);
                }
            }
            this.contextMenuService.showContextMenu({
                getAnchor: () => e.event,
                getActions: () => Separator.join(...( allActions.map(a => a[1]))),
                onHide: () => menu.dispose()
            });
        });
    }
};
EditorLineNumberContextMenu = ( __decorate([( __param(1, IContextMenuService)), ( __param(2, IMenuService)), ( __param(3, IContextKeyService)), ( __param(4, IInstantiationService))], EditorLineNumberContextMenu));
registerEditorContribution(
    EditorLineNumberContextMenu.ID,
    EditorLineNumberContextMenu,
    EditorContributionInstantiation.AfterFirstRender
);

export { EditorLineNumberContextMenu, GutterActionsRegistry, GutterActionsRegistryImpl };
