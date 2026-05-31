
import { GroupsOrder, preferredSideBySideGroupDirection } from './editorGroupsService.js';
import { ACTIVE_GROUP, SIDE_GROUP, AUX_WINDOW_GROUP, MODAL_GROUP } from './editorService.js';

function columnToEditorGroup(editorGroupService, configurationService, column = ACTIVE_GROUP) {
    if (column === ACTIVE_GROUP || column === SIDE_GROUP || column === AUX_WINDOW_GROUP || column === MODAL_GROUP) {
        return column;
    }
    let groupInColumn = editorGroupService.getGroups(GroupsOrder.GRID_APPEARANCE)[column];
    if (!groupInColumn && column < 9) {
        for (let i = 0; i <= column; i++) {
            const editorGroups = editorGroupService.getGroups(GroupsOrder.GRID_APPEARANCE);
            if (!editorGroups[i]) {
                editorGroupService.addGroup(editorGroups[i - 1], preferredSideBySideGroupDirection(configurationService));
            }
        }
        groupInColumn = editorGroupService.getGroups(GroupsOrder.GRID_APPEARANCE)[column];
    }
    return groupInColumn?.id ?? SIDE_GROUP;
}
function editorGroupToColumn(editorGroupService, editorGroup) {
    const group = (typeof editorGroup === 'number') ? editorGroupService.getGroup(editorGroup) : editorGroup;
    return editorGroupService.getGroups(GroupsOrder.GRID_APPEARANCE).indexOf(group ?? editorGroupService.activeGroup);
}

export { columnToEditorGroup, editorGroupToColumn };
