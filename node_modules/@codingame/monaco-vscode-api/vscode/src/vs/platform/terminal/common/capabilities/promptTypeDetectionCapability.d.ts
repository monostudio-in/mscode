import { Disposable } from "../../../../base/common/lifecycle.js";
import { IPromptTypeDetectionCapability, TerminalCapability } from "./capabilities.js";
export declare class PromptTypeDetectionCapability extends Disposable implements IPromptTypeDetectionCapability {
    readonly type = TerminalCapability.PromptTypeDetection;
    private _promptType;
    get promptType(): string | undefined;
    private readonly _onPromptTypeChanged;
    readonly onPromptTypeChanged: import("../../../../base/common/event.js").Event<string | undefined>;
    setPromptType(value: string): void;
}
