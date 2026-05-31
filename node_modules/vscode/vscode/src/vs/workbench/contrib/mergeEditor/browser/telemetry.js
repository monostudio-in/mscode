
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.service.js';

let MergeEditorTelemetry = class MergeEditorTelemetry {
    constructor(telemetryService) {
        this.telemetryService = telemetryService;
    }
    reportMergeEditorOpened(args) {
        this.telemetryService.publicLog2("mergeEditor.opened", {
            conflictCount: args.conflictCount,
            combinableConflictCount: args.combinableConflictCount,
            baseVisible: args.baseVisible,
            isColumnView: args.isColumnView,
            baseTop: args.baseTop
        });
    }
    reportLayoutChange(args) {
        this.telemetryService.publicLog2("mergeEditor.layoutChanged", {
            baseVisible: args.baseVisible,
            isColumnView: args.isColumnView,
            baseTop: args.baseTop
        });
    }
    reportMergeEditorClosed(args) {
        this.telemetryService.publicLog2("mergeEditor.closed", {
            conflictCount: args.conflictCount,
            combinableConflictCount: args.combinableConflictCount,
            durationOpenedSecs: args.durationOpenedSecs,
            remainingConflictCount: args.remainingConflictCount,
            accepted: args.accepted,
            conflictsResolvedWithBase: args.conflictsResolvedWithBase,
            conflictsResolvedWithInput1: args.conflictsResolvedWithInput1,
            conflictsResolvedWithInput2: args.conflictsResolvedWithInput2,
            conflictsResolvedWithSmartCombination: args.conflictsResolvedWithSmartCombination,
            manuallySolvedConflictCountThatEqualNone: args.manuallySolvedConflictCountThatEqualNone,
            manuallySolvedConflictCountThatEqualSmartCombine: args.manuallySolvedConflictCountThatEqualSmartCombine,
            manuallySolvedConflictCountThatEqualInput1: args.manuallySolvedConflictCountThatEqualInput1,
            manuallySolvedConflictCountThatEqualInput2: args.manuallySolvedConflictCountThatEqualInput2,
            manuallySolvedConflictCountThatEqualNoneAndStartedWithBase: args.manuallySolvedConflictCountThatEqualNoneAndStartedWithBase,
            manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1: args.manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1,
            manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2: args.manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2,
            manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart: args.manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart,
            manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart: args.manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart
        });
    }
    reportAcceptInvoked(inputNumber, otherAccepted) {
        this.telemetryService.publicLog2("mergeEditor.action.accept", {
            otherAccepted: otherAccepted,
            isInput1: inputNumber === 1
        });
    }
    reportSmartCombinationInvoked(otherAccepted) {
        this.telemetryService.publicLog2("mergeEditor.action.smartCombination", {
            otherAccepted: otherAccepted
        });
    }
    reportRemoveInvoked(inputNumber, otherAccepted) {
        this.telemetryService.publicLog2("mergeEditor.action.remove", {
            otherAccepted: otherAccepted,
            isInput1: inputNumber === 1
        });
    }
    reportResetToBaseInvoked() {
        this.telemetryService.publicLog2("mergeEditor.action.resetToBase", {});
    }
    reportNavigationToNextConflict() {
        this.telemetryService.publicLog2("mergeEditor.action.goToNextConflict", {});
    }
    reportNavigationToPreviousConflict() {
        this.telemetryService.publicLog2("mergeEditor.action.goToPreviousConflict", {});
    }
    reportConflictCounterClicked() {
        this.telemetryService.publicLog2("mergeEditor.action.conflictCounterClicked", {});
    }
};
MergeEditorTelemetry = ( __decorate([( __param(0, ITelemetryService))], MergeEditorTelemetry));

export { MergeEditorTelemetry };
