import type { create as createEditor, createDiffEditor } from "monaco-editor/vscode/vs/editor/standalone/browser/standaloneEditor";
import { errorHandler, setUnexpectedErrorHandler } from "./vscode/src/vs/base/common/errors.js";
import { FoldingModel, setCollapseStateForMatchingLines } from "./vscode/src/vs/editor/contrib/folding/browser/foldingModel.js";
import { FoldingController } from "./vscode/src/vs/editor/contrib/folding/browser/folding.js";
import { DisposableStore, type IDisposable, type IReference } from "./vscode/src/vs/base/common/lifecycle.js";
import { Registry } from "./vscode/src/vs/platform/registry/common/platform.js";
import { type IJSONContributionRegistry } from "./vscode/src/vs/platform/jsonschemas/common/jsonContributionRegistry.js";
import { CommandsRegistry } from "./vscode/src/vs/platform/commands/common/commands.js";
import { MenuRegistry, MenuId } from "./vscode/src/vs/platform/actions/common/actions.js";
import { KeybindingsRegistry } from "./vscode/src/vs/platform/keybinding/common/keybindingsRegistry.js";
import type { IJSONSchema } from "./vscode/src/vs/base/common/jsonSchema.js";
import { registerColor } from "./vscode/src/vs/platform/theme/common/colorRegistry.js";
import { URI } from "./vscode/src/vs/base/common/uri.js";
import type { IFileDeleteOptions } from "./vscode/src/vs/platform/files/common/files.js";
import type { ITextFileEditorModel } from "./vscode/src/vs/workbench/services/textfile/common/textfiles.js";
import { ContextKeyExpr, RawContextKey } from "./vscode/src/vs/platform/contextkey/common/contextkey.js";
import { KeybindingResolver } from "./vscode/src/vs/platform/keybinding/common/keybindingResolver.js";
import { ResolvedKeybindingItem } from "./vscode/src/vs/platform/keybinding/common/resolvedKeybindingItem.js";
import { Event } from "./vscode/src/vs/base/common/event.js";
import { IKeybindingService } from "./vscode/src/vs/platform/keybinding/common/keybinding.service.js";
export { EditorContributionInstantiation, registerEditorAction, registerEditorContribution, registerDiffEditorContribution, registerMultiEditorAction, EditorAction, EditorCommand } from "./vscode/src/vs/editor/browser/editorExtensions.js";
export type { IEditorContribution, IDiffEditorContribution } from "./vscode/src/vs/editor/common/editorCommon.js";
export type { ITextFileEditorModelSaveEvent } from "./vscode/src/vs/workbench/services/textfile/common/textfiles.js";
export declare function writeFile(uri: URI, content: string): Promise<void>;
export declare function deleteFile(uri: URI, options?: Partial<IFileDeleteOptions>): Promise<void>;
export declare function createModelReference(resource: URI, content?: string): Promise<IReference<ITextFileEditorModel>>;
export interface KeybindingProvider {
    provideKeybindings(): ResolvedKeybindingItem[];
    onDidChangeKeybindings: Event<void>;
}
export interface DynamicKeybindingService extends IKeybindingService {
    registerKeybindingProvider(provider: KeybindingProvider): IDisposable;
    _getResolver(): KeybindingResolver;
}
export declare const createConfiguredEditor: typeof createEditor;
export declare const createConfiguredDiffEditor: typeof createDiffEditor;
declare const Extensions: {
    Configuration: string;
    JSONContribution: string;
};
export { errorHandler, DisposableStore, FoldingController, FoldingModel, setCollapseStateForMatchingLines, Registry, CommandsRegistry, Extensions, MenuRegistry, MenuId, KeybindingsRegistry, ContextKeyExpr, RawContextKey, registerColor, setUnexpectedErrorHandler };
export type { IJSONContributionRegistry, IJSONSchema, IReference, ITextFileEditorModel };
