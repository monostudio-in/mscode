

var WorkingCopyCapabilities;
(function (WorkingCopyCapabilities) {
    WorkingCopyCapabilities[WorkingCopyCapabilities["None"] = 0] = "None";
    WorkingCopyCapabilities[WorkingCopyCapabilities["Untitled"] = 2] = "Untitled";
    WorkingCopyCapabilities[WorkingCopyCapabilities["Scratchpad"] = 4] = "Scratchpad";
})(WorkingCopyCapabilities || (WorkingCopyCapabilities = {}));
const NO_TYPE_ID = '';

export { NO_TYPE_ID, WorkingCopyCapabilities };
