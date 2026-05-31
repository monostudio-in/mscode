

function logBrowserOpen(telemetryService, source) {
    telemetryService.publicLog2('integratedBrowser.open', { source });
}

export { logBrowserOpen };
