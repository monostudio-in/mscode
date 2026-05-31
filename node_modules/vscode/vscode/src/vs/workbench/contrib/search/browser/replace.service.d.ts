import { IProgress, IProgressStep } from "../../../../platform/progress/common/progress.js";
import { ISearchTreeMatch, ISearchTreeFileMatch, FileMatchOrMatch } from "./searchTreeModel/searchTreeCommon.js";
export declare const IReplaceService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IReplaceService>;
export interface IReplaceService {
    readonly _serviceBrand: undefined;
    /**
    * Replaces the given match in the file that match belongs to
    */
    replace(match: ISearchTreeMatch): Promise<any>;
    /**
    *	Replace all the matches from the given file matches in the files
    *  You can also pass the progress runner to update the progress of replacing.
    */
    replace(files: ISearchTreeFileMatch[], progress?: IProgress<IProgressStep>): Promise<any>;
    /**
    * Opens the replace preview for given file match or match
    */
    openReplacePreview(element: FileMatchOrMatch, preserveFocus?: boolean, sideBySide?: boolean, pinned?: boolean): Promise<any>;
    /**
    * Update the replace preview for the given file.
    * If `override` is `true`, then replace preview is constructed from source model
    */
    updateReplacePreview(file: ISearchTreeFileMatch, override?: boolean): Promise<void>;
}
