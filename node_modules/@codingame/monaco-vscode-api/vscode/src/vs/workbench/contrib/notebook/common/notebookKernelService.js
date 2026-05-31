

const variablePageSize = 100;
var ProxyKernelState;
(function (ProxyKernelState) {
    ProxyKernelState[ProxyKernelState["Disconnected"] = 1] = "Disconnected";
    ProxyKernelState[ProxyKernelState["Connected"] = 2] = "Connected";
    ProxyKernelState[ProxyKernelState["Initializing"] = 3] = "Initializing";
})(ProxyKernelState || (ProxyKernelState = {}));

export { ProxyKernelState, variablePageSize };
