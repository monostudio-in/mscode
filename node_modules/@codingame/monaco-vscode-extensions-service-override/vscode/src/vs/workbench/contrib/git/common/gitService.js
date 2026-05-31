

var GitRefType;
(function (GitRefType) {
    GitRefType[GitRefType["Head"] = 0] = "Head";
    GitRefType[GitRefType["RemoteHead"] = 1] = "RemoteHead";
    GitRefType[GitRefType["Tag"] = 2] = "Tag";
})(GitRefType || (GitRefType = {}));

export { GitRefType };
