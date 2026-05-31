
import { MainContext } from './extHost.protocol.js';
import { NotebookEdit, TextEdit } from './extHostTypeConverters.js';
import { URI } from '../../../base/common/uri.js';
import { asArray } from '../../../base/common/arrays.js';
import { LocalChatSessionUri } from '../../contrib/chat/common/model/chatUri.js';

class ExtHostCodeMapper {
    static {
        this._providerHandlePool = 0;
    }
    constructor(mainContext) {
        this.providers = ( new Map());
        this._proxy = ( mainContext.getProxy(MainContext.MainThreadCodeMapper));
    }
    async $mapCode(handle, internalRequest, token) {
        const provider = this.providers.get(handle);
        if (!provider) {
            throw ( new Error(`Received request to map code for unknown provider handle ${handle}`));
        }
        const stream = {
            textEdit: (target, edits) => {
                edits = asArray(edits);
                this._proxy.$handleProgress(internalRequest.requestId, {
                    uri: target,
                    edits: ( edits.map(TextEdit.from))
                });
            },
            notebookEdit: (target, edits) => {
                edits = asArray(edits);
                this._proxy.$handleProgress(internalRequest.requestId, {
                    uri: target,
                    edits: ( edits.map(NotebookEdit.from))
                });
            }
        };
        const request = {
            location: internalRequest.location,
            chatRequestId: internalRequest.chatRequestId,
            chatRequestModel: internalRequest.chatRequestModel,
            chatSessionId: internalRequest.chatSessionResource ? LocalChatSessionUri.parseLocalSessionId(URI.revive(internalRequest.chatSessionResource)) : undefined,
            codeBlocks: ( internalRequest.codeBlocks.map(block => {
                return {
                    code: block.code,
                    resource: URI.revive(block.resource),
                    markdownBeforeBlock: block.markdownBeforeBlock
                };
            }))
        };
        const result = await provider.provideMappedEdits(request, stream, token);
        return result ?? null;
    }
    registerMappedEditsProvider(extension, provider) {
        const handle = ExtHostCodeMapper._providerHandlePool++;
        this._proxy.$registerCodeMapperProvider(handle, extension.displayName ?? extension.name);
        this.providers.set(handle, provider);
        return {
            dispose: () => {
                return this._proxy.$unregisterCodeMapperProvider(handle);
            }
        };
    }
}

export { ExtHostCodeMapper };
