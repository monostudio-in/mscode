

var TerminalCapability;
(function (TerminalCapability) {
    TerminalCapability[TerminalCapability["CwdDetection"] = 0] = "CwdDetection";
    TerminalCapability[TerminalCapability["NaiveCwdDetection"] = 1] = "NaiveCwdDetection";
    TerminalCapability[TerminalCapability["CommandDetection"] = 2] = "CommandDetection";
    TerminalCapability[TerminalCapability["PartialCommandDetection"] = 3] = "PartialCommandDetection";
    TerminalCapability[TerminalCapability["BufferMarkDetection"] = 4] = "BufferMarkDetection";
    TerminalCapability[TerminalCapability["ShellEnvDetection"] = 5] = "ShellEnvDetection";
    TerminalCapability[TerminalCapability["PromptTypeDetection"] = 6] = "PromptTypeDetection";
})(TerminalCapability || (TerminalCapability = {}));
var CommandInvalidationReason;
(function (CommandInvalidationReason) {
    CommandInvalidationReason["Windows"] = "windows";
    CommandInvalidationReason["NoProblemsReported"] = "noProblemsReported";
})(CommandInvalidationReason || (CommandInvalidationReason = {}));

export { CommandInvalidationReason, TerminalCapability };
