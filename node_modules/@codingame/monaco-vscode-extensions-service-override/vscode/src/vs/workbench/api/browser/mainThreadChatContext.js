
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { IChatContextService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/chat/browser/contextContrib/chatContextService.service';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';

function reviveContextItem(item) {
    return {
        ...item,
        resourceUri: item.resourceUri ? URI.revive(item.resourceUri) : undefined
    };
}
function reviveContextItems(items) {
    return ( items.map(reviveContextItem));
}
let MainThreadChatContext = class MainThreadChatContext extends Disposable {
    constructor(extHostContext, _chatContextService) {
        super();
        this._chatContextService = _chatContextService;
        this._providers = ( new Map());
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostChatContext));
        this._chatContextService.setExecuteCommandCallback(itemHandle => this._proxy.$executeChatContextItemCommand(itemHandle));
    }
    $registerChatWorkspaceContextProvider(handle, id) {
        this._providers.set(handle, {
            id
        });
        this._chatContextService.registerChatWorkspaceContextProvider(id, {
            provideWorkspaceChatContext: async token => {
                const items = await this._proxy.$provideWorkspaceChatContext(handle, token);
                return reviveContextItems(items);
            }
        });
    }
    $registerChatExplicitContextProvider(handle, id) {
        this._providers.set(handle, {
            id
        });
        this._chatContextService.registerChatExplicitContextProvider(id, {
            provideChatContext: async token => {
                const items = await this._proxy.$provideExplicitChatContext(handle, token);
                return reviveContextItems(items);
            },
            resolveChatContext: async (context, token) => {
                const result = await this._proxy.$resolveExplicitChatContext(handle, context, token);
                return reviveContextItem(result);
            }
        });
    }
    $registerChatResourceContextProvider(handle, id, selector) {
        this._providers.set(handle, {
            id,
            selector
        });
        this._chatContextService.registerChatResourceContextProvider(id, selector, {
            provideChatContext: async (resource, withValue, token) => {
                const result = await this._proxy.$provideResourceChatContext(handle, {
                    resource,
                    withValue
                }, token);
                return result ? reviveContextItem(result) : undefined;
            },
            resolveChatContext: async (context, token) => {
                const result = await this._proxy.$resolveResourceChatContext(handle, context, token);
                return reviveContextItem(result);
            }
        });
    }
    $unregisterChatContextProvider(handle) {
        const provider = this._providers.get(handle);
        if (!provider) {
            return;
        }
        this._chatContextService.unregisterChatContextProvider(provider.id);
        this._providers.delete(handle);
    }
    $updateWorkspaceContextItems(handle, items) {
        const provider = this._providers.get(handle);
        if (!provider) {
            return;
        }
        this._chatContextService.updateWorkspaceContextItems(provider.id, reviveContextItems(items));
    }
    $executeChatContextItemCommand(itemHandle) {
        return this._proxy.$executeChatContextItemCommand(itemHandle);
    }
};
MainThreadChatContext = __decorate([extHostNamedCustomer(MainContext.MainThreadChatContext), ( __param(1, IChatContextService))], MainThreadChatContext);

export { MainThreadChatContext };
