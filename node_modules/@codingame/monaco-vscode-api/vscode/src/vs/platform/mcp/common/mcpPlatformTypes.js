

var McpServerVariableType;
(function (McpServerVariableType) {
    McpServerVariableType["PROMPT"] = "promptString";
    McpServerVariableType["PICK"] = "pickString";
})(McpServerVariableType || (McpServerVariableType = {}));
var McpServerType;
(function (McpServerType) {
    McpServerType["LOCAL"] = "stdio";
    McpServerType["REMOTE"] = "http";
})(McpServerType || (McpServerType = {}));

export { McpServerType, McpServerVariableType };
