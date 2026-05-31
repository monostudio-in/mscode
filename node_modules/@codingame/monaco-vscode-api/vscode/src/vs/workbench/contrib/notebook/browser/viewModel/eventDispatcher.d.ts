import { Disposable } from "../../../../../base/common/lifecycle.js";
import { NotebookCellStateChangedEvent, NotebookLayoutChangedEvent, NotebookMetadataChangedEvent, NotebookViewEvent } from "../notebookViewEvents.js";
export declare class NotebookEventDispatcher extends Disposable {
    private readonly _onDidChangeLayout;
    readonly onDidChangeLayout: import("../../../../../base/common/event.js").Event<NotebookLayoutChangedEvent>;
    private readonly _onDidChangeMetadata;
    readonly onDidChangeMetadata: import("../../../../../base/common/event.js").Event<NotebookMetadataChangedEvent>;
    private readonly _onDidChangeCellState;
    readonly onDidChangeCellState: import("../../../../../base/common/event.js").Event<NotebookCellStateChangedEvent>;
    emit(events: NotebookViewEvent[]): void;
}
