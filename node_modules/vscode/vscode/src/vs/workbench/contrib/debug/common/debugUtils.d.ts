import { IDebuggerContribution, IDebugSession, IConfig, IConfigPresentation } from "./debug.js";
import { IEditorService } from "../../../services/editor/common/editorService.service.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { Position } from "../../../../editor/common/core/position.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.service.js";
import { OperatingSystem } from "../../../../base/common/platform.js";
export declare function formatPII(value: string, excludePII: boolean, args: {
    [key: string]: string;
} | undefined): string;
/**
 * Filters exceptions (keys marked with "!") from the given object. Used to
 * ensure exception data is not sent on web remotes, see #97628.
 */
export declare function filterExceptionsFromTelemetry<T extends {
    [key: string]: unknown;
}>(data: T): Partial<T>;
export declare function isSessionAttach(session: IDebugSession): boolean;
/**
 * Returns the session or any parent which is an extension host debug session.
 * Returns undefined if there's none.
 */
export declare function getExtensionHostDebugSession(session: IDebugSession): IDebugSession | void;
export declare function isDebuggerMainContribution(dbg: IDebuggerContribution): string | undefined;
/**
 * Note- uses 1-indexed numbers
 */
export declare function getExactExpressionStartAndEnd(lineContent: string, looseStart: number, looseEnd: number): {
    start: number;
    end: number;
};
export declare function getEvaluatableExpressionAtPosition(languageFeaturesService: ILanguageFeaturesService, model: ITextModel, position: Position, token?: CancellationToken): Promise<{
    range: IRange;
    matchingExpression: string;
} | null>;
export declare function isUriString(s: string | undefined): boolean;
export declare function convertToDAPaths(message: DebugProtocol.ProtocolMessage, toUri: boolean): DebugProtocol.ProtocolMessage;
export declare function convertToVSCPaths(message: DebugProtocol.ProtocolMessage, toUri: boolean): DebugProtocol.ProtocolMessage;
export declare function getVisibleAndSorted<T extends {
    presentation?: IConfigPresentation;
}>(array: T[]): T[];
export declare function saveAllBeforeDebugStart(configurationService: IConfigurationService, editorService: IEditorService): Promise<void>;
export declare const sourcesEqual: (a: DebugProtocol.Source | undefined, b: DebugProtocol.Source | undefined) => boolean;
/**
 * Resolves the best child session to focus when a parent session is selected.
 * Always prefer child sessions over parent wrapper sessions to ensure console responsiveness.
 * Fixes issue #152407: Using debug console picker when not paused leaves console unresponsive.
 */
export declare function resolveChildSession(session: IDebugSession, allSessions: readonly IDebugSession[]): IDebugSession;
export declare function getEffectiveConfigForPlatform(config: IConfig, os?: OperatingSystem): IConfig;
export declare function getEffectivePresentationForConfig(config: IConfig, os?: OperatingSystem): IConfigPresentation | undefined;
