
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { RunOnceScheduler } from '../../../base/common/async.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { AccessibilitySignal } from './accessibilitySignalService.js';
import { IAccessibilitySignalService } from './accessibilitySignalService.service.js';

const PROGRESS_SIGNAL_LOOP_DELAY = 5000;
let AccessibilityProgressSignalScheduler = class AccessibilityProgressSignalScheduler extends Disposable {
    constructor(msDelayTime, msLoopTime, _accessibilitySignalService) {
        super();
        this._accessibilitySignalService = _accessibilitySignalService;
        this._scheduler = this._register(( new RunOnceScheduler(() => {
            this._signalLoop = this._accessibilitySignalService.playSignalLoop(AccessibilitySignal.progress, msLoopTime ?? PROGRESS_SIGNAL_LOOP_DELAY);
        }, msDelayTime)));
        this._scheduler.schedule();
    }
    dispose() {
        super.dispose();
        this._signalLoop?.dispose();
        this._scheduler.dispose();
    }
};
AccessibilityProgressSignalScheduler = ( __decorate([( __param(2, IAccessibilitySignalService))], AccessibilityProgressSignalScheduler));

export { AccessibilityProgressSignalScheduler };
