

var WebFileSystemAccess;
(function (WebFileSystemAccess) {
    function supported(obj) {
        if (typeof obj?.showDirectoryPicker === 'function') {
            return true;
        }
        return false;
    }
    WebFileSystemAccess.supported = supported;
    function isFileSystemHandle(handle) {
        const candidate = handle;
        if (!candidate) {
            return false;
        }
        return typeof candidate.kind === 'string' && typeof candidate.queryPermission === 'function' && typeof candidate.requestPermission === 'function';
    }
    WebFileSystemAccess.isFileSystemHandle = isFileSystemHandle;
    function isFileSystemFileHandle(handle) {
        return handle.kind === 'file';
    }
    WebFileSystemAccess.isFileSystemFileHandle = isFileSystemFileHandle;
    function isFileSystemDirectoryHandle(handle) {
        return handle.kind === 'directory';
    }
    WebFileSystemAccess.isFileSystemDirectoryHandle = isFileSystemDirectoryHandle;
})(WebFileSystemAccess || (WebFileSystemAccess = {}));
var WebFileSystemObserver;
(function (WebFileSystemObserver) {
    function supported(obj) {
        return typeof obj?.FileSystemObserver === 'function';
    }
    WebFileSystemObserver.supported = supported;
})(WebFileSystemObserver || (WebFileSystemObserver = {}));

export { WebFileSystemAccess, WebFileSystemObserver };
