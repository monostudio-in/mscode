
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { Color, RGBA } from '../../../../base/common/color.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.service.js';
import { IEditorWorkerService } from '../../../common/services/editorWorker.service.js';

let DefaultDocumentColorProvider = class DefaultDocumentColorProvider {
    constructor(_editorWorkerService) {
        this._editorWorkerService = _editorWorkerService;
    }
    async provideDocumentColors(model, _token) {
        return this._editorWorkerService.computeDefaultDocumentColors(model.uri);
    }
    provideColorPresentations(_model, colorInfo, _token) {
        const range = colorInfo.range;
        const colorFromInfo = colorInfo.color;
        const color = ( new Color(( new RGBA(
            Math.round(255 * colorFromInfo.red),
            Math.round(255 * colorFromInfo.green),
            Math.round(255 * colorFromInfo.blue),
            colorFromInfo.alpha
        ))));
        const rgb = Color.Format.CSS.formatRGB(color);
        const hsl = Color.Format.CSS.formatHSL(color);
        const hex = Color.Format.CSS.formatHexA(color, true);
        const colorPresentations = [];
        colorPresentations.push({
            label: rgb,
            textEdit: {
                range: range,
                text: rgb
            }
        });
        colorPresentations.push({
            label: hsl,
            textEdit: {
                range: range,
                text: hsl
            }
        });
        colorPresentations.push({
            label: hex,
            textEdit: {
                range: range,
                text: hex
            }
        });
        return colorPresentations;
    }
};
DefaultDocumentColorProvider = ( __decorate([( __param(0, IEditorWorkerService))], DefaultDocumentColorProvider));
let DefaultDocumentColorProviderFeature = class DefaultDocumentColorProviderFeature extends Disposable {
    constructor(_languageFeaturesService, editorWorkerService) {
        super();
        this._register(_languageFeaturesService.colorProvider.register("*", ( new DefaultDocumentColorProvider(editorWorkerService))));
    }
};
DefaultDocumentColorProviderFeature = ( __decorate([( __param(0, ILanguageFeaturesService)), ( __param(1, IEditorWorkerService))], DefaultDocumentColorProviderFeature));

export { DefaultDocumentColorProvider, DefaultDocumentColorProviderFeature };
