import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILoggerService } from "../../../../../platform/log/common/log.service.js";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
export interface ITextModelChangeRecorderMetadata {
    source?: string;
    extensionId?: string;
    nes?: boolean;
    type?: "word" | "line";
}
export declare class TextModelChangeRecorder extends Disposable {
    private readonly _editor;
    private readonly _instantiationService;
    private readonly _loggerService;
    private readonly _structuredLogger;
    constructor(_editor: ICodeEditor, _instantiationService: IInstantiationService, _loggerService: ILoggerService);
}
