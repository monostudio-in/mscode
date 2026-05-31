
import { MinimapCharRenderer } from './minimapCharRenderer.js';
import { Constants, allCharCodes } from './minimapCharSheet.js';
import { prebakedMiniMaps } from './minimapPreBaked.js';
import { toUint8 } from '../../../../base/common/uint.js';
import { createElement } from '../../../../base/browser/dom.js';

class MinimapCharRendererFactory {
    static create(scale, fontFamily) {
        if (this.lastCreated && scale === this.lastCreated.scale && fontFamily === this.lastFontFamily) {
            return this.lastCreated;
        }
        let factory;
        if (prebakedMiniMaps[scale]) {
            factory = ( new MinimapCharRenderer(prebakedMiniMaps[scale](), scale));
        } else {
            factory = MinimapCharRendererFactory.createFromSampleData(MinimapCharRendererFactory.createSampleData(fontFamily).data, scale);
        }
        this.lastFontFamily = fontFamily;
        this.lastCreated = factory;
        return factory;
    }
    static createSampleData(fontFamily) {
        const canvas = createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.style.height = `${Constants.SAMPLED_CHAR_HEIGHT}px`;
        canvas.height = Constants.SAMPLED_CHAR_HEIGHT;
        canvas.width = Constants.CHAR_COUNT * Constants.SAMPLED_CHAR_WIDTH;
        canvas.style.width = Constants.CHAR_COUNT * Constants.SAMPLED_CHAR_WIDTH + "px";
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Constants.SAMPLED_CHAR_HEIGHT}px ${fontFamily}`;
        ctx.textBaseline = "middle";
        let x = 0;
        for (const code of allCharCodes) {
            ctx.fillText(String.fromCharCode(code), x, Constants.SAMPLED_CHAR_HEIGHT / 2);
            x += Constants.SAMPLED_CHAR_WIDTH;
        }
        return ctx.getImageData(
            0,
            0,
            Constants.CHAR_COUNT * Constants.SAMPLED_CHAR_WIDTH,
            Constants.SAMPLED_CHAR_HEIGHT
        );
    }
    static createFromSampleData(source, scale) {
        const expectedLength = Constants.SAMPLED_CHAR_HEIGHT * Constants.SAMPLED_CHAR_WIDTH * Constants.RGBA_CHANNELS_CNT * Constants.CHAR_COUNT;
        if (source.length !== expectedLength) {
            throw ( new Error("Unexpected source in MinimapCharRenderer"));
        }
        const charData = MinimapCharRendererFactory._downsample(source, scale);
        return ( new MinimapCharRenderer(charData, scale));
    }
    static _downsampleChar(source, sourceOffset, dest, destOffset, scale) {
        const width = Constants.BASE_CHAR_WIDTH * scale;
        const height = Constants.BASE_CHAR_HEIGHT * scale;
        let targetIndex = destOffset;
        let brightest = 0;
        for (let y = 0; y < height; y++) {
            const sourceY1 = (y / height) * Constants.SAMPLED_CHAR_HEIGHT;
            const sourceY2 = ((y + 1) / height) * Constants.SAMPLED_CHAR_HEIGHT;
            for (let x = 0; x < width; x++) {
                const sourceX1 = (x / width) * Constants.SAMPLED_CHAR_WIDTH;
                const sourceX2 = ((x + 1) / width) * Constants.SAMPLED_CHAR_WIDTH;
                let value = 0;
                let samples = 0;
                for (let sy = sourceY1; sy < sourceY2; sy++) {
                    const sourceRow = sourceOffset + Math.floor(sy) * Constants.RGBA_SAMPLED_ROW_WIDTH;
                    const yBalance = 1 - (sy - Math.floor(sy));
                    for (let sx = sourceX1; sx < sourceX2; sx++) {
                        const xBalance = 1 - (sx - Math.floor(sx));
                        const sourceIndex = sourceRow + Math.floor(sx) * Constants.RGBA_CHANNELS_CNT;
                        const weight = xBalance * yBalance;
                        samples += weight;
                        value += ((source[sourceIndex] * source[sourceIndex + 3]) / 255) * weight;
                    }
                }
                const final = value / samples;
                brightest = Math.max(brightest, final);
                dest[targetIndex++] = toUint8(final);
            }
        }
        return brightest;
    }
    static _downsample(data, scale) {
        const pixelsPerCharacter = Constants.BASE_CHAR_HEIGHT * scale * Constants.BASE_CHAR_WIDTH * scale;
        const resultLen = pixelsPerCharacter * Constants.CHAR_COUNT;
        const result = ( new Uint8ClampedArray(resultLen));
        let resultOffset = 0;
        let sourceOffset = 0;
        let brightest = 0;
        for (let charIndex = 0; charIndex < Constants.CHAR_COUNT; charIndex++) {
            brightest = Math.max(
                brightest,
                this._downsampleChar(data, sourceOffset, result, resultOffset, scale)
            );
            resultOffset += pixelsPerCharacter;
            sourceOffset += Constants.SAMPLED_CHAR_WIDTH * Constants.RGBA_CHANNELS_CNT;
        }
        if (brightest > 0) {
            const adjust = 255 / brightest;
            for (let i = 0; i < resultLen; i++) {
                result[i] *= adjust;
            }
        }
        return result;
    }
}

export { MinimapCharRendererFactory };
