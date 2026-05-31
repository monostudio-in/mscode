
import { ExtensionIdentifier } from '../../../../../../platform/extensions/common/extensions.js';
import { PromptsStorage } from '../service/promptsService.js';

function isOrganizationPromptFile(uri, extensionId, productService) {
    const chatExtensionId = productService.defaultChatAgent?.chatExtensionId;
    if (!chatExtensionId) {
        return false;
    }
    const isFromBuiltinChatExtension = ExtensionIdentifier.equals(extensionId, chatExtensionId);
    const pathContainsGithub = uri.path.includes('/github/');
    return isFromBuiltinChatExtension && pathContainsGithub;
}
function isBuiltinAgent(source, uri, productService) {
    if (source.storage !== PromptsStorage.extension) {
        return false;
    }
    const chatExtensionId = productService.defaultChatAgent?.chatExtensionId;
    if (!chatExtensionId || !ExtensionIdentifier.equals(source.extensionId, chatExtensionId)) {
        return false;
    }
    return !isOrganizationPromptFile(uri, source.extensionId, productService);
}

export { isBuiltinAgent, isOrganizationPromptFile };
