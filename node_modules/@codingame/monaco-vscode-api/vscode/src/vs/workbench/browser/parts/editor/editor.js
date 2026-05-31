
import { Dimension } from '../../../../base/browser/dom.js';
import { isObject } from '../../../../base/common/types.js';
import { verifyObject, ObjectVerifier, BooleanVerifier, NumberVerifier, SetVerifier, EnumVerifier } from '../../../../base/common/verifier.js';
import { coalesce } from '../../../../base/common/arrays.js';

const DEFAULT_EDITOR_MIN_DIMENSIONS = ( new Dimension(220, 70));
const DEFAULT_EDITOR_MAX_DIMENSIONS = ( new Dimension(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY));
const DEFAULT_EDITOR_PART_OPTIONS = {
    showTabs: "multiple",
    highlightModifiedTabs: false,
    tabActionLocation: "right",
    tabActionCloseVisibility: true,
    tabActionUnpinVisibility: true,
    showTabIndex: false,
    alwaysShowEditorActions: false,
    tabSizing: "fit",
    tabSizingFixedMinWidth: 50,
    tabSizingFixedMaxWidth: 160,
    pinnedTabSizing: "normal",
    pinnedTabsOnSeparateRow: false,
    tabHeight: "default",
    preventPinnedEditorClose: "keyboardAndMouse",
    titleScrollbarSizing: "default",
    titleScrollbarVisibility: "auto",
    focusRecentEditorAfterClose: true,
    showIcons: true,
    hasIcons: true,
    enablePreview: true,
    openPositioning: "right",
    openSideBySideDirection: "right",
    closeEmptyGroups: true,
    labelFormat: "default",
    splitSizing: "auto",
    splitOnDragAndDrop: true,
    allowDropIntoGroup: true,
    dragToOpenWindow: true,
    centeredLayoutFixedWidth: false,
    doubleClickTabToToggleEditorGroupSizes: "expand",
    editorActionsLocation: "default",
    wrapTabs: false,
    enablePreviewFromQuickOpen: false,
    scrollToSwitchTabs: false,
    enablePreviewFromCodeNavigation: false,
    closeOnFileDelete: false,
    swipeToNavigate: false,
    mouseBackForwardToNavigate: true,
    restoreViewState: true,
    splitInGroupLayout: "horizontal",
    revealIfOpen: false,
    get limit() {
        return {
            enabled: false,
            value: 10,
            perEditorGroup: false,
            excludeDirty: false
        };
    },
    get decorations() {
        return {
            badges: true,
            colors: true
        };
    },
    get autoLockGroups() {
        return ( new Set());
    }
};
function impactsEditorPartOptions(event) {
    return event.affectsConfiguration("workbench.editor") || event.affectsConfiguration("workbench.iconTheme") || event.affectsConfiguration("window.density");
}
function getEditorPartOptions(configurationService, themeService) {
    const options = {
        ...DEFAULT_EDITOR_PART_OPTIONS,
        hasIcons: themeService.getFileIconTheme().hasFileIcons
    };
    const config = configurationService.getValue();
    if (config?.workbench?.editor) {
        Object.assign(options, config.workbench.editor);
        if (isObject(config.workbench.editor.autoLockGroups)) {
            options.autoLockGroups = DEFAULT_EDITOR_PART_OPTIONS.autoLockGroups;
            for (const [editorId, enablement] of Object.entries(config.workbench.editor.autoLockGroups)) {
                if (enablement === true) {
                    options.autoLockGroups.add(editorId);
                }
            }
        } else {
            options.autoLockGroups = DEFAULT_EDITOR_PART_OPTIONS.autoLockGroups;
        }
    }
    const windowConfig = configurationService.getValue();
    if (windowConfig?.window?.density?.editorTabHeight) {
        options.tabHeight = windowConfig.window.density.editorTabHeight;
    }
    return validateEditorPartOptions(options);
}
function validateEditorPartOptions(options) {
    if (typeof options.showTabs === "boolean") {
        options.showTabs = options.showTabs ? "multiple" : "single";
    }
    return verifyObject({
        "wrapTabs": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["wrapTabs"])),
        "scrollToSwitchTabs": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["scrollToSwitchTabs"])),
        "highlightModifiedTabs": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["highlightModifiedTabs"])),
        "tabActionCloseVisibility": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["tabActionCloseVisibility"])),
        "tabActionUnpinVisibility": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["tabActionUnpinVisibility"])),
        "showTabIndex": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["showTabIndex"])),
        "alwaysShowEditorActions": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["alwaysShowEditorActions"])),
        "pinnedTabsOnSeparateRow": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["pinnedTabsOnSeparateRow"])),
        "focusRecentEditorAfterClose": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["focusRecentEditorAfterClose"])),
        "showIcons": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["showIcons"])),
        "enablePreview": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["enablePreview"])),
        "enablePreviewFromQuickOpen": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["enablePreviewFromQuickOpen"])),
        "enablePreviewFromCodeNavigation": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["enablePreviewFromCodeNavigation"])),
        "closeOnFileDelete": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["closeOnFileDelete"])),
        "closeEmptyGroups": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["closeEmptyGroups"])),
        "revealIfOpen": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["revealIfOpen"])),
        "swipeToNavigate": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["swipeToNavigate"])),
        "mouseBackForwardToNavigate": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["mouseBackForwardToNavigate"])),
        "restoreViewState": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["restoreViewState"])),
        "splitOnDragAndDrop": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["splitOnDragAndDrop"])),
        "allowDropIntoGroup": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["allowDropIntoGroup"])),
        "dragToOpenWindow": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["dragToOpenWindow"])),
        "centeredLayoutFixedWidth": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["centeredLayoutFixedWidth"])),
        "hasIcons": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["hasIcons"])),
        "tabSizingFixedMinWidth": ( new NumberVerifier(DEFAULT_EDITOR_PART_OPTIONS["tabSizingFixedMinWidth"])),
        "tabSizingFixedMaxWidth": ( new NumberVerifier(DEFAULT_EDITOR_PART_OPTIONS["tabSizingFixedMaxWidth"])),
        "showTabs": ( new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["showTabs"], ["multiple", "single", "none"])),
        "tabActionLocation": ( new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["tabActionLocation"], ["left", "right"])),
        "tabSizing": ( new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["tabSizing"], ["fit", "shrink", "fixed"])),
        "pinnedTabSizing": ( new EnumVerifier(
            DEFAULT_EDITOR_PART_OPTIONS["pinnedTabSizing"],
            ["normal", "compact", "shrink"]
        )),
        "tabHeight": ( new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["tabHeight"], ["default", "compact"])),
        "preventPinnedEditorClose": ( new EnumVerifier(
            DEFAULT_EDITOR_PART_OPTIONS["preventPinnedEditorClose"],
            ["keyboardAndMouse", "keyboard", "mouse", "never"]
        )),
        "titleScrollbarSizing": ( new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["titleScrollbarSizing"], ["default", "large"])),
        "titleScrollbarVisibility": ( new EnumVerifier(
            DEFAULT_EDITOR_PART_OPTIONS["titleScrollbarVisibility"],
            ["auto", "visible", "hidden"]
        )),
        "openPositioning": ( new EnumVerifier(
            DEFAULT_EDITOR_PART_OPTIONS["openPositioning"],
            ["left", "right", "first", "last"]
        )),
        "openSideBySideDirection": ( new EnumVerifier(DEFAULT_EDITOR_PART_OPTIONS["openSideBySideDirection"], ["right", "down"])),
        "labelFormat": ( new EnumVerifier(
            DEFAULT_EDITOR_PART_OPTIONS["labelFormat"],
            ["default", "short", "medium", "long"]
        )),
        "splitInGroupLayout": ( new EnumVerifier(
            DEFAULT_EDITOR_PART_OPTIONS["splitInGroupLayout"],
            ["vertical", "horizontal"]
        )),
        "splitSizing": ( new EnumVerifier(
            DEFAULT_EDITOR_PART_OPTIONS["splitSizing"],
            ["distribute", "split", "auto"]
        )),
        "doubleClickTabToToggleEditorGroupSizes": ( new EnumVerifier(
            DEFAULT_EDITOR_PART_OPTIONS["doubleClickTabToToggleEditorGroupSizes"],
            ["maximize", "expand", "off"]
        )),
        "editorActionsLocation": ( new EnumVerifier(
            DEFAULT_EDITOR_PART_OPTIONS["editorActionsLocation"],
            ["default", "titleBar", "hidden"]
        )),
        "autoLockGroups": ( new SetVerifier(DEFAULT_EDITOR_PART_OPTIONS["autoLockGroups"])),
        "limit": ( new ObjectVerifier(DEFAULT_EDITOR_PART_OPTIONS["limit"], {
            "enabled": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["limit"]["enabled"])),
            "value": ( new NumberVerifier(DEFAULT_EDITOR_PART_OPTIONS["limit"]["value"])),
            "perEditorGroup": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["limit"]["perEditorGroup"])),
            "excludeDirty": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["limit"]["excludeDirty"]))
        })),
        "decorations": ( new ObjectVerifier(DEFAULT_EDITOR_PART_OPTIONS["decorations"], {
            "badges": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["decorations"]["badges"])),
            "colors": ( new BooleanVerifier(DEFAULT_EDITOR_PART_OPTIONS["decorations"]["colors"]))
        }))
    }, options);
}
function fillActiveEditorViewState(group, expectedActiveEditor, presetOptions) {
    if (!expectedActiveEditor || !group.activeEditor || expectedActiveEditor.matches(group.activeEditor)) {
        const options = {
            ...presetOptions,
            viewState: group.activeEditorPane?.getViewState()
        };
        return options;
    }
    return presetOptions || Object.create(null);
}
function prepareMoveCopyEditors(sourceGroup, editors, preserveFocus) {
    if (editors.length === 0) {
        return [];
    }
    const editorsWithOptions = [];
    let activeEditor;
    const inactiveEditors = [];
    for (const editor of editors) {
        if (!activeEditor && sourceGroup.isActive(editor)) {
            activeEditor = editor;
        } else {
            inactiveEditors.push(editor);
        }
    }
    if (!activeEditor) {
        activeEditor = inactiveEditors.shift();
    }
    inactiveEditors.sort(
        (a, b) => sourceGroup.getIndexOfEditor(b) - sourceGroup.getIndexOfEditor(a)
    );
    const sortedEditors = coalesce([activeEditor, ...inactiveEditors]);
    for (let i = 0; i < sortedEditors.length; i++) {
        const editor = sortedEditors[i];
        editorsWithOptions.push({
            editor,
            options: {
                pinned: true,
                sticky: sourceGroup.isSticky(editor),
                inactive: i > 0,
                preserveFocus
            }
        });
    }
    return editorsWithOptions;
}

export { DEFAULT_EDITOR_MAX_DIMENSIONS, DEFAULT_EDITOR_MIN_DIMENSIONS, DEFAULT_EDITOR_PART_OPTIONS, fillActiveEditorViewState, getEditorPartOptions, impactsEditorPartOptions, prepareMoveCopyEditors };
