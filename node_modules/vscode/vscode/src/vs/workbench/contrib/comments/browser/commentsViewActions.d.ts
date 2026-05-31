import { Disposable } from "../../../../base/common/lifecycle.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { Event } from "../../../../base/common/event.js";
export declare enum CommentsSortOrder {
    ResourceAscending = "resourceAscending",
    UpdatedAtDescending = "updatedAtDescending"
}
export interface CommentsFiltersChangeEvent {
    showResolved?: boolean;
    showUnresolved?: boolean;
    sortBy?: CommentsSortOrder;
}
interface CommentsFiltersOptions {
    showResolved: boolean;
    showUnresolved: boolean;
    sortBy: CommentsSortOrder;
}
export declare class CommentsFilters extends Disposable {
    private readonly contextKeyService;
    private readonly _onDidChange;
    readonly onDidChange: Event<CommentsFiltersChangeEvent>;
    private readonly _showUnresolved;
    private readonly _showResolved;
    private readonly _sortBy;
    constructor(options: CommentsFiltersOptions, contextKeyService: IContextKeyService);
    get showUnresolved(): boolean;
    set showUnresolved(showUnresolved: boolean);
    get showResolved(): boolean;
    set showResolved(showResolved: boolean);
    get sortBy(): CommentsSortOrder;
    set sortBy(sortBy: CommentsSortOrder);
}
export {};
