import { WrappingIndent } from "../../common/config/editorOptions.js";
import { ILineBreaksComputer, ILineBreaksComputerContext, ILineBreaksComputerFactory } from "../../common/modelLineProjectionData.js";
import { FontInfo } from "../../common/config/fontInfo.js";
export declare class DOMLineBreaksComputerFactory implements ILineBreaksComputerFactory {
    private targetWindow;
    static create(targetWindow: Window): DOMLineBreaksComputerFactory;
    constructor(targetWindow: WeakRef<Window>);
    createLineBreaksComputer(context: ILineBreaksComputerContext, fontInfo: FontInfo, tabSize: number, wrappingColumn: number, wrappingIndent: WrappingIndent, wordBreak: "normal" | "keepAll", wrapOnEscapedLineFeeds: boolean): ILineBreaksComputer;
}
