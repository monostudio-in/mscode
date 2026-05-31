
import { __decorate, __param } from '../../../../../../../../../external/tslib/tslib.es6.js';
import { MarkdownString } from '../../../../../../base/common/htmlContent.js';
import '../../../../../../base/common/observableInternal/index.js';
import { isEqual } from '../../../../../../base/common/resources.js';
import { URI } from '../../../../../../base/common/uri.js';
import { CellUri } from '../../../../notebook/common/notebookCommon.js';
import { INotebookService } from '../../../../notebook/common/notebookService.service.js';
import { ICodeMapperService } from '../../editing/chatCodeMapperService.service.js';
import { IChatService } from '../../chatService/chatService.service.js';
import { ToolDataSource, ToolInvocationPresentation } from '../languageModelToolsService.js';
import { autorun } from '../../../../../../base/common/observableInternal/reactions/autorun.js';

const ExtensionEditToolId = "vscode_editFile";
const InternalEditToolId = "vscode_editFile_internal";
const EditToolData = {
    id: InternalEditToolId,
    displayName: "",
    modelDescription: "",
    source: ToolDataSource.Internal
};
let EditTool = class EditTool {
    constructor(chatService, codeMapperService, notebookService) {
        this.chatService = chatService;
        this.codeMapperService = codeMapperService;
        this.notebookService = notebookService;
    }
    async invoke(invocation, countTokens, _progress, token) {
        if (!invocation.context) {
            throw ( new Error("toolInvocationToken is required for this tool"));
        }
        const parameters = invocation.parameters;
        const fileUri = URI.revive(parameters.uri);
        const uri = CellUri.parse(fileUri)?.notebook || fileUri;
        const model = this.chatService.getSession(invocation.context.sessionResource);
        const request = model.getRequests().at(-1);
        model.acceptResponseProgress(request, {
            kind: "markdownContent",
            content: ( new MarkdownString("\n````\n"))
        });
        model.acceptResponseProgress(request, {
            kind: "codeblockUri",
            uri,
            isEdit: true
        });
        model.acceptResponseProgress(request, {
            kind: "markdownContent",
            content: ( new MarkdownString("\n````\n"))
        });
        if (this.notebookService.hasSupportedNotebooks(uri) && (this.notebookService.getNotebookTextModel(uri))) {
            model.acceptResponseProgress(request, {
                kind: "notebookEdit",
                edits: [],
                uri
            });
        } else {
            model.acceptResponseProgress(request, {
                kind: "textEdit",
                edits: [],
                uri
            });
        }
        const editSession = model.editingSession;
        if (!editSession) {
            throw ( new Error("This tool must be called from within an editing session"));
        }
        const result = await this.codeMapperService.mapCode({
            codeBlocks: [{
                code: parameters.code,
                resource: uri,
                markdownBeforeBlock: parameters.explanation
            }],
            location: "tool",
            chatRequestId: invocation.chatRequestId,
            chatRequestModel: invocation.modelId,
            chatSessionResource: invocation.context.sessionResource
        }, {
            textEdit: (target, edits) => {
                model.acceptResponseProgress(request, {
                    kind: "textEdit",
                    uri: target,
                    edits
                });
            },
            notebookEdit(target, edits) {
                model.acceptResponseProgress(request, {
                    kind: "notebookEdit",
                    uri: target,
                    edits
                });
            }
        }, token);
        if (this.notebookService.hasSupportedNotebooks(uri) && (this.notebookService.getNotebookTextModel(uri))) {
            model.acceptResponseProgress(request, {
                kind: "notebookEdit",
                uri,
                edits: [],
                done: true
            });
        } else {
            model.acceptResponseProgress(request, {
                kind: "textEdit",
                uri,
                edits: [],
                done: true
            });
        }
        if (result?.errorMessage) {
            throw ( new Error(result.errorMessage));
        }
        let dispose;
        await ( new Promise(resolve => {
            let wasFileBeingModified = false;
            dispose = autorun(r => {
                const entries = editSession.entries.read(r);
                const currentFile = entries?.find(e => isEqual(e.modifiedURI, uri));
                if (currentFile) {
                    if (currentFile.isCurrentlyBeingModifiedBy.read(r)) {
                        wasFileBeingModified = true;
                    } else if (wasFileBeingModified) {
                        resolve(true);
                    }
                }
            });
        })).finally(() => {
            dispose.dispose();
        });
        return {
            content: [{
                kind: "text",
                value: "The file was edited successfully"
            }]
        };
    }
    async prepareToolInvocation(context, token) {
        return {
            presentation: ToolInvocationPresentation.Hidden
        };
    }
};
EditTool = ( __decorate([( __param(0, IChatService)), ( __param(1, ICodeMapperService)), ( __param(2, INotebookService))], EditTool));

export { EditTool, EditToolData, ExtensionEditToolId, InternalEditToolId };
