import { FastDomNode } from "../../../../base/browser/fastDomNode.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Position } from "../../../common/core/position.js";
import { IEditorAriaOptions } from "../../editorBrowser.js";
import { ViewPart } from "../../view/viewPart.js";
import { IClipboardCopyEvent, IClipboardPasteEvent } from "./clipboardUtils.js";
export declare abstract class AbstractEditContext extends ViewPart {
    abstract domNode: FastDomNode<HTMLElement>;
    abstract focus(): void;
    abstract isFocused(): boolean;
    abstract refreshFocusState(): void;
    abstract setAriaOptions(options: IEditorAriaOptions): void;
    abstract getLastRenderData(): Position | null;
    abstract writeScreenReaderContent(reason: string): void;
    protected readonly _onWillCopy: Emitter<IClipboardCopyEvent>;
    readonly onWillCopy: Event<IClipboardCopyEvent>;
    protected readonly _onWillCut: Emitter<IClipboardCopyEvent>;
    readonly onWillCut: Event<IClipboardCopyEvent>;
    protected readonly _onWillPaste: Emitter<IClipboardPasteEvent>;
    readonly onWillPaste: Event<IClipboardPasteEvent>;
}
