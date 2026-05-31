/**
 * Limit editor navigation to certain kinds.
 */
export declare enum GoFilter {
    /**
     * Navigate between editor navigation history
     * entries from any kind of navigation source.
     */
    NONE = 0,
    /**
     * Only navigate between editor navigation history
     * entries that were resulting from edits.
     */
    EDITS = 1,
    /**
     * Only navigate between editor navigation history
     * entries that were resulting from navigations, such
     * as "Go to definition".
     */
    NAVIGATION = 2
}
/**
 * Limit editor navigation to certain scopes.
 */
export declare enum GoScope {
    /**
     * Navigate across all editors and editor groups.
     */
    DEFAULT = 0,
    /**
     * Navigate only in editors of the active editor group.
     */
    EDITOR_GROUP = 1,
    /**
     * Navigate only in the active editor.
     */
    EDITOR = 2
}
