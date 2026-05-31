
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { MainContext } from './extHost.protocol.js';
import { ILogService } from '../../../platform/log/common/log.service.js';
import { checkProposedApiEnabled } from '../../services/extensions/common/extensions.js';

function isMessageItem(item) {
    return item && item.title;
}
let ExtHostMessageService = class ExtHostMessageService {
    constructor(mainContext, _logService) {
        this._logService = _logService;
        this._proxy = ( mainContext.getProxy(MainContext.MainThreadMessageService));
    }
    showMessage(extension, severity, message, optionsOrFirstItem, rest) {
        const options = {
            source: {
                identifier: extension.identifier,
                label: extension.displayName || extension.name
            }
        };
        let items;
        if (typeof optionsOrFirstItem === "string" || isMessageItem(optionsOrFirstItem)) {
            items = [optionsOrFirstItem, ...rest];
        } else {
            options.modal = optionsOrFirstItem?.modal;
            options.useCustom = optionsOrFirstItem?.useCustom;
            options.detail = optionsOrFirstItem?.detail;
            items = rest;
        }
        if (options.useCustom) {
            checkProposedApiEnabled(extension, "resolvers");
        }
        const commands = [];
        let hasCloseAffordance = false;
        for (let handle = 0; handle < items.length; handle++) {
            const command = items[handle];
            if (typeof command === "string") {
                commands.push({
                    title: command,
                    handle,
                    isCloseAffordance: false
                });
            } else if (typeof command === "object") {
                const {
                    title,
                    isCloseAffordance
                } = command;
                commands.push({
                    title,
                    isCloseAffordance: !!isCloseAffordance,
                    handle
                });
                if (isCloseAffordance) {
                    if (hasCloseAffordance) {
                        this._logService.warn(
                            `[${extension.identifier}] Only one message item can have 'isCloseAffordance':`,
                            command
                        );
                    } else {
                        hasCloseAffordance = true;
                    }
                }
            } else {
                this._logService.warn(`[${extension.identifier}] Invalid message item:`, command);
            }
        }
        return this._proxy.$showMessage(severity, message, options, commands).then(handle => {
            if (typeof handle === "number") {
                return items[handle];
            }
            return undefined;
        });
    }
};
ExtHostMessageService = ( __decorate([( __param(1, ILogService))], ExtHostMessageService));

export { ExtHostMessageService };
