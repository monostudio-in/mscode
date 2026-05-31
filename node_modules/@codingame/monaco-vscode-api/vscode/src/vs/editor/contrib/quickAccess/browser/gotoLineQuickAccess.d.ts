import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IQuickPick, IQuickPickItem } from "../../../../platform/quickinput/common/quickInput.js";
import { IStorageService } from "../../../../platform/storage/common/storage.service.js";
import { IPosition } from "../../../common/core/position.js";
import { IEditor } from "../../../common/editorCommon.js";
import { AbstractEditorNavigationQuickAccessProvider, IQuickAccessTextEditorContext } from "./editorNavigationQuickAccess.js";
interface IGotoLineQuickPickItem extends IQuickPickItem, Partial<IPosition> {
}
export declare abstract class AbstractGotoLineQuickAccessProvider extends AbstractEditorNavigationQuickAccessProvider {
    static readonly GO_TO_LINE_PREFIX = ":";
    static readonly GO_TO_OFFSET_PREFIX = "::";
    private static readonly ZERO_BASED_OFFSET_STORAGE_KEY;
    constructor();
    protected abstract readonly storageService: IStorageService;
    private get useZeroBasedOffset();
    private set useZeroBasedOffset(value);
    protected provideWithoutTextEditor(picker: IQuickPick<IGotoLineQuickPickItem, {
        useSeparators: true;
    }>): IDisposable;
    protected provideWithTextEditor(context: IQuickAccessTextEditorContext, picker: IQuickPick<IGotoLineQuickPickItem, {
        useSeparators: true;
    }>, token: CancellationToken): IDisposable;
    private toRange;
    protected parsePosition(editor: IEditor, value: string): Partial<IPosition> & {
        inOffsetMode?: boolean;
        label: string;
    };
}
export {};
