import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import type { InlineCompletionsController } from "./inlineCompletionsController.js";
export declare function getInlineCompletionsController(editor: ICodeEditor): InlineCompletionsController | null;
export declare function setInlineCompletionsControllerGetter(getter: (editor: ICodeEditor) => InlineCompletionsController | null): void;
