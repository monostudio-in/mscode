

function getKoreanAltChars(code) {
    const result = disassembleKorean(code);
    if (result && result.length > 0) {
        return ( new Uint32Array(result));
    }
    return undefined;
}
let codeBufferLength = 0;
const codeBuffer = ( new Uint32Array(10));
function disassembleKorean(code) {
    codeBufferLength = 0;
    getCodesFromArray(code, modernConsonants, HangulRangeStartCode.InitialConsonant);
    if (codeBufferLength > 0) {
        return codeBuffer.subarray(0, codeBufferLength);
    }
    getCodesFromArray(code, modernVowels, HangulRangeStartCode.Vowel);
    if (codeBufferLength > 0) {
        return codeBuffer.subarray(0, codeBufferLength);
    }
    getCodesFromArray(code, modernFinalConsonants, HangulRangeStartCode.FinalConsonant);
    if (codeBufferLength > 0) {
        return codeBuffer.subarray(0, codeBufferLength);
    }
    getCodesFromArray(code, compatibilityJamo, HangulRangeStartCode.CompatibilityJamo);
    if (codeBufferLength) {
        return codeBuffer.subarray(0, codeBufferLength);
    }
    if (code >= 0xAC00 && code <= 0xD7A3) {
        const hangulIndex = code - 0xAC00;
        const vowelAndFinalConsonantProduct = hangulIndex % 588;
        const initialConsonantIndex = Math.floor(hangulIndex / 588);
        const vowelIndex = Math.floor(vowelAndFinalConsonantProduct / 28);
        const finalConsonantIndex = vowelAndFinalConsonantProduct % 28 - 1;
        if (initialConsonantIndex < modernConsonants.length) {
            getCodesFromArray(initialConsonantIndex, modernConsonants, 0);
        } else if (HangulRangeStartCode.InitialConsonant + initialConsonantIndex - HangulRangeStartCode.CompatibilityJamo < compatibilityJamo.length) {
            getCodesFromArray(
                HangulRangeStartCode.InitialConsonant + initialConsonantIndex,
                compatibilityJamo,
                HangulRangeStartCode.CompatibilityJamo
            );
        }
        if (vowelIndex < modernVowels.length) {
            getCodesFromArray(vowelIndex, modernVowels, 0);
        } else if (HangulRangeStartCode.Vowel + vowelIndex - HangulRangeStartCode.CompatibilityJamo < compatibilityJamo.length) {
            getCodesFromArray(
                HangulRangeStartCode.Vowel + vowelIndex - HangulRangeStartCode.CompatibilityJamo,
                compatibilityJamo,
                HangulRangeStartCode.CompatibilityJamo
            );
        }
        if (finalConsonantIndex >= 0) {
            if (finalConsonantIndex < modernFinalConsonants.length) {
                getCodesFromArray(finalConsonantIndex, modernFinalConsonants, 0);
            } else if (HangulRangeStartCode.FinalConsonant + finalConsonantIndex - HangulRangeStartCode.CompatibilityJamo < compatibilityJamo.length) {
                getCodesFromArray(
                    HangulRangeStartCode.FinalConsonant + finalConsonantIndex - HangulRangeStartCode.CompatibilityJamo,
                    compatibilityJamo,
                    HangulRangeStartCode.CompatibilityJamo
                );
            }
        }
        if (codeBufferLength > 0) {
            return codeBuffer.subarray(0, codeBufferLength);
        }
    }
    return undefined;
}
function getCodesFromArray(code, array, arrayStartIndex) {
    if (code >= arrayStartIndex && code < arrayStartIndex + array.length) {
        addCodesToBuffer(array[code - arrayStartIndex]);
    }
}
function addCodesToBuffer(codes) {
    if (codes === AsciiCode.NUL) {
        return;
    }
    codeBuffer[codeBufferLength++] = codes & 0xFF;
    if (codes >> 8) {
        codeBuffer[codeBufferLength++] = (codes >> 8) & 0xFF;
    }
    if (codes >> 16) {
        codeBuffer[codeBufferLength++] = (codes >> 16) & 0xFF;
    }
}
var HangulRangeStartCode;
(function(HangulRangeStartCode) {
    HangulRangeStartCode[HangulRangeStartCode["InitialConsonant"] = 4352] = "InitialConsonant";
    HangulRangeStartCode[HangulRangeStartCode["Vowel"] = 4449] = "Vowel";
    HangulRangeStartCode[HangulRangeStartCode["FinalConsonant"] = 4520] = "FinalConsonant";
    HangulRangeStartCode[HangulRangeStartCode["CompatibilityJamo"] = 12593] = "CompatibilityJamo";
})(HangulRangeStartCode || (HangulRangeStartCode = {}));
var AsciiCode;
(function(AsciiCode) {
    AsciiCode[AsciiCode["NUL"] = 0] = "NUL";
    AsciiCode[AsciiCode["A"] = 65] = "A";
    AsciiCode[AsciiCode["B"] = 66] = "B";
    AsciiCode[AsciiCode["C"] = 67] = "C";
    AsciiCode[AsciiCode["D"] = 68] = "D";
    AsciiCode[AsciiCode["E"] = 69] = "E";
    AsciiCode[AsciiCode["F"] = 70] = "F";
    AsciiCode[AsciiCode["G"] = 71] = "G";
    AsciiCode[AsciiCode["H"] = 72] = "H";
    AsciiCode[AsciiCode["I"] = 73] = "I";
    AsciiCode[AsciiCode["J"] = 74] = "J";
    AsciiCode[AsciiCode["K"] = 75] = "K";
    AsciiCode[AsciiCode["L"] = 76] = "L";
    AsciiCode[AsciiCode["M"] = 77] = "M";
    AsciiCode[AsciiCode["N"] = 78] = "N";
    AsciiCode[AsciiCode["O"] = 79] = "O";
    AsciiCode[AsciiCode["P"] = 80] = "P";
    AsciiCode[AsciiCode["Q"] = 81] = "Q";
    AsciiCode[AsciiCode["R"] = 82] = "R";
    AsciiCode[AsciiCode["S"] = 83] = "S";
    AsciiCode[AsciiCode["T"] = 84] = "T";
    AsciiCode[AsciiCode["U"] = 85] = "U";
    AsciiCode[AsciiCode["V"] = 86] = "V";
    AsciiCode[AsciiCode["W"] = 87] = "W";
    AsciiCode[AsciiCode["X"] = 88] = "X";
    AsciiCode[AsciiCode["Y"] = 89] = "Y";
    AsciiCode[AsciiCode["Z"] = 90] = "Z";
    AsciiCode[AsciiCode["a"] = 97] = "a";
    AsciiCode[AsciiCode["b"] = 98] = "b";
    AsciiCode[AsciiCode["c"] = 99] = "c";
    AsciiCode[AsciiCode["d"] = 100] = "d";
    AsciiCode[AsciiCode["e"] = 101] = "e";
    AsciiCode[AsciiCode["f"] = 102] = "f";
    AsciiCode[AsciiCode["g"] = 103] = "g";
    AsciiCode[AsciiCode["h"] = 104] = "h";
    AsciiCode[AsciiCode["i"] = 105] = "i";
    AsciiCode[AsciiCode["j"] = 106] = "j";
    AsciiCode[AsciiCode["k"] = 107] = "k";
    AsciiCode[AsciiCode["l"] = 108] = "l";
    AsciiCode[AsciiCode["m"] = 109] = "m";
    AsciiCode[AsciiCode["n"] = 110] = "n";
    AsciiCode[AsciiCode["o"] = 111] = "o";
    AsciiCode[AsciiCode["p"] = 112] = "p";
    AsciiCode[AsciiCode["q"] = 113] = "q";
    AsciiCode[AsciiCode["r"] = 114] = "r";
    AsciiCode[AsciiCode["s"] = 115] = "s";
    AsciiCode[AsciiCode["t"] = 116] = "t";
    AsciiCode[AsciiCode["u"] = 117] = "u";
    AsciiCode[AsciiCode["v"] = 118] = "v";
    AsciiCode[AsciiCode["w"] = 119] = "w";
    AsciiCode[AsciiCode["x"] = 120] = "x";
    AsciiCode[AsciiCode["y"] = 121] = "y";
    AsciiCode[AsciiCode["z"] = 122] = "z";
})(AsciiCode || (AsciiCode = {}));
var AsciiCodeCombo;
(function(AsciiCodeCombo) {
    AsciiCodeCombo[AsciiCodeCombo["fa"] = 24934] = "fa";
    AsciiCodeCombo[AsciiCodeCombo["fg"] = 26470] = "fg";
    AsciiCodeCombo[AsciiCodeCombo["fq"] = 29030] = "fq";
    AsciiCodeCombo[AsciiCodeCombo["fr"] = 29286] = "fr";
    AsciiCodeCombo[AsciiCodeCombo["ft"] = 29798] = "ft";
    AsciiCodeCombo[AsciiCodeCombo["fv"] = 30310] = "fv";
    AsciiCodeCombo[AsciiCodeCombo["fx"] = 30822] = "fx";
    AsciiCodeCombo[AsciiCodeCombo["hk"] = 27496] = "hk";
    AsciiCodeCombo[AsciiCodeCombo["hl"] = 27752] = "hl";
    AsciiCodeCombo[AsciiCodeCombo["ho"] = 28520] = "ho";
    AsciiCodeCombo[AsciiCodeCombo["ml"] = 27757] = "ml";
    AsciiCodeCombo[AsciiCodeCombo["nj"] = 27246] = "nj";
    AsciiCodeCombo[AsciiCodeCombo["nl"] = 27758] = "nl";
    AsciiCodeCombo[AsciiCodeCombo["np"] = 28782] = "np";
    AsciiCodeCombo[AsciiCodeCombo["qt"] = 29809] = "qt";
    AsciiCodeCombo[AsciiCodeCombo["rt"] = 29810] = "rt";
    AsciiCodeCombo[AsciiCodeCombo["sg"] = 26483] = "sg";
    AsciiCodeCombo[AsciiCodeCombo["sw"] = 30579] = "sw";
})(AsciiCodeCombo || (AsciiCodeCombo = {}));
const modernConsonants = ( new Uint8Array([
AsciiCode.r,
AsciiCode.R,
AsciiCode.s,
AsciiCode.e,
AsciiCode.E,
AsciiCode.f,
AsciiCode.a,
AsciiCode.q,
AsciiCode.Q,
AsciiCode.t,
AsciiCode.T,
AsciiCode.d,
AsciiCode.w,
AsciiCode.W,
AsciiCode.c,
AsciiCode.z,
AsciiCode.x,
AsciiCode.v,
AsciiCode.g]));
const modernVowels = ( new Uint16Array([
AsciiCode.k,
AsciiCode.o,
AsciiCode.i,
AsciiCode.O,
AsciiCode.j,
AsciiCode.p,
AsciiCode.u,
AsciiCode.P,
AsciiCode.h,
AsciiCodeCombo.hk,
AsciiCodeCombo.ho,
AsciiCodeCombo.hl,
AsciiCode.y,
AsciiCode.n,
AsciiCodeCombo.nj,
AsciiCodeCombo.np,
AsciiCodeCombo.nl,
AsciiCode.b,
AsciiCode.m,
AsciiCodeCombo.ml,
AsciiCode.l]));
const modernFinalConsonants = ( new Uint16Array([
AsciiCode.r,
AsciiCode.R,
AsciiCodeCombo.rt,
AsciiCode.s,
AsciiCodeCombo.sw,
AsciiCodeCombo.sg,
AsciiCode.e,
AsciiCode.f,
AsciiCodeCombo.fr,
AsciiCodeCombo.fa,
AsciiCodeCombo.fq,
AsciiCodeCombo.ft,
AsciiCodeCombo.fx,
AsciiCodeCombo.fv,
AsciiCodeCombo.fg,
AsciiCode.a,
AsciiCode.q,
AsciiCodeCombo.qt,
AsciiCode.t,
AsciiCode.T,
AsciiCode.d,
AsciiCode.w,
AsciiCode.c,
AsciiCode.z,
AsciiCode.x,
AsciiCode.v,
AsciiCode.g]));
const compatibilityJamo = ( new Uint16Array([
AsciiCode.r,
AsciiCode.R,
AsciiCodeCombo.rt,
AsciiCode.s,
AsciiCodeCombo.sw,
AsciiCodeCombo.sg,
AsciiCode.e,
AsciiCode.E,
AsciiCode.f,
AsciiCodeCombo.fr,
AsciiCodeCombo.fa,
AsciiCodeCombo.fq,
AsciiCodeCombo.ft,
AsciiCodeCombo.fx,
AsciiCodeCombo.fv,
AsciiCodeCombo.fg,
AsciiCode.a,
AsciiCode.q,
AsciiCode.Q,
AsciiCodeCombo.qt,
AsciiCode.t,
AsciiCode.T,
AsciiCode.d,
AsciiCode.w,
AsciiCode.W,
AsciiCode.c,
AsciiCode.z,
AsciiCode.x,
AsciiCode.v,
AsciiCode.g,
AsciiCode.k,
AsciiCode.o,
AsciiCode.i,
AsciiCode.O,
AsciiCode.j,
AsciiCode.p,
AsciiCode.u,
AsciiCode.P,
AsciiCode.h,
AsciiCodeCombo.hk,
AsciiCodeCombo.ho,
AsciiCodeCombo.hl,
AsciiCode.y,
AsciiCode.n,
AsciiCodeCombo.nj,
AsciiCodeCombo.np,
AsciiCodeCombo.nl,
AsciiCode.b,
AsciiCode.m,
AsciiCodeCombo.ml,
AsciiCode.l]));

export { getKoreanAltChars };
