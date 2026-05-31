
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { getClientArea } from '../../../base/browser/dom.js';
import { mainWindow } from '../../../base/browser/window.js';
import { coalesce } from '../../../base/common/arrays.js';
import { Event } from '../../../base/common/event.js';
import { ICodeEditorService } from '../../browser/services/codeEditorService.service.js';
import { registerSingleton, InstantiationType } from '../../../platform/instantiation/common/extensions.js';
import { ILayoutService } from '../../../platform/layout/browser/layoutService.service.js';

let StandaloneLayoutService = class StandaloneLayoutService {
    get mainContainer() {
        return this._codeEditorService.listCodeEditors().at(0)?.getContainerDomNode() ?? mainWindow.document.body;
    }
    get activeContainer() {
        const activeCodeEditor = this._codeEditorService.getFocusedCodeEditor() ?? this._codeEditorService.getActiveCodeEditor();
        return activeCodeEditor?.getContainerDomNode() ?? this.mainContainer;
    }
    get mainContainerDimension() {
        return getClientArea(this.mainContainer);
    }
    get activeContainerDimension() {
        return getClientArea(this.activeContainer);
    }
    get containers() {
        return coalesce(( this._codeEditorService.listCodeEditors().map(codeEditor => codeEditor.getContainerDomNode())));
    }
    getContainer() {
        return this.activeContainer;
    }
    whenContainerStylesLoaded() {
        return undefined;
    }
    focus() {
        this._codeEditorService.getFocusedCodeEditor()?.focus();
    }
    constructor(_codeEditorService) {
        this._codeEditorService = _codeEditorService;
        this.onDidLayoutMainContainer = Event.None;
        this.onDidLayoutActiveContainer = Event.None;
        this.onDidLayoutContainer = Event.None;
        this.onDidChangeActiveContainer = Event.None;
        this.onDidAddContainer = Event.None;
        this.mainContainerOffset = {
            top: 0,
            quickPickTop: 0
        };
        this.activeContainerOffset = {
            top: 0,
            quickPickTop: 0
        };
    }
};
StandaloneLayoutService = ( __decorate([( __param(0, ICodeEditorService))], StandaloneLayoutService));
let EditorScopedLayoutService = class EditorScopedLayoutService extends StandaloneLayoutService {
    get mainContainer() {
        return this._container;
    }
    constructor(_container, codeEditorService) {
        super(codeEditorService);
        this._container = _container;
    }
};
EditorScopedLayoutService = ( __decorate([( __param(1, ICodeEditorService))], EditorScopedLayoutService));
registerSingleton(ILayoutService, StandaloneLayoutService, InstantiationType.Delayed);

export { EditorScopedLayoutService };
