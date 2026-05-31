
import { getDomNodePagePosition } from '../../../../base/browser/dom.js';
import { Action, Separator } from '../../../../base/common/actions.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { EditorOption } from '../../../common/config/editorOptions.js';
import { Range } from '../../../common/core/range.js';
import { ITextModelService } from '../../../common/services/resolverService.service.js';
import { SymbolNavigationAction, SymbolNavigationAnchor, DefinitionAction } from '../../gotoSymbol/browser/goToCommands.js';
import { PeekContext } from '../../peekView/browser/peekView.js';
import { MenuRegistry, MenuId, isIMenuItem, MenuItemAction } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.service.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.service.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.service.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import '../../../../platform/notification/common/notification.js';
import { INotificationService } from '../../../../platform/notification/common/notification.service.js';
import Severity$1 from '../../../../base/common/severity.js';

async function showGoToContextMenu(accessor, editor, anchor, part) {
    const resolverService = accessor.get(ITextModelService);
    const contextMenuService = accessor.get(IContextMenuService);
    const commandService = accessor.get(ICommandService);
    const instaService = accessor.get(IInstantiationService);
    const notificationService = accessor.get(INotificationService);
    await part.item.resolve(CancellationToken.None);
    if (!part.part.location) {
        return;
    }
    const location = part.part.location;
    const menuActions = [];
    const filter = ( new Set(( MenuRegistry.getMenuItems(MenuId.EditorContext).map(item => isIMenuItem(item) ? item.command.id : generateUuid()))));
    for (const delegate of SymbolNavigationAction.all()) {
        if (( filter.has(delegate.desc.id))) {
            menuActions.push(( new Action(delegate.desc.id, MenuItemAction.label(delegate.desc, {
                renderShortTitle: true
            }), undefined, true, async () => {
                const ref = await resolverService.createModelReference(location.uri);
                try {
                    const symbolAnchor = ( new SymbolNavigationAnchor(ref.object.textEditorModel, Range.getStartPosition(location.range)));
                    const range = part.item.anchor.range;
                    await instaService.invokeFunction(delegate.runEditorCommand.bind(delegate), editor, symbolAnchor, range);
                } finally {
                    ref.dispose();
                }
            })));
        }
    }
    if (part.part.command) {
        const {
            command
        } = part.part;
        menuActions.push(( new Separator()));
        menuActions.push(( new Action(command.id, command.title, undefined, true, async () => {
            try {
                await commandService.executeCommand(command.id, ...(command.arguments ?? []));
            } catch (err) {
                notificationService.notify({
                    severity: Severity$1.Error,
                    source: part.item.provider.displayName,
                    message: err
                });
            }
        })));
    }
    const useShadowDOM = editor.getOption(EditorOption.useShadowDOM);
    contextMenuService.showContextMenu({
        domForShadowRoot: useShadowDOM ? editor.getDomNode() ?? undefined : undefined,
        getAnchor: () => {
            const box = getDomNodePagePosition(anchor);
            return {
                x: box.left,
                y: box.top + box.height + 8
            };
        },
        getActions: () => menuActions,
        onHide: () => {
            editor.focus();
        },
        autoSelectFirstItem: true
    });
}
async function goToDefinitionWithLocation(accessor, event, editor, location) {
    const resolverService = accessor.get(ITextModelService);
    const ref = await resolverService.createModelReference(location.uri);
    await editor.invokeWithinContext(async accessor => {
        const openToSide = event.hasSideBySideModifier;
        const contextKeyService = accessor.get(IContextKeyService);
        const isInPeek = PeekContext.inPeekEditor.getValue(contextKeyService);
        const canPeek = !openToSide && editor.getOption(EditorOption.definitionLinkOpensInPeek) && !isInPeek;
        const action = ( new DefinitionAction({
            openToSide,
            openInPeek: canPeek,
            muteMessage: true
        }, {
            title: {
                value: "",
                original: ""
            },
            id: "",
            precondition: undefined
        }));
        return action.run(accessor, ( new SymbolNavigationAnchor(ref.object.textEditorModel, Range.getStartPosition(location.range))), Range.lift(location.range));
    });
    ref.dispose();
}

export { goToDefinitionWithLocation, showGoToContextMenu };
