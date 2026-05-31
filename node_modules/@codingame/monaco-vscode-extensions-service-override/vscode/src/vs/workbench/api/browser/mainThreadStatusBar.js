
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { Disposable, DisposableMap, toDisposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { StatusbarAlignment } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/statusbar/browser/statusbar';
import { StatusBarUpdateKind, IExtensionStatusBarItemService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/browser/statusBarService';

let MainThreadStatusBar = class MainThreadStatusBar extends Disposable {
    constructor(extHostContext, statusbarService) {
        super();
        this.statusbarService = statusbarService;
        this._entryDisposables = this._register(( new DisposableMap()));
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostStatusBar));
        const entries = [];
        for (const [entryId, item] of statusbarService.getEntries()) {
            entries.push(asDto(entryId, item));
        }
        this._proxy.$acceptStaticEntries(entries);
        this._register(statusbarService.onDidChange(e => {
            if (e.added) {
                this._proxy.$acceptStaticEntries([asDto(e.added[0], e.added[1])]);
            }
        }));
        function asDto(entryId, item) {
            return {
                entryId,
                name: item.entry.name,
                text: item.entry.text,
                tooltip: item.entry.tooltip,
                command: typeof item.entry.command === "string" ? item.entry.command : typeof item.entry.command === "object" ? item.entry.command.id : undefined,
                priority: item.priority,
                alignLeft: item.alignment === StatusbarAlignment.LEFT,
                accessibilityInformation: item.entry.ariaLabel ? {
                    label: item.entry.ariaLabel,
                    role: item.entry.role
                } : undefined
            };
        }
    }
    $setEntry(
        entryId,
        id,
        extensionId,
        name,
        text,
        tooltip,
        hasTooltipProvider,
        command,
        color,
        backgroundColor,
        alignLeft,
        priority,
        accessibilityInformation
    ) {
        const tooltipOrTooltipProvider = hasTooltipProvider ? {
            markdown: cancellation => {
                return this._proxy.$provideTooltip(entryId, cancellation);
            },
            markdownNotSupportedFallback: undefined
        } : tooltip;
        const kind = this.statusbarService.setOrUpdateEntry(
            entryId,
            id,
            extensionId,
            name,
            text,
            tooltipOrTooltipProvider,
            command,
            color,
            backgroundColor,
            alignLeft,
            priority,
            accessibilityInformation
        );
        if (kind === StatusBarUpdateKind.DidDefine) {
            const disposable = toDisposable(() => this.statusbarService.unsetEntry(entryId));
            this._entryDisposables.set(entryId, disposable);
        }
    }
    $disposeEntry(entryId) {
        this._entryDisposables.deleteAndDispose(entryId);
    }
};
MainThreadStatusBar = __decorate([extHostNamedCustomer(MainContext.MainThreadStatusBar), ( __param(1, IExtensionStatusBarItemService))], MainThreadStatusBar);

export { MainThreadStatusBar };
