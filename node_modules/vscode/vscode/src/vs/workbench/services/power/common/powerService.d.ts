/**
 * Represents the system's idle state.
 */
export type SystemIdleState = "active" | "idle" | "locked" | "unknown";
/**
 * Represents the system's thermal state.
 */
export type ThermalState = "unknown" | "nominal" | "fair" | "serious" | "critical";
/**
 * The type of power save blocker.
 */
export type PowerSaveBlockerType = "prevent-app-suspension" | "prevent-display-sleep";
