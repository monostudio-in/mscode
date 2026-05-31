
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { Disposable, DisposableStore, toDisposable, dispose } from '../../../../base/common/lifecycle.js';
import { AutoSaveDisabledReason, AutoSaveMode } from '../../../services/filesConfiguration/common/filesConfigurationService.js';
import { IFilesConfigurationService } from '../../../services/filesConfiguration/common/filesConfigurationService.service.js';
import { IHostService } from '../../../services/host/browser/host.service.js';
import { SaveReason, EditorInputCapabilities } from '../../../common/editor.js';
import { IEditorService } from '../../../services/editor/common/editorService.service.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.service.js';
import { IWorkingCopyService } from '../../../services/workingCopy/common/workingCopyService.service.js';
import { WorkingCopyCapabilities } from '../../../services/workingCopy/common/workingCopy.js';
import { ILogService } from '../../../../platform/log/common/log.service.js';
import { IMarkerService } from '../../../../platform/markers/common/markers.service.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.service.js';

let EditorAutoSave = class EditorAutoSave extends Disposable {
    static {
        this.ID = "workbench.contrib.editorAutoSave";
    }
    constructor(
        filesConfigurationService,
        hostService,
        editorService,
        editorGroupService,
        workingCopyService,
        logService,
        markerService,
        uriIdentityService
    ) {
        super();
        this.filesConfigurationService = filesConfigurationService;
        this.hostService = hostService;
        this.editorService = editorService;
        this.editorGroupService = editorGroupService;
        this.workingCopyService = workingCopyService;
        this.logService = logService;
        this.markerService = markerService;
        this.uriIdentityService = uriIdentityService;
        this.scheduledAutoSavesAfterDelay = ( new Map());
        this.lastActiveEditor = undefined;
        this.lastActiveGroupId = undefined;
        this.lastActiveEditorControlDisposable = this._register(( new DisposableStore()));
        this.waitingOnConditionAutoSaveWorkingCopies = ( new ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource)));
        this.waitingOnConditionAutoSaveEditors = ( new ResourceMap(resource => this.uriIdentityService.extUri.getComparisonKey(resource)));
        for (const dirtyWorkingCopy of this.workingCopyService.dirtyWorkingCopies) {
            this.onDidRegister(dirtyWorkingCopy);
        }
        this.registerListeners();
    }
    registerListeners() {
        this._register(
            this.hostService.onDidChangeFocus(focused => this.onWindowFocusChange(focused))
        );
        this._register(
            this.hostService.onDidChangeActiveWindow(() => this.onActiveWindowChange())
        );
        this._register(
            this.editorService.onDidActiveEditorChange(() => this.onDidActiveEditorChange())
        );
        this._register(
            this.filesConfigurationService.onDidChangeAutoSaveConfiguration(() => this.onDidChangeAutoSaveConfiguration())
        );
        this._register(
            this.workingCopyService.onDidRegister(workingCopy => this.onDidRegister(workingCopy))
        );
        this._register(
            this.workingCopyService.onDidUnregister(workingCopy => this.onDidUnregister(workingCopy))
        );
        this._register(
            this.workingCopyService.onDidChangeDirty(workingCopy => this.onDidChangeDirty(workingCopy))
        );
        this._register(
            this.workingCopyService.onDidChangeContent(workingCopy => this.onDidChangeContent(workingCopy))
        );
        this._register(
            this.markerService.onMarkerChanged(e => this.onConditionChanged(e, AutoSaveDisabledReason.ERRORS))
        );
        this._register(this.filesConfigurationService.onDidChangeAutoSaveDisabled(
            resource => this.onConditionChanged([resource], AutoSaveDisabledReason.DISABLED)
        ));
    }
    onConditionChanged(resources, condition) {
        for (const resource of resources) {
            const workingCopyResult = this.waitingOnConditionAutoSaveWorkingCopies.get(resource);
            if (workingCopyResult?.condition === condition) {
                if (workingCopyResult.workingCopy.isDirty() && this.filesConfigurationService.getAutoSaveMode(workingCopyResult.workingCopy.resource, workingCopyResult.reason).mode !== AutoSaveMode.OFF) {
                    this.discardAutoSave(workingCopyResult.workingCopy);
                    this.logService.trace(
                        `[editor auto save] running auto save from condition change event`,
                        ( workingCopyResult.workingCopy.resource.toString()),
                        workingCopyResult.workingCopy.typeId
                    );
                    workingCopyResult.workingCopy.save({
                        reason: workingCopyResult.reason
                    });
                }
            }
            else {
                const editorResult = this.waitingOnConditionAutoSaveEditors.get(resource);
                if (editorResult?.condition === condition && !editorResult.editor.editor.isDisposed() && editorResult.editor.editor.isDirty() && this.filesConfigurationService.getAutoSaveMode(editorResult.editor.editor, editorResult.reason).mode !== AutoSaveMode.OFF) {
                    this.waitingOnConditionAutoSaveEditors.delete(resource);
                    this.logService.trace(
                        `[editor auto save] running auto save from condition change event with reason ${editorResult.reason}`
                    );
                    this.editorService.save(editorResult.editor, {
                        reason: editorResult.reason
                    });
                }
            }
        }
    }
    onWindowFocusChange(focused) {
        if (!focused) {
            this.maybeTriggerAutoSave(SaveReason.WINDOW_CHANGE);
        }
    }
    onActiveWindowChange() {
        this.maybeTriggerAutoSave(SaveReason.WINDOW_CHANGE);
    }
    onDidActiveEditorChange() {
        if (this.lastActiveEditor && typeof this.lastActiveGroupId === "number") {
            this.maybeTriggerAutoSave(SaveReason.FOCUS_CHANGE, {
                groupId: this.lastActiveGroupId,
                editor: this.lastActiveEditor
            });
        }
        const activeGroup = this.editorGroupService.activeGroup;
        const activeEditor = this.lastActiveEditor = activeGroup.activeEditor ?? undefined;
        this.lastActiveGroupId = activeGroup.id;
        this.lastActiveEditorControlDisposable.clear();
        const activeEditorPane = this.editorService.activeEditorPane;
        if (activeEditor && activeEditorPane) {
            this.lastActiveEditorControlDisposable.add(activeEditorPane.onDidBlur(() => {
                this.maybeTriggerAutoSave(SaveReason.FOCUS_CHANGE, {
                    groupId: activeGroup.id,
                    editor: activeEditor
                });
            }));
        }
    }
    maybeTriggerAutoSave(reason, editorIdentifier) {
        if (editorIdentifier) {
            if (!editorIdentifier.editor.isDirty() || editorIdentifier.editor.isReadonly() || editorIdentifier.editor.hasCapability(EditorInputCapabilities.Untitled)) {
                return;
            }
            const autoSaveMode = this.filesConfigurationService.getAutoSaveMode(editorIdentifier.editor, reason);
            if (autoSaveMode.mode !== AutoSaveMode.OFF) {
                if ((reason === SaveReason.WINDOW_CHANGE && (autoSaveMode.mode === AutoSaveMode.ON_FOCUS_CHANGE || autoSaveMode.mode === AutoSaveMode.ON_WINDOW_CHANGE)) || (reason === SaveReason.FOCUS_CHANGE && autoSaveMode.mode === AutoSaveMode.ON_FOCUS_CHANGE)) {
                    this.logService.trace(`[editor auto save] triggering auto save with reason ${reason}`);
                    this.editorService.save(editorIdentifier, {
                        reason
                    });
                }
            } else if (editorIdentifier.editor.resource && (autoSaveMode.reason === AutoSaveDisabledReason.ERRORS || autoSaveMode.reason === AutoSaveDisabledReason.DISABLED)) {
                this.waitingOnConditionAutoSaveEditors.set(editorIdentifier.editor.resource, {
                    editor: editorIdentifier,
                    reason,
                    condition: autoSaveMode.reason
                });
            }
        } else {
            this.saveAllDirtyAutoSaveables(reason);
        }
    }
    onDidChangeAutoSaveConfiguration() {
        let reason = undefined;
        switch (this.filesConfigurationService.getAutoSaveMode(undefined).mode) {
        case AutoSaveMode.ON_FOCUS_CHANGE:
            reason = SaveReason.FOCUS_CHANGE;
            break;
        case AutoSaveMode.ON_WINDOW_CHANGE:
            reason = SaveReason.WINDOW_CHANGE;
            break;
        case AutoSaveMode.AFTER_SHORT_DELAY:
        case AutoSaveMode.AFTER_LONG_DELAY:
            reason = SaveReason.AUTO;
            break;
        }
        if (reason) {
            this.saveAllDirtyAutoSaveables(reason);
        }
    }
    saveAllDirtyAutoSaveables(reason) {
        for (const workingCopy of this.workingCopyService.dirtyWorkingCopies) {
            if (workingCopy.capabilities & WorkingCopyCapabilities.Untitled) {
                continue;
            }
            const autoSaveMode = this.filesConfigurationService.getAutoSaveMode(workingCopy.resource, reason);
            if (autoSaveMode.mode !== AutoSaveMode.OFF) {
                workingCopy.save({
                    reason
                });
            } else if (autoSaveMode.reason === AutoSaveDisabledReason.ERRORS || autoSaveMode.reason === AutoSaveDisabledReason.DISABLED) {
                this.waitingOnConditionAutoSaveWorkingCopies.set(workingCopy.resource, {
                    workingCopy,
                    reason,
                    condition: autoSaveMode.reason
                });
            }
        }
    }
    onDidRegister(workingCopy) {
        if (workingCopy.isDirty()) {
            this.scheduleAutoSave(workingCopy);
        }
    }
    onDidUnregister(workingCopy) {
        this.discardAutoSave(workingCopy);
    }
    onDidChangeDirty(workingCopy) {
        if (workingCopy.isDirty()) {
            this.scheduleAutoSave(workingCopy);
        } else {
            this.discardAutoSave(workingCopy);
        }
    }
    onDidChangeContent(workingCopy) {
        if (workingCopy.isDirty()) {
            this.scheduleAutoSave(workingCopy);
        }
    }
    scheduleAutoSave(workingCopy) {
        if (workingCopy.capabilities & WorkingCopyCapabilities.Untitled) {
            return;
        }
        const autoSaveAfterDelay = this.filesConfigurationService.getAutoSaveConfiguration(workingCopy.resource).autoSaveDelay;
        if (typeof autoSaveAfterDelay !== "number") {
            return;
        }
        this.discardAutoSave(workingCopy);
        this.logService.trace(
            `[editor auto save] scheduling auto save after ${autoSaveAfterDelay}ms`,
            ( workingCopy.resource.toString()),
            workingCopy.typeId
        );
        const handle = setTimeout(() => {
            this.discardAutoSave(workingCopy);
            if (workingCopy.isDirty()) {
                const reason = SaveReason.AUTO;
                const autoSaveMode = this.filesConfigurationService.getAutoSaveMode(workingCopy.resource, reason);
                if (autoSaveMode.mode !== AutoSaveMode.OFF) {
                    this.logService.trace(`[editor auto save] running auto save`, ( workingCopy.resource.toString()), workingCopy.typeId);
                    workingCopy.save({
                        reason
                    });
                } else if (autoSaveMode.reason === AutoSaveDisabledReason.ERRORS || autoSaveMode.reason === AutoSaveDisabledReason.DISABLED) {
                    this.waitingOnConditionAutoSaveWorkingCopies.set(workingCopy.resource, {
                        workingCopy,
                        reason,
                        condition: autoSaveMode.reason
                    });
                }
            }
        }, autoSaveAfterDelay);
        this.scheduledAutoSavesAfterDelay.set(workingCopy, toDisposable(() => {
            this.logService.trace(`[editor auto save] clearing pending auto save`, ( workingCopy.resource.toString()), workingCopy.typeId);
            clearTimeout(handle);
        }));
    }
    discardAutoSave(workingCopy) {
        dispose(this.scheduledAutoSavesAfterDelay.get(workingCopy));
        this.scheduledAutoSavesAfterDelay.delete(workingCopy);
        this.waitingOnConditionAutoSaveWorkingCopies.delete(workingCopy.resource);
        this.waitingOnConditionAutoSaveEditors.delete(workingCopy.resource);
    }
};
EditorAutoSave = ( __decorate([( __param(0, IFilesConfigurationService)), ( __param(1, IHostService)), ( __param(2, IEditorService)), ( __param(3, IEditorGroupsService)), ( __param(4, IWorkingCopyService)), ( __param(5, ILogService)), ( __param(6, IMarkerService)), ( __param(7, IUriIdentityService))], EditorAutoSave));

export { EditorAutoSave };
