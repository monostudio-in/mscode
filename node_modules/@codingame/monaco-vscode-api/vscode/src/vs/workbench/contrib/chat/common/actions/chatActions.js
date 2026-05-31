
import { MarshalledId } from '../../../../../base/common/marshallingIds.js';
import { URI } from '../../../../../base/common/uri.js';

function isChatViewTitleActionContext(obj) {
    return !!obj &&
        URI.isUri(obj.sessionResource)
        && obj.$mid === MarshalledId.ChatViewContext;
}

export { isChatViewTitleActionContext };
