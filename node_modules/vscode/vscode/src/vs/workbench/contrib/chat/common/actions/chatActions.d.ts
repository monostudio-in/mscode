import { MarshalledId } from "../../../../../base/common/marshallingIds.js";
import { URI } from "../../../../../base/common/uri.js";
export interface IChatViewTitleActionContext {
    readonly $mid: MarshalledId.ChatViewContext;
    readonly sessionResource: URI;
}
export declare function isChatViewTitleActionContext(obj: unknown): obj is IChatViewTitleActionContext;
