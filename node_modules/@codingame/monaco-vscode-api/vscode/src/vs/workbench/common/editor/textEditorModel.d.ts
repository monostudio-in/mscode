import { ITextModel, ITextBufferFactory, ITextSnapshot } from "../../../editor/common/model.js";
import { EditorModel } from "./editorModel.js";
import { ILanguageSupport } from "../../services/textfile/common/textfiles.js";
import { URI } from "../../../base/common/uri.js";
import { ITextEditorModel, IResolvedTextEditorModel } from "@codingame/monaco-vscode-model-service-override/vscode/vs/editor/common/services/resolverService";
import { ILanguageSelection } from "../../../editor/common/languages/language.js";
import { ILanguageService } from "../../../editor/common/languages/language.service.js";
import { IModelService } from "../../../editor/common/services/model.service.js";
import { ILanguageDetectionService } from "../../services/languageDetection/common/languageDetectionWorkerService.service.js";
import { IAccessibilityService } from "../../../platform/accessibility/common/accessibility.service.js";
import { IMarkdownString } from "../../../base/common/htmlContent.js";
import { TextModelEditSource } from "../../../editor/common/textModelEditSource.js";
/**
 * The base text editor model leverages the code editor model. This class is only intended to be subclassed and not instantiated.
 */
export declare class BaseTextEditorModel extends EditorModel implements ITextEditorModel, ILanguageSupport {
    protected modelService: IModelService;
    protected languageService: ILanguageService;
    private readonly languageDetectionService;
    private readonly accessibilityService;
    private static readonly AUTO_DETECT_LANGUAGE_THROTTLE_DELAY;
    protected textEditorModelHandle: URI | undefined;
    private createdEditorModel;
    private readonly modelDisposeListener;
    private readonly autoDetectLanguageThrottler;
    constructor(modelService: IModelService, languageService: ILanguageService, languageDetectionService: ILanguageDetectionService, accessibilityService: IAccessibilityService, textEditorModelHandle?: URI);
    private handleExistingModel;
    private registerModelDisposeListener;
    get textEditorModel(): ITextModel | null;
    isReadonly(): boolean | IMarkdownString;
    private _blockLanguageChangeListener;
    private _languageChangeSource;
    get languageChangeSource(): "api" | "user" | undefined;
    get hasLanguageSetExplicitly(): boolean;
    setLanguageId(languageId: string, source?: string): void;
    private setLanguageIdInternal;
    protected installModelListeners(model: ITextModel): void;
    getLanguageId(): string | undefined;
    protected autoDetectLanguage(): Promise<void>;
    private doAutoDetectLanguage;
    /**
     * Creates the text editor model with the provided value, optional preferred language
     * (can be comma separated for multiple values) and optional resource URL.
     */
    protected createTextEditorModel(value: ITextBufferFactory, resource: URI | undefined, preferredLanguageId?: string): ITextModel;
    private doCreateTextEditorModel;
    protected getFirstLineText(value: ITextBufferFactory | ITextModel): string;
    /**
     * Gets the language for the given identifier. Subclasses can override to provide their own implementation of this lookup.
     *
     * @param firstLineText optional first line of the text buffer to set the language on. This can be used to guess a language from content.
     */
    protected getOrCreateLanguage(resource: URI | undefined, languageService: ILanguageService, preferredLanguage: string | undefined, firstLineText?: string): ILanguageSelection;
    /**
     * Updates the text editor model with the provided value. If the value is the same as the model has, this is a no-op.
     */
    updateTextEditorModel(newValue?: ITextBufferFactory, preferredLanguageId?: string, reason?: TextModelEditSource): void;
    createSnapshot(this: IResolvedTextEditorModel): ITextSnapshot;
    createSnapshot(this: ITextEditorModel): ITextSnapshot | null;
    isResolved(): this is IResolvedTextEditorModel;
    dispose(): void;
}
