import { VSBuffer } from "../../../../../base/common/buffer.js";
import { IChatRequestVariableEntry } from "../../common/attachments/chatVariableEntries.js";
export declare const ScreenshotVariableId = "screenshot-focused-window";
export declare function convertBufferToScreenshotVariable(buffer: VSBuffer): IChatRequestVariableEntry;
