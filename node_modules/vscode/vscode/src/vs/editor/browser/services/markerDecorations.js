
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { IMarkerDecorationsService } from '../../common/services/markerDecorations.service.js';

let MarkerDecorationsContribution = class MarkerDecorationsContribution {
    static {
        this.ID = "editor.contrib.markerDecorations";
    }
    constructor(_editor, _markerDecorationsService) {}
    dispose() {}
};
MarkerDecorationsContribution = ( __decorate([( __param(1, IMarkerDecorationsService))], MarkerDecorationsContribution));

export { MarkerDecorationsContribution };
