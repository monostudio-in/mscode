import { URI } from "../../../../../../base/common/uri.js";
import { PromptHeader } from "../promptFileParser.js";
import { PromptsType, Target } from "../promptTypes.js";
export declare namespace GithubPromptHeaderAttributes {
    const mcpServers = "mcp-servers";
    const github = "github";
}
export declare namespace ClaudeHeaderAttributes {
    const disallowedTools = "disallowedTools";
}
export declare function isTarget(value: unknown): value is Target;
interface IAttributeDefinition {
    readonly type: string;
    readonly description: string;
    readonly defaults?: readonly string[];
    readonly items?: readonly {
        name: string;
        description?: string;
    }[];
    readonly enums?: readonly {
        name: string;
        description?: string;
    }[];
}
export declare const promptFileAttributes: Record<string, IAttributeDefinition>;
export declare const instructionAttributes: Record<string, IAttributeDefinition>;
export declare const customAgentAttributes: Record<string, IAttributeDefinition>;
export declare const skillAttributes: Record<string, IAttributeDefinition>;
export declare function getValidAttributeNames(promptType: PromptsType, includeNonRecommended: boolean, target: Target): string[];
export declare function isNonRecommendedAttribute(attributeName: string): boolean;
export declare function getAttributeDefinition(attributeName: string, promptType: PromptsType, target: Target): IAttributeDefinition | undefined;
export declare const knownGithubCopilotTools: {
    name: string;
    description: string;
}[];
export interface IValueEntry {
    readonly name: string;
    readonly description?: string;
}
export declare const knownClaudeTools: {
    name: string;
    description: string;
    toolEquivalent: string[];
}[];
export declare const knownClaudeModels: ({
    name: string;
    description: string;
    modelEquivalent: string;
} | {
    name: string;
    description: string;
    modelEquivalent: undefined;
})[];
export declare function mapClaudeModels(claudeModelNames: readonly string[]): readonly string[];
/**
 * Maps Claude tool names to their VS Code tool equivalents.
 */
export declare function mapClaudeTools(claudeToolNames: readonly string[]): string[];
export declare const claudeAgentAttributes: Record<string, IAttributeDefinition>;
/**
 * Attributes supported in Claude rules files (`.claude/rules/*.md`).
 * Claude rules use `paths` instead of `applyTo` for glob patterns.
 */
export declare const claudeRulesAttributes: Record<string, IAttributeDefinition>;
export declare function isVSCodeOrDefaultTarget(target: Target): boolean;
export declare function getTarget(promptType: PromptsType, header: PromptHeader | URI): Target;
export {};
