import { IObservable } from "../../../../../base/common/observable.js";
import { URI } from "../../../../../base/common/uri.js";
import { RawContextKey } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IWorkbenchContribution } from "../../../../common/contributions.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.service.js";
import { IInlineChatSessionService } from "../../../inlineChat/browser/inlineChatSessionService.service.js";
import { IChatEditingSession, IModifiedFileEntry } from "../../common/editing/chatEditingService.js";
import { IChatEditingService } from "../../common/editing/chatEditingService.service.js";
export declare const ctxIsGlobalEditingSession: RawContextKey<boolean>;
export declare const ctxHasEditorModification: RawContextKey<boolean>;
export declare const ctxIsCurrentlyBeingModified: RawContextKey<boolean>;
export declare const ctxReviewModeEnabled: RawContextKey<boolean>;
export declare const ctxHasRequestInProgress: RawContextKey<boolean>;
export declare const ctxRequestCount: RawContextKey<number>;
export declare const ctxCursorInChangeRange: RawContextKey<boolean>;
export declare class ChatEditingEditorContextKeys implements IWorkbenchContribution {
    static readonly ID = "chat.edits.editorContextKeys";
    private readonly _store;
    constructor(instaService: IInstantiationService, editorGroupsService: IEditorGroupsService);
    dispose(): void;
}
export declare class ObservableEditorSession {
    readonly value: IObservable<undefined | {
        session: IChatEditingSession;
        entry: IModifiedFileEntry | undefined;
        isInlineChat: boolean;
    }>;
    constructor(uri: URI, chatEditingService: IChatEditingService, inlineChatService: IInlineChatSessionService);
}
