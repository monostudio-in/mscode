
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { toDisposable } from '../../../base/common/lifecycle.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { StatusbarAlignment } from '../../services/statusbar/browser/statusbar.js';
import { IStatusbarService } from '../../services/statusbar/browser/statusbar.service.js';
import { isMarkdownString } from '../../../base/common/htmlContent.js';
import { getCodiconAriaLabel } from '../../../base/common/iconLabels.js';
import { hash } from '../../../base/common/hash.js';
import { Emitter } from '../../../base/common/event.js';
import { registerSingleton, InstantiationType } from '../../../platform/instantiation/common/extensions.js';
import { STATUS_BAR_WARNING_ITEM_BACKGROUND, STATUS_BAR_ERROR_ITEM_BACKGROUND } from '../../common/theme.js';

const IExtensionStatusBarItemService = ( createDecorator("IExtensionStatusBarItemService"));
var StatusBarUpdateKind;
(function(StatusBarUpdateKind) {
    StatusBarUpdateKind[StatusBarUpdateKind["DidDefine"] = 0] = "DidDefine";
    StatusBarUpdateKind[StatusBarUpdateKind["DidUpdate"] = 1] = "DidUpdate";
})(StatusBarUpdateKind || (StatusBarUpdateKind = {}));
let ExtensionStatusBarItemService = class ExtensionStatusBarItemService {
    constructor(_statusbarService) {
        this._statusbarService = _statusbarService;
        this._entries = ( new Map());
        this._onDidChange = ( new Emitter());
        this.onDidChange = this._onDidChange.event;
    }
    dispose() {
        this._entries.forEach(entry => entry.accessor.dispose());
        this._entries.clear();
        this._onDidChange.dispose();
    }
    setOrUpdateEntry(
        entryId,
        id,
        extensionId,
        name,
        text,
        tooltip,
        command,
        color,
        backgroundColor,
        alignLeft,
        priority,
        accessibilityInformation
    ) {
        let ariaLabel;
        let role = undefined;
        if (accessibilityInformation) {
            ariaLabel = accessibilityInformation.label;
            role = accessibilityInformation.role;
        } else {
            ariaLabel = getCodiconAriaLabel(text);
            if (typeof tooltip === "string" || isMarkdownString(tooltip)) {
                const tooltipString = typeof tooltip === "string" ? tooltip : tooltip.value;
                ariaLabel += `, ${tooltipString}`;
            }
        }
        let kind = undefined;
        switch (backgroundColor?.id) {
        case STATUS_BAR_ERROR_ITEM_BACKGROUND:
        case STATUS_BAR_WARNING_ITEM_BACKGROUND:
            kind = backgroundColor.id === STATUS_BAR_ERROR_ITEM_BACKGROUND ? "error" : "warning";
            color = undefined;
            backgroundColor = undefined;
        }
        const entry = {
            name,
            text,
            tooltip,
            command,
            color,
            backgroundColor,
            ariaLabel,
            role,
            kind,
            extensionId
        };
        if (typeof priority === "undefined") {
            priority = 0;
        }
        let alignment = alignLeft ? StatusbarAlignment.LEFT : StatusbarAlignment.RIGHT;
        const existingEntry = this._entries.get(entryId);
        if (existingEntry) {
            alignment = existingEntry.alignment;
            priority = existingEntry.priority;
        }
        if (!existingEntry) {
            let entryPriority;
            if (typeof extensionId === "string") {
                entryPriority = {
                    primary: priority,
                    secondary: hash(extensionId)
                };
            } else {
                entryPriority = priority;
            }
            const accessor = this._statusbarService.addEntry(entry, id, alignment, entryPriority);
            this._entries.set(entryId, {
                accessor,
                entry,
                alignment,
                priority,
                disposable: toDisposable(() => {
                    accessor.dispose();
                    this._entries.delete(entryId);
                    this._onDidChange.fire({
                        removed: entryId
                    });
                })
            });
            this._onDidChange.fire({
                added: [entryId, {
                    entry,
                    alignment,
                    priority
                }]
            });
            return StatusBarUpdateKind.DidDefine;
        } else {
            existingEntry.accessor.update(entry);
            existingEntry.entry = entry;
            return StatusBarUpdateKind.DidUpdate;
        }
    }
    unsetEntry(entryId) {
        this._entries.get(entryId)?.disposable.dispose();
        this._entries.delete(entryId);
    }
    getEntries() {
        return this._entries.entries();
    }
};
ExtensionStatusBarItemService = ( __decorate([( __param(0, IStatusbarService))], ExtensionStatusBarItemService));
registerSingleton(
    IExtensionStatusBarItemService,
    ExtensionStatusBarItemService,
    InstantiationType.Delayed
);

export { ExtensionStatusBarItemService, IExtensionStatusBarItemService, StatusBarUpdateKind };
