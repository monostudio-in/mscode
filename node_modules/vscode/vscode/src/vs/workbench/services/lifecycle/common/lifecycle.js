

var WillShutdownJoinerOrder;
(function (WillShutdownJoinerOrder) {
    WillShutdownJoinerOrder[WillShutdownJoinerOrder["Default"] = 1] = "Default";
    WillShutdownJoinerOrder[WillShutdownJoinerOrder["Last"] = 2] = "Last";
})(WillShutdownJoinerOrder || (WillShutdownJoinerOrder = {}));
var ShutdownReason;
(function (ShutdownReason) {
    ShutdownReason[ShutdownReason["CLOSE"] = 1] = "CLOSE";
    ShutdownReason[ShutdownReason["QUIT"] = 2] = "QUIT";
    ShutdownReason[ShutdownReason["RELOAD"] = 3] = "RELOAD";
    ShutdownReason[ShutdownReason["LOAD"] = 4] = "LOAD";
})(ShutdownReason || (ShutdownReason = {}));
var StartupKind;
(function (StartupKind) {
    StartupKind[StartupKind["NewWindow"] = 1] = "NewWindow";
    StartupKind[StartupKind["ReloadedWindow"] = 3] = "ReloadedWindow";
    StartupKind[StartupKind["ReopenedWindow"] = 4] = "ReopenedWindow";
})(StartupKind || (StartupKind = {}));
function StartupKindToString(startupKind) {
    switch (startupKind) {
        case StartupKind.NewWindow: return 'NewWindow';
        case StartupKind.ReloadedWindow: return 'ReloadedWindow';
        case StartupKind.ReopenedWindow: return 'ReopenedWindow';
    }
}
var LifecyclePhase;
(function (LifecyclePhase) {
    LifecyclePhase[LifecyclePhase["Starting"] = 1] = "Starting";
    LifecyclePhase[LifecyclePhase["Ready"] = 2] = "Ready";
    LifecyclePhase[LifecyclePhase["Restored"] = 3] = "Restored";
    LifecyclePhase[LifecyclePhase["Eventually"] = 4] = "Eventually";
})(LifecyclePhase || (LifecyclePhase = {}));
function LifecyclePhaseToString(phase) {
    switch (phase) {
        case LifecyclePhase.Starting: return 'Starting';
        case LifecyclePhase.Ready: return 'Ready';
        case LifecyclePhase.Restored: return 'Restored';
        case LifecyclePhase.Eventually: return 'Eventually';
    }
}

export { LifecyclePhase, LifecyclePhaseToString, ShutdownReason, StartupKind, StartupKindToString, WillShutdownJoinerOrder };
