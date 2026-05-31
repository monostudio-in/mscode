
import { runWhenWindowIdle, getWindow } from '../../../../base/browser/dom.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { Disposable, DisposableMap } from '../../../../base/common/lifecycle.js';
import { EditorContributionInstantiation } from '../../editorExtensions.js';

class CodeEditorContributions extends Disposable {
    constructor() {
        super();
        this._editor = null;
        this._instantiationService = null;
        this._instances = this._register(( new DisposableMap()));
        this._pending = ( new Map());
        this._finishedInstantiation = [];
        this._finishedInstantiation[EditorContributionInstantiation.Eager] = false;
        this._finishedInstantiation[EditorContributionInstantiation.AfterFirstRender] = false;
        this._finishedInstantiation[EditorContributionInstantiation.BeforeFirstInteraction] = false;
        this._finishedInstantiation[EditorContributionInstantiation.Eventually] = false;
    }
    initialize(editor, contributions, instantiationService) {
        this._editor = editor;
        this._instantiationService = instantiationService;
        for (const desc of contributions) {
            if (( this._pending.has(desc.id))) {
                onUnexpectedError(( new Error(`Cannot have two contributions with the same id ${desc.id}`)));
                continue;
            }
            this._pending.set(desc.id, desc);
        }
        this._instantiateSome(EditorContributionInstantiation.Eager);
        this._register(runWhenWindowIdle(getWindow(this._editor.getDomNode()), () => {
            this._instantiateSome(EditorContributionInstantiation.AfterFirstRender);
        }));
        this._register(runWhenWindowIdle(getWindow(this._editor.getDomNode()), () => {
            this._instantiateSome(EditorContributionInstantiation.BeforeFirstInteraction);
        }));
        this._register(runWhenWindowIdle(getWindow(this._editor.getDomNode()), () => {
            this._instantiateSome(EditorContributionInstantiation.Eventually);
        }, 5000));
    }
    saveViewState() {
        const contributionsState = {};
        for (const [id, contribution] of this._instances) {
            if (typeof contribution.saveViewState === "function") {
                contributionsState[id] = contribution.saveViewState();
            }
        }
        return contributionsState;
    }
    restoreViewState(contributionsState) {
        for (const [id, contribution] of this._instances) {
            if (typeof contribution.restoreViewState === "function") {
                contribution.restoreViewState(contributionsState[id]);
            }
        }
    }
    get(id) {
        this._instantiateById(id);
        return this._instances.get(id) || null;
    }
    set(id, value) {
        this._instances.set(id, value);
    }
    onBeforeInteractionEvent() {
        this._instantiateSome(EditorContributionInstantiation.BeforeFirstInteraction);
    }
    onAfterModelAttached() {
        return runWhenWindowIdle(getWindow(this._editor?.getDomNode()), () => {
            this._instantiateSome(EditorContributionInstantiation.AfterFirstRender);
        }, 50);
    }
    _instantiateSome(instantiation) {
        if (this._finishedInstantiation[instantiation]) {
            return;
        }
        this._finishedInstantiation[instantiation] = true;
        const contribs = this._findPendingContributionsByInstantiation(instantiation);
        for (const contrib of contribs) {
            this._instantiateById(contrib.id);
        }
    }
    _findPendingContributionsByInstantiation(instantiation) {
        const result = [];
        for (const [, desc] of this._pending) {
            if (desc.instantiation === instantiation) {
                result.push(desc);
            }
        }
        return result;
    }
    _instantiateById(id) {
        const desc = this._pending.get(id);
        if (!desc) {
            return;
        }
        this._pending.delete(id);
        if (!this._instantiationService || !this._editor) {
            throw ( new Error(`Cannot instantiate contributions before being initialized!`));
        }
        try {
            const instance = this._instantiationService.createInstance(desc.ctor, this._editor);
            this._instances.set(desc.id, instance);
            if (typeof instance.restoreViewState === "function" && desc.instantiation !== EditorContributionInstantiation.Eager) {
                console.warn(
                    `Editor contribution '${desc.id}' should be eager instantiated because it uses saveViewState / restoreViewState.`
                );
            }
        } catch (err) {
            onUnexpectedError(err);
        }
    }
}

export { CodeEditorContributions };
