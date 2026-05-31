
import { registerCss } from '../../../../../../../css.js';
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import * as standaloneQuickInput from './standaloneQuickInput.css';
import { Event } from '../../../../base/common/event.js';
import { registerEditorContribution, EditorContributionInstantiation } from '../../../browser/editorExtensions.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.service.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.service.js';
import { EditorScopedLayoutService } from '../standaloneLayoutService.js';
import { ICodeEditorService } from '../../../browser/services/codeEditorService.service.js';
import { QuickInputService } from '../../../../platform/quickinput/browser/quickInputService.js';
import { createSingleCallFunction } from '../../../../base/common/functional.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.service.js';
import { createElement } from '../../../../base/browser/dom.js';

registerCss(standaloneQuickInput);
let EditorScopedQuickInputService = class EditorScopedQuickInputService extends QuickInputService {
    constructor(
        editor,
        instantiationService,
        contextKeyService,
        themeService,
        codeEditorService,
        configurationService
    ) {
        super(instantiationService, contextKeyService, themeService, ( new EditorScopedLayoutService(editor.getContainerDomNode(), codeEditorService)), configurationService);
        this.host = undefined;
        const contribution = QuickInputEditorContribution.get(editor);
        if (contribution) {
            const widget = contribution.widget;
            this.host = {
                _serviceBrand: undefined,
                get mainContainer() {
                    return widget.getDomNode();
                },
                getContainer() {
                    return widget.getDomNode();
                },
                whenContainerStylesLoaded() {
                    return undefined;
                },
                get containers() {
                    return [widget.getDomNode()];
                },
                get activeContainer() {
                    return widget.getDomNode();
                },
                get mainContainerDimension() {
                    return editor.getLayoutInfo();
                },
                get activeContainerDimension() {
                    return editor.getLayoutInfo();
                },
                get onDidLayoutMainContainer() {
                    return editor.onDidLayoutChange;
                },
                get onDidLayoutActiveContainer() {
                    return editor.onDidLayoutChange;
                },
                get onDidLayoutContainer() {
                    return ( Event.map(editor.onDidLayoutChange, dimension => ({
                        container: widget.getDomNode(),
                        dimension
                    })));
                },
                get onDidChangeActiveContainer() {
                    return Event.None;
                },
                get onDidAddContainer() {
                    return Event.None;
                },
                get mainContainerOffset() {
                    return {
                        top: 0,
                        quickPickTop: 0
                    };
                },
                get activeContainerOffset() {
                    return {
                        top: 0,
                        quickPickTop: 0
                    };
                },
                focus: () => editor.focus()
            };
        } else {
            this.host = undefined;
        }
    }
    createController() {
        return super.createController(this.host);
    }
};
EditorScopedQuickInputService = ( __decorate([( __param(1, IInstantiationService)), ( __param(2, IContextKeyService)), ( __param(3, IThemeService)), ( __param(4, ICodeEditorService)), ( __param(5, IConfigurationService))], EditorScopedQuickInputService));
let StandaloneQuickInputService = class StandaloneQuickInputService {
    get activeService() {
        const editor = this.codeEditorService.getFocusedCodeEditor();
        if (!editor) {
            throw ( new Error("Quick input service needs a focused editor to work."));
        }
        let quickInputService = this.mapEditorToService.get(editor);
        if (!quickInputService) {
            const newQuickInputService = quickInputService = this.instantiationService.createInstance(EditorScopedQuickInputService, editor);
            this.mapEditorToService.set(editor, quickInputService);
            createSingleCallFunction(editor.onDidDispose)(() => {
                newQuickInputService.dispose();
                this.mapEditorToService.delete(editor);
            });
        }
        return quickInputService;
    }
    get currentQuickInput() {
        return this.activeService.currentQuickInput;
    }
    get quickAccess() {
        return this.activeService.quickAccess;
    }
    get backButton() {
        return this.activeService.backButton;
    }
    get alignment() {
        return this.activeService.alignment;
    }
    get onShow() {
        return this.activeService.onShow;
    }
    get onHide() {
        return this.activeService.onHide;
    }
    constructor(instantiationService, codeEditorService) {
        this.instantiationService = instantiationService;
        this.codeEditorService = codeEditorService;
        this.mapEditorToService = ( new Map());
    }
    pick(picks, options, token = CancellationToken.None) {
        return this.activeService .pick(picks, options, token);
    }
    input(options, token) {
        return this.activeService.input(options, token);
    }
    createQuickPick(
        options = {
            useSeparators: false
        }
    ) {
        return this.activeService.createQuickPick(options);
    }
    createInputBox() {
        return this.activeService.createInputBox();
    }
    createQuickWidget() {
        return this.activeService.createQuickWidget();
    }
    createQuickTree() {
        return this.activeService.createQuickTree();
    }
    focus() {
        return this.activeService.focus();
    }
    toggle() {
        return this.activeService.toggle();
    }
    navigate(next, quickNavigate) {
        return this.activeService.navigate(next, quickNavigate);
    }
    accept() {
        return this.activeService.accept();
    }
    back() {
        return this.activeService.back();
    }
    cancel() {
        return this.activeService.cancel();
    }
    setAlignment(alignment) {
        return this.activeService.setAlignment(alignment);
    }
    toggleHover() {
        return this.activeService.toggleHover();
    }
};
StandaloneQuickInputService = ( __decorate([( __param(0, IInstantiationService)), ( __param(1, ICodeEditorService))], StandaloneQuickInputService));
class QuickInputEditorContribution {
    static {
        this.ID = "editor.controller.quickInput";
    }
    static get(editor) {
        return editor.getContribution(QuickInputEditorContribution.ID);
    }
    constructor(editor) {
        this.editor = editor;
        this.widget = ( new QuickInputEditorWidget(this.editor));
    }
    dispose() {
        this.widget.dispose();
    }
}
class QuickInputEditorWidget {
    static {
        this.ID = "editor.contrib.quickInputWidget";
    }
    constructor(codeEditor) {
        this.codeEditor = codeEditor;
        this.domNode = createElement("div");
        this.codeEditor.addOverlayWidget(this);
    }
    getId() {
        return QuickInputEditorWidget.ID;
    }
    getDomNode() {
        return this.domNode;
    }
    getPosition() {
        return {
            preference: {
                top: 0,
                left: 0
            }
        };
    }
    dispose() {
        this.codeEditor.removeOverlayWidget(this);
    }
}
registerEditorContribution(
    QuickInputEditorContribution.ID,
    QuickInputEditorContribution,
    EditorContributionInstantiation.Lazy
);

export { QuickInputEditorContribution, QuickInputEditorWidget, StandaloneQuickInputService };
