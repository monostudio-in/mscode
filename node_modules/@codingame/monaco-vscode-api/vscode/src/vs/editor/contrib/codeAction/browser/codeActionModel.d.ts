import { CancelablePromise } from "../../../../base/common/async.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IMarkerService } from "../../../../platform/markers/common/markers.service.js";
import { IEditorProgressService } from "../../../../platform/progress/common/progress.service.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { Position } from "../../../common/core/position.js";
import { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import { CodeActionProvider } from "../../../common/languages.js";
import { CodeActionSet, CodeActionTrigger } from "../common/types.js";
export declare const SUPPORTED_CODE_ACTIONS: RawContextKey<string>;
export declare const APPLY_FIX_ALL_COMMAND_ID = "_typescript.applyFixAllCodeAction";
export declare namespace CodeActionsState {
    enum Type {
        Empty = 0,
        Triggered = 1
    }
    const Empty: {
        readonly type: Type.Empty;
    };
    class Triggered {
        readonly trigger: CodeActionTrigger;
        readonly position: Position;
        private readonly _cancellablePromise;
        readonly type = Type.Triggered;
        readonly actions: Promise<CodeActionSet>;
        constructor(trigger: CodeActionTrigger, position: Position, _cancellablePromise: CancelablePromise<CodeActionSet>);
        cancel(): void;
    }
    type State = typeof Empty | Triggered;
}
export declare class CodeActionModel extends Disposable {
    private readonly _editor;
    private readonly _registry;
    private readonly _markerService;
    private readonly _progressService?;
    private readonly _configurationService?;
    private readonly _codeActionOracle;
    private _state;
    private readonly _supportedCodeActions;
    private readonly _onDidChangeState;
    readonly onDidChangeState: import("../../../../base/common/event.js").Event<CodeActionsState.State>;
    private readonly codeActionsDisposable;
    private _disposed;
    private _ignoreLightbulbOff;
    set ignoreLightbulbOff(value: boolean);
    constructor(_editor: ICodeEditor, _registry: LanguageFeatureRegistry<CodeActionProvider>, _markerService: IMarkerService, contextKeyService: IContextKeyService, _progressService?: IEditorProgressService | undefined, _configurationService?: IConfigurationService | undefined);
    dispose(): void;
    private _settingEnabledNearbyQuickfixes;
    private _update;
    trigger(trigger: CodeActionTrigger): void;
    private setState;
}
