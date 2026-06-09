"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDiagnosticsErrors = exports.checkProgramDiagnosticsErrors = void 0;
const ts = require("typescript");
const logger_1 = require("../logger");
const formatDiagnosticsHost = {
    getCanonicalFileName: (fileName) => ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine,
};
function checkProgramDiagnosticsErrors(program) {
    if (!program.getCompilerOptions().declaration) {
        throw new Error(`Something went wrong - the program doesn't have declaration option enabled`);
    }
    checkDiagnosticsErrors(ts.getPreEmitDiagnostics(program), 'Compiled with errors');
}
exports.checkProgramDiagnosticsErrors = checkProgramDiagnosticsErrors;
function checkDiagnosticsErrors(diagnostics, failMessage) {
    if (diagnostics.length === 0) {
        return;
    }
    (0, logger_1.errorLog)(ts.formatDiagnostics(diagnostics, formatDiagnosticsHost).trim());
    throw new Error(failMessage);
}
exports.checkDiagnosticsErrors = checkDiagnosticsErrors;
