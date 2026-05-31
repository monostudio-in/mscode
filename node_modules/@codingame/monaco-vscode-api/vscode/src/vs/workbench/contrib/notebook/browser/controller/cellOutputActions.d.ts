import { ICellOutputViewModel, INotebookEditor } from "../notebookBrowser.js";
export declare const COPY_OUTPUT_COMMAND_ID = "notebook.cellOutput.copy";
export declare function getOutputViewModelFromId(outputId: string, notebookEditor: INotebookEditor): ICellOutputViewModel | undefined;
export declare const OPEN_OUTPUT_COMMAND_ID = "notebook.cellOutput.openInTextEditor";
export declare const SAVE_OUTPUT_IMAGE_COMMAND_ID = "notebook.cellOutput.saveImage";
export declare const OPEN_OUTPUT_IN_OUTPUT_PREVIEW_COMMAND_ID = "notebook.cellOutput.openInOutputPreview";
