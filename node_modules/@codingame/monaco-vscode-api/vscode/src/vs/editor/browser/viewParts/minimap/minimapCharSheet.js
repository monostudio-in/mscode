

var Constants;
(function (Constants) {
    Constants[Constants["START_CH_CODE"] = 32] = "START_CH_CODE";
    Constants[Constants["END_CH_CODE"] = 126] = "END_CH_CODE";
    Constants[Constants["UNKNOWN_CODE"] = 65533] = "UNKNOWN_CODE";
    Constants[Constants["CHAR_COUNT"] = 96] = "CHAR_COUNT";
    Constants[Constants["SAMPLED_CHAR_HEIGHT"] = 16] = "SAMPLED_CHAR_HEIGHT";
    Constants[Constants["SAMPLED_CHAR_WIDTH"] = 10] = "SAMPLED_CHAR_WIDTH";
    Constants[Constants["BASE_CHAR_HEIGHT"] = 2] = "BASE_CHAR_HEIGHT";
    Constants[Constants["BASE_CHAR_WIDTH"] = 1] = "BASE_CHAR_WIDTH";
    Constants[Constants["RGBA_CHANNELS_CNT"] = 4] = "RGBA_CHANNELS_CNT";
    Constants[Constants["RGBA_SAMPLED_ROW_WIDTH"] = 3840] = "RGBA_SAMPLED_ROW_WIDTH";
})(Constants || (Constants = {}));
const allCharCodes = (() => {
    const v = [];
    for (let i = Constants.START_CH_CODE; i <= Constants.END_CH_CODE; i++) {
        v.push(i);
    }
    v.push(Constants.UNKNOWN_CODE);
    return v;
})();
const getCharIndex = (chCode, fontScale) => {
    chCode -= Constants.START_CH_CODE;
    if (chCode < 0 || chCode > Constants.CHAR_COUNT) {
        if (fontScale <= 2) {
            return (chCode + Constants.CHAR_COUNT) % Constants.CHAR_COUNT;
        }
        return Constants.CHAR_COUNT - 1;
    }
    return chCode;
};

export { Constants, allCharCodes, getCharIndex };
