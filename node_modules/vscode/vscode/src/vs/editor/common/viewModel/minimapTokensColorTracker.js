
import { Emitter } from '../../../base/common/event.js';
import { Disposable, markAsSingleton } from '../../../base/common/lifecycle.js';
import { RGBA8 } from '../core/misc/rgba.js';
import { TokenizationRegistry } from '../languages.js';
import { ColorId } from '../encodedTokenAttributes.js';
import { onUnexpectedError, BugIndicatingError } from '../../../base/common/errors.js';

class MinimapTokensColorTracker extends Disposable {
    static {
        this._INSTANCE = null;
    }
    static getInstance() {
        if (!this._INSTANCE) {
            this._INSTANCE = markAsSingleton(( new MinimapTokensColorTracker()));
        }
        return this._INSTANCE;
    }
    constructor() {
        super();
        this._onDidChange = this._register(( new Emitter()));
        this.onDidChange = this._onDidChange.event;
        this._updateColorMap();
        this._register(TokenizationRegistry.onDidChange(e => {
            if (e.changedColorMap) {
                this._updateColorMap();
            }
        }));
    }
    _updateColorMap() {
        const colorMap = TokenizationRegistry.getColorMap();
        if (!colorMap) {
            this._colors = [];
            for (let i = 0; i <= ColorId.DefaultBackground; i++) {
                this._colors[i] = RGBA8.Empty;
            }
            this._backgroundIsLight = true;
            return;
        }
        this._colors = [RGBA8.Empty];
        for (let colorId = 1; colorId < colorMap.length; colorId++) {
            const source = colorMap[colorId].rgba;
            this._colors[colorId] = ( new RGBA8(source.r, source.g, source.b, Math.round(source.a * 255)));
        }
        const backgroundLuminosity = colorMap[ColorId.DefaultBackground].getRelativeLuminance();
        this._backgroundIsLight = backgroundLuminosity >= 0.5;
        this._onDidChange.fire(undefined);
    }
    getColor(colorId) {
        if (colorId < 1 || colorId >= this._colors.length) {
            colorId = ColorId.DefaultBackground;
        }
        let color = this._colors[colorId];
        if (!color) {
            onUnexpectedError(( new BugIndicatingError(`Missing color for colorId ${colorId}`)));
            color = RGBA8.Empty;
        }
        return color;
    }
    backgroundIsLight() {
        return this._backgroundIsLight;
    }
}

export { MinimapTokensColorTracker };
