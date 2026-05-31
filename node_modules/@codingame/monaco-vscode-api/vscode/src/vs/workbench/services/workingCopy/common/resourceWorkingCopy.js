
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { timeout } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { FileChangeType } from '../../../../platform/files/common/files.js';
import { IFileService } from '../../../../platform/files/common/files.service.js';

let ResourceWorkingCopy = class ResourceWorkingCopy extends Disposable {
    constructor(resource, fileService) {
        super();
        this.resource = resource;
        this.fileService = fileService;
        this._onDidChangeOrphaned = this._register(( new Emitter()));
        this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
        this.orphaned = false;
        this._onWillDispose = this._register(( new Emitter()));
        this.onWillDispose = this._onWillDispose.event;
        this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
    }
    isOrphaned() {
        return this.orphaned;
    }
    async onDidFilesChange(e) {
        let fileEventImpactsUs = false;
        let newInOrphanModeGuess;
        if (this.orphaned) {
            const fileWorkingCopyResourceAdded = e.contains(this.resource, FileChangeType.ADDED);
            if (fileWorkingCopyResourceAdded) {
                newInOrphanModeGuess = false;
                fileEventImpactsUs = true;
            }
        }
        else {
            const fileWorkingCopyResourceDeleted = e.contains(this.resource, FileChangeType.DELETED);
            if (fileWorkingCopyResourceDeleted) {
                newInOrphanModeGuess = true;
                fileEventImpactsUs = true;
            }
        }
        if (fileEventImpactsUs && this.orphaned !== newInOrphanModeGuess) {
            let newInOrphanModeValidated = false;
            if (newInOrphanModeGuess) {
                await timeout(100, CancellationToken.None);
                if (this.isDisposed()) {
                    newInOrphanModeValidated = true;
                } else {
                    const exists = await this.fileService.exists(this.resource);
                    newInOrphanModeValidated = !exists;
                }
            }
            if (this.orphaned !== newInOrphanModeValidated && !this.isDisposed()) {
                this.setOrphaned(newInOrphanModeValidated);
            }
        }
    }
    setOrphaned(orphaned) {
        if (this.orphaned !== orphaned) {
            this.orphaned = orphaned;
            this._onDidChangeOrphaned.fire();
        }
    }
    isDisposed() {
        return this._store.isDisposed;
    }
    dispose() {
        this.orphaned = false;
        this._onWillDispose.fire();
        super.dispose();
    }
    isModified() {
        return this.isDirty();
    }
};
ResourceWorkingCopy = ( __decorate([( __param(1, IFileService))], ResourceWorkingCopy));

export { ResourceWorkingCopy };
