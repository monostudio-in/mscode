
import product from '../../../platform/product/common/product.js';
import { isObject } from '../../../base/common/types.js';

function getCompletionsEnablementSettingName() {
    return product.defaultChatAgent?.completionsEnablementSetting;
}
function isCompletionsEnabled(configurationService, modeId = '*') {
    const settingName = getCompletionsEnablementSettingName();
    if (!settingName) {
        return false;
    }
    return isCompletionsEnabledFromObject(configurationService.getValue(settingName), modeId);
}
function isCompletionsEnabledWithTextResourceConfig(configurationService, resource, modeId = '*') {
    const settingName = getCompletionsEnablementSettingName();
    if (!settingName) {
        return false;
    }
    return isCompletionsEnabledFromObject(configurationService.getValue(resource, settingName), modeId);
}
function isCompletionsEnabledFromObject(completionsEnablementObject, modeId = '*') {
    if (!isObject(completionsEnablementObject)) {
        return false;
    }
    if (typeof completionsEnablementObject[modeId] !== 'undefined') {
        return Boolean(completionsEnablementObject[modeId]);
    }
    return Boolean(completionsEnablementObject['*']);
}

export { isCompletionsEnabled, isCompletionsEnabledFromObject, isCompletionsEnabledWithTextResourceConfig };
