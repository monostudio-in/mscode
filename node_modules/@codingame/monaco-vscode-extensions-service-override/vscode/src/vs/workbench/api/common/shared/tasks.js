

var TaskEventKind;
(function (TaskEventKind) {
    TaskEventKind["Changed"] = "changed";
    TaskEventKind["ProcessStarted"] = "processStarted";
    TaskEventKind["ProcessEnded"] = "processEnded";
    TaskEventKind["Terminated"] = "terminated";
    TaskEventKind["Start"] = "start";
    TaskEventKind["AcquiredInput"] = "acquiredInput";
    TaskEventKind["DependsOnStarted"] = "dependsOnStarted";
    TaskEventKind["Active"] = "active";
    TaskEventKind["Inactive"] = "inactive";
    TaskEventKind["End"] = "end";
    TaskEventKind["ProblemMatcherStarted"] = "problemMatcherStarted";
    TaskEventKind["ProblemMatcherEnded"] = "problemMatcherEnded";
    TaskEventKind["ProblemMatcherFoundErrors"] = "problemMatcherFoundErrors";
})(TaskEventKind || (TaskEventKind = {}));

export { TaskEventKind };
