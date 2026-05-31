
import { isFalsyOrEmpty } from '../../../base/common/arrays.js';
import { matchesSomeScheme, Schemas } from '../../../base/common/network.js';
import { URI } from '../../../base/common/uri.js';
import { isLocationLink } from '../../../editor/common/languages.js';
import { decodeSemanticTokensDto } from '../../../editor/common/services/semanticTokensDto.js';
import { validateWhenClauses } from '../../../platform/contextkey/common/contextkey.js';
import { ApiCommand, ApiCommandArgument, ApiCommandResult } from './extHostCommands.js';
import { DocumentHighlight, SymbolKind, Range, TextEdit, location, Hover, Position as Position$1, WorkspaceSymbol, CallHierarchyItem, CallHierarchyIncomingCall, CallHierarchyOutgoingCall, WorkspaceEdit, DocumentLink, CompletionItem, SignatureHelp, Selection as Selection$1, Color, ColorPresentation, InlayHint, FoldingRange, NotebookExclusiveDocumentPattern, InlineValueContext, InlineValue, ViewColumn, TextEditorOpenOptions, TypeHierarchyItem, DefinitionLink } from './extHostTypeConverters.js';
import { SelectionRange, SemanticTokensLegend, SemanticTokens, CompletionList, CodeLens, CodeAction, ColorInformation, Color as Color$1 } from './extHostTypes.js';
import { Position } from './extHostTypes/position.js';
import { Range as Range$1 } from './extHostTypes/range.js';
import { Selection } from './extHostTypes/selection.js';
import { SymbolInformation } from './extHostTypes/symbolInformation.js';
import { Location } from './extHostTypes/location.js';
import { CodeActionKind } from './extHostTypes/codeActionKind.js';

