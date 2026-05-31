

const offlineName = 'Offline';
function isOfflineError(error) {
    if (error instanceof OfflineError) {
        return true;
    }
    return error instanceof Error && error.name === offlineName && error.message === offlineName;
}
class OfflineError extends Error {
    constructor() {
        super(offlineName);
        this.name = this.message;
    }
}

export { OfflineError, isOfflineError };
