
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { IInstantiationService } from '@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/instantiation';
import { MainThreadCustomEditors } from './mainThreadCustomEditors.js';
import { MainThreadWebviewPanels } from './mainThreadWebviewPanels.js';
import { MainThreadWebviews } from './mainThreadWebviews.js';
import { MainThreadWebviewsViews } from './mainThreadWebviewViews.js';
import { MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { extHostCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { MainThreadChatOutputRenderer } from './mainThreadChatOutputRenderer.js';

let MainThreadWebviewManager = class MainThreadWebviewManager extends Disposable {
    constructor(context, instantiationService) {
        super();
        const webviews = this._register(instantiationService.createInstance(MainThreadWebviews, context));
        context.set(MainContext.MainThreadWebviews, webviews);
        const webviewPanels = this._register(
            instantiationService.createInstance(MainThreadWebviewPanels, context, webviews)
        );
        context.set(MainContext.MainThreadWebviewPanels, webviewPanels);
        const customEditors = this._register(
            instantiationService.createInstance(MainThreadCustomEditors, context, webviews, webviewPanels)
        );
        context.set(MainContext.MainThreadCustomEditors, customEditors);
        const webviewViews = this._register(
            instantiationService.createInstance(MainThreadWebviewsViews, context, webviews)
        );
        context.set(MainContext.MainThreadWebviewViews, webviewViews);
        const chatOutputRenderers = this._register(
            instantiationService.createInstance(MainThreadChatOutputRenderer, context, webviews)
        );
        context.set(
            MainContext.MainThreadChatOutputRenderer,
            chatOutputRenderers
        );
    }
};
MainThreadWebviewManager = __decorate([extHostCustomer, ( __param(1, IInstantiationService))], MainThreadWebviewManager);

export { MainThreadWebviewManager };
