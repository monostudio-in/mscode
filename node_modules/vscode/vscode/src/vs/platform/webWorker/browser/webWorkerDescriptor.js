

class WebWorkerDescriptor {
    constructor(args) {
        this.esmModuleLocation = args.esmModuleLocation;
        this.esmModuleLocationBundler = args.esmModuleLocationBundler;
        this.label = args.label;
    }
}

export { WebWorkerDescriptor };
