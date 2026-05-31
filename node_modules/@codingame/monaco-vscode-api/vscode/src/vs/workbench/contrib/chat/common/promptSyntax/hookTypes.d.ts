import { Target } from "./promptTypes.js";
/**
 * Enum of hook types across all targets. For the set of supported hooks per target, see HOOKS_BY_TARGET.
 */
export declare enum HookType {
    SessionStart = "SessionStart",
    SessionEnd = "SessionEnd",
    UserPromptSubmit = "UserPromptSubmit",
    PreToolUse = "PreToolUse",
    PostToolUse = "PostToolUse",
    PreCompact = "PreCompact",
    SubagentStart = "SubagentStart",
    SubagentStop = "SubagentStop",
    Stop = "Stop",
    ErrorOccurred = "ErrorOccurred"
}
/**
 * String literal type derived from HookType enum values.
 */
export type HookTypeValue = `${HookType}`;
export declare const HOOKS_BY_TARGET: Record<Target, Record<string, HookType>>;
/**
 * Metadata for a hook type including localized label and description.
 */
export interface IHookTypeMeta {
    readonly label: string;
    readonly description: string;
}
/**
 * Metadata for hook types including localized labels and descriptions
 */
export declare const HOOK_METADATA: {
    [key in HookType]: IHookTypeMeta;
};