const newCommands = [(
new ApiCommand(
    "vscode.executeDocumentHighlights",
    "_executeDocumentHighlights",
    "Execute document highlight provider.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    ( new ApiCommandResult(
        "A promise that resolves to an array of DocumentHighlight-instances.",
        tryMapWith(DocumentHighlight.to)
    ))
)), (
new ApiCommand(
    "vscode.executeDocumentSymbolProvider",
    "_executeDocumentSymbolProvider",
    "Execute document symbol provider.",
    [ApiCommandArgument.Uri],
    ( new ApiCommandResult(
        "A promise that resolves to an array of SymbolInformation and DocumentSymbol instances.",
        (value, apiArgs) => {
            if (isFalsyOrEmpty(value)) {
                return undefined;
            }
            class MergedInfo extends SymbolInformation {
                constructor() {
                    super(...arguments);
                    this.containerName = "";
                }
                static to(symbol) {
                    const res = ( new MergedInfo(
                        symbol.name,
                        SymbolKind.to(symbol.kind),
                        symbol.containerName || "",
                        new Location(apiArgs[0], Range.to(symbol.range))
                    ));
                    res.detail = symbol.detail;
                    res.range = res.location.range;
                    res.selectionRange = Range.to(symbol.selectionRange);
                    res.children = symbol.children ? ( symbol.children.map(MergedInfo.to)) : [];
                    return res;
                }
            }
            return ( value.map(MergedInfo.to));
        }
    ))
)), (
new ApiCommand(
    "vscode.executeFormatDocumentProvider",
    "_executeFormatDocumentProvider",
    "Execute document format provider.",
    [ApiCommandArgument.Uri, ( new ApiCommandArgument("options", "Formatting options", _ => true, v => v))],
    ( new ApiCommandResult(
        "A promise that resolves to an array of TextEdits.",
        tryMapWith(TextEdit.to)
    ))
)), ( new ApiCommand(
    "vscode.executeFormatRangeProvider",
    "_executeFormatRangeProvider",
    "Execute range format provider.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Range, ( new ApiCommandArgument("options", "Formatting options", _ => true, v => v))],
    ( new ApiCommandResult(
        "A promise that resolves to an array of TextEdits.",
        tryMapWith(TextEdit.to)
    ))
)), ( new ApiCommand(
    "vscode.executeFormatOnTypeProvider",
    "_executeFormatOnTypeProvider",
    "Execute format on type provider.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position, ( new ApiCommandArgument("ch", "Trigger character", v => typeof v === "string", v => v)), ( new ApiCommandArgument("options", "Formatting options", _ => true, v => v))],
    ( new ApiCommandResult(
        "A promise that resolves to an array of TextEdits.",
        tryMapWith(TextEdit.to)
    ))
)), (
new ApiCommand(
    "vscode.executeDefinitionProvider",
    "_executeDefinitionProvider",
    "Execute all definition providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    ( new ApiCommandResult(
        "A promise that resolves to an array of Location or LocationLink instances.",
        mapLocationOrLocationLink
    ))
)), ( new ApiCommand(
    "vscode.experimental.executeDefinitionProvider_recursive",
    "_executeDefinitionProvider_recursive",
    "Execute all definition providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    ( new ApiCommandResult(
        "A promise that resolves to an array of Location or LocationLink instances.",
        mapLocationOrLocationLink
    ))
)), ( new ApiCommand(
    "vscode.executeTypeDefinitionProvider",
    "_executeTypeDefinitionProvider",
    "Execute all type definition providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    ( new ApiCommandResult(
        "A promise that resolves to an array of Location or LocationLink instances.",
        mapLocationOrLocationLink
    ))
)), ( new ApiCommand(
    "vscode.experimental.executeTypeDefinitionProvider_recursive",
    "_executeTypeDefinitionProvider_recursive",
    "Execute all type definition providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    ( new ApiCommandResult(
        "A promise that resolves to an array of Location or LocationLink instances.",
        mapLocationOrLocationLink
    ))
)), ( new ApiCommand(
    "vscode.executeDeclarationProvider",
    "_executeDeclarationProvider",
    "Execute all declaration providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    ( new ApiCommandResult(
        "A promise that resolves to an array of Location or LocationLink instances.",
        mapLocationOrLocationLink
    ))
)), ( new ApiCommand(
    "vscode.experimental.executeDeclarationProvider_recursive",
    "_executeDeclarationProvider_recursive",
    "Execute all declaration providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    ( new ApiCommandResult(
        "A promise that resolves to an array of Location or LocationLink instances.",
        mapLocationOrLocationLink
    ))
)), ( new ApiCommand(
    "vscode.executeImplementationProvider",
    "_executeImplementationProvider",
    "Execute all implementation providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    ( new ApiCommandResult(
        "A promise that resolves to an array of Location or LocationLink instances.",
        mapLocationOrLocationLink
    ))
)), ( new ApiCommand(
    "vscode.experimental.executeImplementationProvider_recursive",
    "_executeImplementationProvider_recursive",
    "Execute all implementation providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    ( new ApiCommandResult(
        "A promise that resolves to an array of Location or LocationLink instances.",
        mapLocationOrLocationLink
    ))
)), ( new ApiCommand(
    "vscode.executeReferenceProvider",
    "_executeReferenceProvider",
    "Execute all reference providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    ( new ApiCommandResult(
        "A promise that resolves to an array of Location-instances.",
        tryMapWith(location.to)
    ))
)), ( new ApiCommand(
    "vscode.experimental.executeReferenceProvider",
    "_executeReferenceProvider_recursive",
    "Execute all reference providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    ( new ApiCommandResult(
        "A promise that resolves to an array of Location-instances.",
        tryMapWith(location.to)
    ))
)), (
new ApiCommand(
    "vscode.executeHoverProvider",
    "_executeHoverProvider",
    "Execute all hover providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    ( new ApiCommandResult(
        "A promise that resolves to an array of Hover-instances.",
        tryMapWith(Hover.to)
    ))
)), ( new ApiCommand(
    "vscode.experimental.executeHoverProvider_recursive",
    "_executeHoverProvider_recursive",
    "Execute all hover providers.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    ( new ApiCommandResult(
        "A promise that resolves to an array of Hover-instances.",
        tryMapWith(Hover.to)
    ))
)), (
new ApiCommand(
    "vscode.executeSelectionRangeProvider",
    "_executeSelectionRangeProvider",
    "Execute selection range provider.",
    [ApiCommandArgument.Uri, ( new ApiCommandArgument(
        "position",
        "A position in a text document",
        v => Array.isArray(v) && v.every(v => Position.isPosition(v)),
        v => ( v.map(Position$1.from))
    ))],
    ( new ApiCommandResult("A promise that resolves to an array of ranges.", result => {
        return ( result.map(ranges => {
            let node;
            for (const range of ranges.reverse()) {
                node = new SelectionRange(Range.to(range), node);
            }
            return node;
        }));
    }))
)), (
new ApiCommand(
    "vscode.executeWorkspaceSymbolProvider",
    "_executeWorkspaceSymbolProvider",
    "Execute all workspace symbol providers.",
    [ApiCommandArgument.String.with("query", "Search string")],
    ( new ApiCommandResult(
        "A promise that resolves to an array of SymbolInformation-instances.",
        value => {
            return ( value.map(WorkspaceSymbol.to));
        }
    ))
)), (
new ApiCommand(
    "vscode.prepareCallHierarchy",
    "_executePrepareCallHierarchy",
    "Prepare call hierarchy at a position inside a document",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    ( new ApiCommandResult(
        "A promise that resolves to an array of CallHierarchyItem-instances",
        v => ( v.map(CallHierarchyItem.to))
    ))
)), ( new ApiCommand(
    "vscode.provideIncomingCalls",
    "_executeProvideIncomingCalls",
    "Compute incoming calls for an item",
    [ApiCommandArgument.CallHierarchyItem],
    ( new ApiCommandResult(
        "A promise that resolves to an array of CallHierarchyIncomingCall-instances",
        v => ( v.map(CallHierarchyIncomingCall.to))
    ))
)), ( new ApiCommand(
    "vscode.provideOutgoingCalls",
    "_executeProvideOutgoingCalls",
    "Compute outgoing calls for an item",
    [ApiCommandArgument.CallHierarchyItem],
    ( new ApiCommandResult(
        "A promise that resolves to an array of CallHierarchyOutgoingCall-instances",
        v => ( v.map(CallHierarchyOutgoingCall.to))
    ))
)), (
new ApiCommand(
    "vscode.prepareRename",
    "_executePrepareRename",
    "Execute the prepareRename of rename provider.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    ( new ApiCommandResult("A promise that resolves to a range and placeholder text.", value => {
        if (!value) {
            return undefined;
        }
        return {
            range: Range.to(value.range),
            placeholder: value.text
        };
    }))
)), ( new ApiCommand(
    "vscode.executeDocumentRenameProvider",
    "_executeDocumentRenameProvider",
    "Execute rename provider.",
    [
        ApiCommandArgument.Uri,
        ApiCommandArgument.Position,
        ApiCommandArgument.String.with("newName", "The new symbol name")
    ],
    ( new ApiCommandResult("A promise that resolves to a WorkspaceEdit.", value => {
        if (!value) {
            return undefined;
        }
        if (value.rejectReason) {
            throw ( new Error(value.rejectReason));
        }
        return WorkspaceEdit.to(value);
    }))
)), (
new ApiCommand(
    "vscode.executeLinkProvider",
    "_executeLinkProvider",
    "Execute document link provider.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Number.with(
        "linkResolveCount",
        "Number of links that should be resolved, only when links are unresolved."
    ).optional()],
    ( new ApiCommandResult(
        "A promise that resolves to an array of DocumentLink-instances.",
        value => ( value.map(DocumentLink.to))
    ))
)), (
new ApiCommand(
    "vscode.provideDocumentSemanticTokensLegend",
    "_provideDocumentSemanticTokensLegend",
    "Provide semantic tokens legend for a document",
    [ApiCommandArgument.Uri],
    ( new ApiCommandResult("A promise that resolves to SemanticTokensLegend.", value => {
        if (!value) {
            return undefined;
        }
        return new SemanticTokensLegend(value.tokenTypes, value.tokenModifiers);
    }))
)), ( new ApiCommand(
    "vscode.provideDocumentSemanticTokens",
    "_provideDocumentSemanticTokens",
    "Provide semantic tokens for a document",
    [ApiCommandArgument.Uri],
    ( new ApiCommandResult("A promise that resolves to SemanticTokens.", value => {
        if (!value) {
            return undefined;
        }
        const semanticTokensDto = decodeSemanticTokensDto(value);
        if (semanticTokensDto.type !== "full") {
            return undefined;
        }
        return new SemanticTokens(semanticTokensDto.data, undefined);
    }))
)), ( new ApiCommand(
    "vscode.provideDocumentRangeSemanticTokensLegend",
    "_provideDocumentRangeSemanticTokensLegend",
    "Provide semantic tokens legend for a document range",
    [ApiCommandArgument.Uri, ApiCommandArgument.Range.optional()],
    ( new ApiCommandResult("A promise that resolves to SemanticTokensLegend.", value => {
        if (!value) {
            return undefined;
        }
        return new SemanticTokensLegend(value.tokenTypes, value.tokenModifiers);
    }))
)), ( new ApiCommand(
    "vscode.provideDocumentRangeSemanticTokens",
    "_provideDocumentRangeSemanticTokens",
    "Provide semantic tokens for a document range",
    [ApiCommandArgument.Uri, ApiCommandArgument.Range],
    ( new ApiCommandResult("A promise that resolves to SemanticTokens.", value => {
        if (!value) {
            return undefined;
        }
        const semanticTokensDto = decodeSemanticTokensDto(value);
        if (semanticTokensDto.type !== "full") {
            return undefined;
        }
        return new SemanticTokens(semanticTokensDto.data, undefined);
    }))
)), (
new ApiCommand(
    "vscode.executeCompletionItemProvider",
    "_executeCompletionItemProvider",
    "Execute completion item provider.",
    [
        ApiCommandArgument.Uri,
        ApiCommandArgument.Position,
        ApiCommandArgument.String.with(
            "triggerCharacter",
            "Trigger completion when the user types the character, like `,` or `(`"
        ).optional(),
        ApiCommandArgument.Number.with(
            "itemResolveCount",
            "Number of completions to resolve (too large numbers slow down completions)"
        ).optional()
    ],
    ( new ApiCommandResult(
        "A promise that resolves to a CompletionList-instance.",
        (value, _args, converter) => {
            if (!value) {
                return new CompletionList([]);
            }
            const items = ( value.suggestions.map(suggestion => CompletionItem.to(suggestion, converter)));
            return new CompletionList(items, value.incomplete);
        }
    ))
)), (
new ApiCommand(
    "vscode.executeSignatureHelpProvider",
    "_executeSignatureHelpProvider",
    "Execute signature help provider.",
    [
        ApiCommandArgument.Uri,
        ApiCommandArgument.Position,
        ApiCommandArgument.String.with(
            "triggerCharacter",
            "Trigger signature help when the user types the character, like `,` or `(`"
        ).optional()
    ],
    ( new ApiCommandResult("A promise that resolves to SignatureHelp.", value => {
        if (value) {
            return SignatureHelp.to(value);
        }
        return undefined;
    }))
)), (
new ApiCommand(
    "vscode.executeCodeLensProvider",
    "_executeCodeLensProvider",
    "Execute code lens provider.",
    [ApiCommandArgument.Uri, ApiCommandArgument.Number.with(
        "itemResolveCount",
        "Number of lenses that should be resolved and returned. Will only return resolved lenses, will impact performance)"
    ).optional()],
    ( new ApiCommandResult(
        "A promise that resolves to an array of CodeLens-instances.",
        (value, _args, converter) => {
            return tryMapWith(item => {
                return new CodeLens(
                    Range.to(item.range),
                    item.command && converter.fromInternal(item.command)
                );
            })(value);
        }
    ))
)), (
new ApiCommand(
    "vscode.executeCodeActionProvider",
    "_executeCodeActionProvider",
    "Execute code action provider.",
    [ApiCommandArgument.Uri, ( new ApiCommandArgument(
        "rangeOrSelection",
        "Range in a text document. Some refactoring provider requires Selection object.",
        v => Range$1.isRange(v),
        v => Selection.isSelection(v) ? Selection$1.from(v) : Range.from(v)
    )), ApiCommandArgument.String.with("kind", "Code action kind to return code actions for").optional(), ApiCommandArgument.Number.with(
        "itemResolveCount",
        "Number of code actions to resolve (too large numbers slow down code actions)"
    ).optional()],
    ( new ApiCommandResult(
        "A promise that resolves to an array of Command-instances.",
        (value, _args, converter) => {
            return tryMapWith(codeAction => {
                if (codeAction._isSynthetic) {
                    if (!codeAction.command) {
                        throw ( new Error("Synthetic code actions must have a command"));
                    }
                    return converter.fromInternal(codeAction.command);
                } else {
                    const ret = new CodeAction(
                        codeAction.title,
                        codeAction.kind ? new CodeActionKind(codeAction.kind) : undefined
                    );
                    if (codeAction.edit) {
                        ret.edit = WorkspaceEdit.to(codeAction.edit);
                    }
                    if (codeAction.command) {
                        ret.command = converter.fromInternal(codeAction.command);
                    }
                    ret.isPreferred = codeAction.isPreferred;
                    return ret;
                }
            })(value);
        }
    ))
)), (
new ApiCommand(
    "vscode.executeDocumentColorProvider",
    "_executeDocumentColorProvider",
    "Execute document color provider.",
    [ApiCommandArgument.Uri],
    ( new ApiCommandResult(
        "A promise that resolves to an array of ColorInformation objects.",
        result => {
            if (result) {
                return ( result.map(
                    ci => new ColorInformation(Range.to(ci.range), Color.to(ci.color))
                ));
            }
            return [];
        }
    ))
)), ( new ApiCommand(
    "vscode.executeColorPresentationProvider",
    "_executeColorPresentationProvider",
    "Execute color presentation provider.",
    [( new ApiCommandArgument(
        "color",
        "The color to show and insert",
        v => v instanceof Color$1,
        Color.from
    )), ( new ApiCommandArgument("context", "Context object with uri and range", _v => true, v => ({
        uri: v.uri,
        range: Range.from(v.range)
    })))],
    ( new ApiCommandResult(
        "A promise that resolves to an array of ColorPresentation objects.",
        result => {
            if (result) {
                return ( result.map(ColorPresentation.to));
            }
            return [];
        }
    ))
)), (
new ApiCommand(
    "vscode.executeInlayHintProvider",
    "_executeInlayHintProvider",
    "Execute inlay hints provider",
    [ApiCommandArgument.Uri, ApiCommandArgument.Range],
    ( new ApiCommandResult(
        "A promise that resolves to an array of Inlay objects",
        (result, args, converter) => {
            return ( result.map(InlayHint.to.bind(undefined, converter)));
        }
    ))
)), (
new ApiCommand(
    "vscode.executeFoldingRangeProvider",
    "_executeFoldingRangeProvider",
    "Execute folding range provider",
    [ApiCommandArgument.Uri],
    ( new ApiCommandResult(
        "A promise that resolves to an array of FoldingRange objects",
        (result, args) => {
            if (result) {
                return ( result.map(FoldingRange.to));
            }
            return undefined;
        }
    ))
)), (
new ApiCommand(
    "vscode.resolveNotebookContentProviders",
    "_resolveNotebookContentProvider",
    "Resolve Notebook Content Providers",
    [],
    ( new ApiCommandResult(
        "A promise that resolves to an array of NotebookContentProvider static info objects.",
        tryMapWith(item => {
            return {
                viewType: item.viewType,
                displayName: item.displayName,
                options: {
                    transientOutputs: item.options.transientOutputs,
                    transientCellMetadata: item.options.transientCellMetadata,
                    transientDocumentMetadata: item.options.transientDocumentMetadata
                },
                filenamePattern: ( item.filenamePattern.map(pattern => NotebookExclusiveDocumentPattern.to(pattern)))
            };
        })
    ))
)), (
new ApiCommand(
    "vscode.executeInlineValueProvider",
    "_executeInlineValueProvider",
    "Execute inline value provider",
    [ApiCommandArgument.Uri, ApiCommandArgument.Range, ( new ApiCommandArgument(
        "context",
        "An InlineValueContext",
        v => v && typeof v.frameId === "number" && v.stoppedLocation instanceof Range$1,
        v => InlineValueContext.from(v)
    ))],
    ( new ApiCommandResult("A promise that resolves to an array of InlineValue objects", result => {
        return ( result.map(InlineValue.to));
    }))
)), (
new ApiCommand(
    "vscode.open",
    "_workbench.open",
    "Opens the provided resource in the editor. Can be a text or binary file, or an http(s) URL. If you need more control over the options for opening a text file, use vscode.window.showTextDocument instead.",
    [( new ApiCommandArgument(
        "uriOrString",
        "Uri-instance or string (only http/https)",
        v => URI.isUri(v) || (typeof v === "string" && matchesSomeScheme(v, Schemas.http, Schemas.https)),
        v => v
    )), ( new ApiCommandArgument(
        "columnOrOptions",
        "Either the column in which to open or editor options, see vscode.TextDocumentShowOptions",
        v => v === undefined || typeof v === "number" || typeof v === "object",
        v => !v ? v : typeof v === "number" ? [ViewColumn.from(v), undefined] : [
            ViewColumn.from(v.viewColumn),
            TextEditorOpenOptions.from(v)
        ]
    )).optional(), ApiCommandArgument.String.with("label", "").optional()],
    ApiCommandResult.Void
)), ( new ApiCommand(
    "vscode.openWith",
    "_workbench.openWith",
    "Opens the provided resource with a specific editor.",
    [
        ApiCommandArgument.Uri.with("resource", "Resource to open"),
        ApiCommandArgument.String.with(
            "viewId",
            "Custom editor view id. This should be the viewType string for custom editors or the notebookType string for notebooks. Use 'default' to use VS Code's default text editor"
        ),
        ( new ApiCommandArgument(
            "columnOrOptions",
            "Either the column in which to open or editor options, see vscode.TextDocumentShowOptions",
            v => v === undefined || typeof v === "number" || typeof v === "object",
            v => !v ? v : typeof v === "number" ? [ViewColumn.from(v), undefined] : [
                ViewColumn.from(v.viewColumn),
                TextEditorOpenOptions.from(v)
            ]
        )).optional()
    ],
    ApiCommandResult.Void
)), ( new ApiCommand(
    "vscode.diff",
    "_workbench.diff",
    "Opens the provided resources in the diff editor to compare their contents.",
    [
        ApiCommandArgument.Uri.with("left", "Left-hand side resource of the diff editor"),
        ApiCommandArgument.Uri.with("right", "Right-hand side resource of the diff editor"),
        ApiCommandArgument.String.with("title", "Human readable title for the diff editor").optional(),
        ( new ApiCommandArgument(
            "columnOrOptions",
            "Either the column in which to open or editor options, see vscode.TextDocumentShowOptions",
            v => v === undefined || typeof v === "object",
            v => v && [
                ViewColumn.from(v.viewColumn),
                TextEditorOpenOptions.from(v)
            ]
        )).optional()
    ],
    ApiCommandResult.Void
)), ( new ApiCommand(
    "vscode.changes",
    "_workbench.changes",
    "Opens a list of resources in the changes editor to compare their contents.",
    [
        ApiCommandArgument.String.with("title", "Human readable title for the changes editor"),
        ( new ApiCommandArgument("resourceList", "List of resources to compare", resources => {
            for (const resource of resources) {
                if (resource.length !== 3) {
                    return false;
                }
                const [label, left, right] = resource;
                if (!URI.isUri(label) || (!URI.isUri(left) && left !== undefined && left !== null) || (!URI.isUri(right) && right !== undefined && right !== null)) {
                    return false;
                }
            }
            return true;
        }, v => v))
    ],
    ApiCommandResult.Void
)), (
new ApiCommand(
    "vscode.prepareTypeHierarchy",
    "_executePrepareTypeHierarchy",
    "Prepare type hierarchy at a position inside a document",
    [ApiCommandArgument.Uri, ApiCommandArgument.Position],
    ( new ApiCommandResult(
        "A promise that resolves to an array of TypeHierarchyItem-instances",
        v => ( v.map(TypeHierarchyItem.to))
    ))
)), ( new ApiCommand(
    "vscode.provideSupertypes",
    "_executeProvideSupertypes",
    "Compute supertypes for an item",
    [ApiCommandArgument.TypeHierarchyItem],
    ( new ApiCommandResult(
        "A promise that resolves to an array of TypeHierarchyItem-instances",
        v => ( v.map(TypeHierarchyItem.to))
    ))
)), ( new ApiCommand(
    "vscode.provideSubtypes",
    "_executeProvideSubtypes",
    "Compute subtypes for an item",
    [ApiCommandArgument.TypeHierarchyItem],
    ( new ApiCommandResult(
        "A promise that resolves to an array of TypeHierarchyItem-instances",
        v => ( v.map(TypeHierarchyItem.to))
    ))
)), (
new ApiCommand(
    "vscode.revealTestInExplorer",
    "_revealTestInExplorer",
    "Reveals a test instance in the explorer",
    [ApiCommandArgument.TestItem],
    ApiCommandResult.Void
)), ( new ApiCommand(
    "vscode.startContinuousTestRun",
    "testing.startContinuousRunFromExtension",
    "Starts running the given tests with continuous run mode.",
    [
        ApiCommandArgument.TestProfile,
        ApiCommandArgument.Arr(ApiCommandArgument.TestItem)
    ],
    ApiCommandResult.Void
)), ( new ApiCommand(
    "vscode.stopContinuousTestRun",
    "testing.stopContinuousRunFromExtension",
    "Stops running the given tests with continuous run mode.",
    [ApiCommandArgument.Arr(ApiCommandArgument.TestItem)],
    ApiCommandResult.Void
)), (
new ApiCommand(
    "vscode.experimental.editSession.continue",
    "_workbench.editSessions.actions.continueEditSession",
    "Continue the current edit session in a different workspace",
    [ApiCommandArgument.Uri.with(
        "workspaceUri",
        "The target workspace to continue the current edit session in"
    )],
    ApiCommandResult.Void
)), (
new ApiCommand(
    "setContext",
    "_setContext",
    "Set a custom context key value that can be used in when clauses.",
    [
        ApiCommandArgument.String.with("name", "The context key name"),
        ( new ApiCommandArgument("value", "The context key value", () => true, v => v))
    ],
    ApiCommandResult.Void
)), (
new ApiCommand(
    "vscode.editorChat.start",
    "inlineChat.start",
    "Invoke a new editor chat session",
    [( new ApiCommandArgument("Run arguments", "", _v => true, v => {
        if (!v) {
            return undefined;
        }
        return {
            initialRange: v.initialRange ? Range.from(v.initialRange) : undefined,
            initialSelection: Selection.isSelection(v.initialSelection) ? Selection$1.from(v.initialSelection) : undefined,
            message: v.message,
            attachments: v.attachments,
            autoSend: v.autoSend,
            position: v.position ? Position$1.from(v.position) : undefined,
            resolveOnResponse: v.resolveOnResponse
        };
    }))],
    ApiCommandResult.Void
)), (
new ApiCommand(
    "vscode.extensionPromptFileProvider",
    "_listExtensionPromptFiles",
    "Get all extension-contributed prompt files (custom agents, instructions, and prompt files).",
    [],
    ( new ApiCommandResult(
        "A promise that resolves to an array of objects containing uri, type, and extensionId.",
        value => {
            if (!value) {
                return [];
            }
            return ( value.map(item => ({
                uri: URI.revive(item.uri),
                type: item.type,
                extensionId: item.extensionId
            })));
        }
    ))
))];
class ExtHostApiCommands {
    static register(commands) {
        newCommands.forEach(commands.registerApiCommand, commands);
        this._registerValidateWhenClausesCommand(commands);
    }
    static _registerValidateWhenClausesCommand(commands) {
        commands.registerCommand(false, "_validateWhenClauses", validateWhenClauses);
    }
}
function tryMapWith(f) {
    return value => {
        if (Array.isArray(value)) {
            return ( value.map(f));
        }
        return undefined;
    };
}
function mapLocationOrLocationLink(values) {
    if (!Array.isArray(values)) {
        return undefined;
    }
    const result = [];
    for (const item of values) {
        if (isLocationLink(item)) {
            result.push(DefinitionLink.to(item));
        } else {
            result.push(location.to(item));
        }
    }
    return result;
}

export { ExtHostApiCommands };
