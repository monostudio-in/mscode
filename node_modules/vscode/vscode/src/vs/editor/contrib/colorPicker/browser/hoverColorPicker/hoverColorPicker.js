
import { MouseTargetType } from '../../../../browser/editorBrowser.js';
import { ColorDecorationInjectedTextMarker } from '../colorDetector.js';

function isOnColorDecorator(mouseEvent) {
    const target = mouseEvent.target;
    return !!target
        && target.type === MouseTargetType.CONTENT_TEXT
        && target.detail.injectedText?.options.attachedData === ColorDecorationInjectedTextMarker;
}

export { isOnColorDecorator };
