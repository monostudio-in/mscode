
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { streamToBuffer } from '../../../../base/common/buffer.js';
import { CancellationError } from '../../../../base/common/errors.js';
import { Emitter } from '../../../../base/common/event.js';
import { DisposableStore, Disposable } from '../../../../base/common/lifecycle.js';
import { Schemas } from '../../../../base/common/network.js';
import { hasKey, assertType } from '../../../../base/common/types.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.service.js';
import { FileOperationError, FileOperationResult } from '../../../../platform/files/common/files.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.service.js';
import { EditorModel } from '../../../common/editor/editorModel.js';
import { NotebookCellsChangeType, NotebookSetting } from './notebookCommon.js';
import { INotebookLoggingService } from './notebookLoggingService.service.js';
import { SimpleNotebookProviderInfo } from './notebookService.js';
import { INotebookService } from './notebookService.service.js';
import { IFilesConfigurationService } from '../../../services/filesConfiguration/common/filesConfigurationService.service.js';
import { StoredFileWorkingCopyState } from '../../../services/workingCopy/common/storedFileWorkingCopy.js';
import { WorkingCopyCapabilities } from '../../../services/workingCopy/common/workingCopy.js';

var SimpleNotebookEditorModel_1;
let SimpleNotebookEditorModel = SimpleNotebookEditorModel_1 = class SimpleNotebookEditorModel extends EditorModel {
    constructor(
        resource,
        _hasAssociatedFilePath,
        viewType,
        _workingCopyManager,
        scratchpad,
        _filesConfigurationService
    ) {
        super();
        this.resource = resource;
        this._hasAssociatedFilePath = _hasAssociatedFilePath;
        this.viewType = viewType;
        this._workingCopyManager = _workingCopyManager;
        this._filesConfigurationService = _filesConfigurationService;
        this._onDidChangeDirty = this._register(( new Emitter()));
        this._onDidSave = this._register(( new Emitter()));
        this._onDidChangeOrphaned = this._register(( new Emitter()));
        this._onDidChangeReadonly = this._register(( new Emitter()));
        this._onDidRevertUntitled = this._register(( new Emitter()));
        this.onDidChangeDirty = this._onDidChangeDirty.event;
        this.onDidSave = this._onDidSave.event;
        this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
        this.onDidChangeReadonly = this._onDidChangeReadonly.event;
        this.onDidRevertUntitled = this._onDidRevertUntitled.event;
        this._workingCopyListeners = this._register(( new DisposableStore()));
        this.scratchPad = scratchpad;
    }
    dispose() {
        this._workingCopy?.dispose();
        super.dispose();
    }
    get notebook() {
        return this._workingCopy?.model?.notebookModel;
    }
    isResolved() {
        return Boolean(this._workingCopy?.model?.notebookModel);
    }
    async canDispose() {
        if (!this._workingCopy) {
            return true;
        }
        if (SimpleNotebookEditorModel_1._isStoredFileWorkingCopy(this._workingCopy)) {
            return this._workingCopyManager.stored.canDispose(this._workingCopy);
        } else {
            return true;
        }
    }
    isDirty() {
        return this._workingCopy?.isDirty() ?? false;
    }
    isModified() {
        return this._workingCopy?.isModified() ?? false;
    }
    isOrphaned() {
        return SimpleNotebookEditorModel_1._isStoredFileWorkingCopy(this._workingCopy) && this._workingCopy.hasState(StoredFileWorkingCopyState.ORPHAN);
    }
    hasAssociatedFilePath() {
        return !SimpleNotebookEditorModel_1._isStoredFileWorkingCopy(this._workingCopy) && !!this._workingCopy?.hasAssociatedFilePath;
    }
    isReadonly() {
        if (SimpleNotebookEditorModel_1._isStoredFileWorkingCopy(this._workingCopy)) {
            return this._workingCopy?.isReadonly();
        } else {
            return this._filesConfigurationService.isReadonly(this.resource);
        }
    }
    get hasErrorState() {
        if (this._workingCopy && hasKey(this._workingCopy, {
            hasState: true
        })) {
            return this._workingCopy.hasState(StoredFileWorkingCopyState.ERROR);
        }
        return false;
    }
    async revert(options) {
        assertType(this.isResolved());
        return this._workingCopy.revert(options);
    }
    async save(options) {
        assertType(this.isResolved());
        return this._workingCopy.save(options);
    }
    async load(options) {
        if (!this._workingCopy || !this._workingCopy.model) {
            if (this.resource.scheme === Schemas.untitled) {
                if (this._hasAssociatedFilePath) {
                    this._workingCopy = await this._workingCopyManager.resolve({
                        associatedResource: this.resource
                    });
                } else {
                    this._workingCopy = await this._workingCopyManager.resolve({
                        untitledResource: this.resource,
                        isScratchpad: this.scratchPad
                    });
                }
                this._register(this._workingCopy.onDidRevert(() => this._onDidRevertUntitled.fire()));
            } else {
                this._workingCopy = await this._workingCopyManager.resolve(this.resource, {
                    limits: options?.limits,
                    reload: options?.forceReadFromFile ? {
                        async: false,
                        force: true
                    } : undefined
                });
                this._workingCopyListeners.add(this._workingCopy.onDidSave(e => this._onDidSave.fire(e)));
                this._workingCopyListeners.add(
                    this._workingCopy.onDidChangeOrphaned(() => this._onDidChangeOrphaned.fire())
                );
                this._workingCopyListeners.add(
                    this._workingCopy.onDidChangeReadonly(() => this._onDidChangeReadonly.fire())
                );
            }
            this._workingCopyListeners.add(
                this._workingCopy.onDidChangeDirty(() => this._onDidChangeDirty.fire(), undefined)
            );
            this._workingCopyListeners.add(this._workingCopy.onWillDispose(() => {
                this._workingCopyListeners.clear();
                this._workingCopy?.model?.dispose();
            }));
        } else {
            await this._workingCopyManager.resolve(this.resource, {
                reload: {
                    async: !options?.forceReadFromFile,
                    force: options?.forceReadFromFile
                },
                limits: options?.limits
            });
        }
        assertType(this.isResolved());
        return this;
    }
    async saveAs(target) {
        const newWorkingCopy = await this._workingCopyManager.saveAs(this.resource, target);
        if (!newWorkingCopy) {
            return undefined;
        }
        return {
            resource: newWorkingCopy.resource
        };
    }
    static _isStoredFileWorkingCopy(candidate) {
        const isUntitled = candidate && candidate.capabilities & WorkingCopyCapabilities.Untitled;
        return !isUntitled;
    }
};
SimpleNotebookEditorModel = SimpleNotebookEditorModel_1 = ( __decorate([( __param(5, IFilesConfigurationService))], SimpleNotebookEditorModel));
class NotebookFileWorkingCopyModel extends Disposable {
    constructor(
        _notebookModel,
        _notebookService,
        _configurationService,
        _telemetryService,
        _notebookLogService
    ) {
        super();
        this._notebookModel = _notebookModel;
        this._notebookService = _notebookService;
        this._configurationService = _configurationService;
        this._telemetryService = _telemetryService;
        this._notebookLogService = _notebookLogService;
        this._onDidChangeContent = this._register(( new Emitter()));
        this.onDidChangeContent = this._onDidChangeContent.event;
        this.configuration = undefined;
        this.onWillDispose = _notebookModel.onWillDispose.bind(_notebookModel);
        this._register(_notebookModel.onDidChangeContent(e => {
            for (const rawEvent of e.rawEvents) {
                if (rawEvent.kind === NotebookCellsChangeType.Initialize) {
                    continue;
                }
                if (rawEvent.transient) {
                    continue;
                }
                this._onDidChangeContent.fire({
                    isRedoing: false,
                    isUndoing: false,
                    isInitial: false
                });
                break;
            }
        }));
        const saveWithReducedCommunication = this._configurationService.getValue(NotebookSetting.remoteSaving);
        if (saveWithReducedCommunication || _notebookModel.uri.scheme === Schemas.vscodeRemote) {
            this.configuration = {
                backupDelay: 10000
            };
        }
        if (saveWithReducedCommunication) {
            this.setSaveDelegate().catch(
                error => this._notebookLogService.error("WorkingCopyModel", `Failed to set save delegate: ${error}`)
            );
        }
    }
    async setSaveDelegate() {
        await this.getNotebookSerializer();
        this.save = async (options, token) => {
            try {
                let serializer = this._notebookService.tryGetDataProviderSync(this.notebookModel.viewType)?.serializer;
                if (!serializer) {
                    this._notebookLogService.info(
                        "WorkingCopyModel",
                        "No serializer found for notebook model, checking if provider still needs to be resolved"
                    );
                    serializer = await this.getNotebookSerializer().catch(error => {
                        this._notebookLogService.error("WorkingCopyModel", `Failed to get notebook serializer: ${error}`);
                        this.save = undefined;
                        throw ( new NotebookSaveError("Failed to get notebook serializer"));
                    });
                }
                if (token.isCancellationRequested) {
                    throw ( new CancellationError());
                }
                const stat = await serializer.save(this._notebookModel.uri, this._notebookModel.versionId, options, token);
                return stat;
            } catch (error) {
                if (!token.isCancellationRequested && error.name !== "Canceled") {
                    const isIPynb = this._notebookModel.viewType === "jupyter-notebook" || this._notebookModel.viewType === "interactive";
                    const errorMessage = getSaveErrorMessage(error);
                    this._telemetryService.publicLogError2("notebook/SaveError", {
                        isRemote: this._notebookModel.uri.scheme === Schemas.vscodeRemote,
                        isIPyNbWorkerSerializer: isIPynb && this._configurationService.getValue("ipynb.experimental.serialization"),
                        error: errorMessage
                    });
                }
                throw error;
            }
        };
    }
    dispose() {
        this._notebookModel.dispose();
        super.dispose();
    }
    get notebookModel() {
        return this._notebookModel;
    }
    async snapshot(context, token) {
        return this._notebookService.createNotebookTextDocumentSnapshot(this._notebookModel.uri, context, token);
    }
    async update(stream, token) {
        const serializer = await this.getNotebookSerializer();
        const bytes = await streamToBuffer(stream);
        const data = await serializer.dataToNotebook(bytes);
        if (token.isCancellationRequested) {
            throw ( new CancellationError());
        }
        this._notebookLogService.info(
            "WorkingCopyModel",
            "Notebook content updated from file system - " + ( this._notebookModel.uri.toString())
        );
        this._notebookModel.reset(data.cells, data.metadata, serializer.options);
    }
    async getNotebookSerializer() {
        const info = await this._notebookService.withNotebookDataProvider(this.notebookModel.viewType);
        if (!(info instanceof SimpleNotebookProviderInfo)) {
            const message = "CANNOT open notebook with this provider";
            throw ( new NotebookSaveError(message));
        }
        return info.serializer;
    }
    get versionId() {
        return this._notebookModel.alternativeVersionId;
    }
    pushStackElement() {
        this._notebookModel.pushStackElement();
    }
}
let NotebookFileWorkingCopyModelFactory = class NotebookFileWorkingCopyModelFactory {
    constructor(
        _viewType,
        _notebookService,
        _configurationService,
        _telemetryService,
        _notebookLogService
    ) {
        this._viewType = _viewType;
        this._notebookService = _notebookService;
        this._configurationService = _configurationService;
        this._telemetryService = _telemetryService;
        this._notebookLogService = _notebookLogService;
    }
    async createModel(resource, stream, token) {
        const notebookModel = this._notebookService.getNotebookTextModel(resource) ?? (await this._notebookService.createNotebookTextModel(this._viewType, resource, stream));
        return ( new NotebookFileWorkingCopyModel(
            notebookModel,
            this._notebookService,
            this._configurationService,
            this._telemetryService,
            this._notebookLogService
        ));
    }
};
NotebookFileWorkingCopyModelFactory = ( __decorate([( __param(1, INotebookService)), ( __param(2, IConfigurationService)), ( __param(3, ITelemetryService)), ( __param(4, INotebookLoggingService))], NotebookFileWorkingCopyModelFactory));
class NotebookSaveError extends Error {
    constructor(message) {
        super(message);
        this.name = "NotebookSaveError";
    }
}
function getSaveErrorMessage(error) {
    if (error.name === "NotebookSaveError") {
        return error.message;
    } else if (error instanceof FileOperationError) {
        switch (error.fileOperationResult) {
        case FileOperationResult.FILE_IS_DIRECTORY:
            return "File is a directory";
        case FileOperationResult.FILE_NOT_FOUND:
            return "File not found";
        case FileOperationResult.FILE_NOT_MODIFIED_SINCE:
            return "File not modified since";
        case FileOperationResult.FILE_MODIFIED_SINCE:
            return "File modified since";
        case FileOperationResult.FILE_MOVE_CONFLICT:
            return "File move conflict";
        case FileOperationResult.FILE_WRITE_LOCKED:
            return "File write locked";
        case FileOperationResult.FILE_PERMISSION_DENIED:
            return "File permission denied";
        case FileOperationResult.FILE_TOO_LARGE:
            return "File too large";
        case FileOperationResult.FILE_INVALID_PATH:
            return "File invalid path";
        case FileOperationResult.FILE_NOT_DIRECTORY:
            return "File not directory";
        case FileOperationResult.FILE_OTHER_ERROR:
            return "File other error";
        }
    }
    return "Unknown error";
}

export { NotebookFileWorkingCopyModel, NotebookFileWorkingCopyModelFactory, SimpleNotebookEditorModel };
