

var GoFilter;
(function (GoFilter) {
    GoFilter[GoFilter["NONE"] = 0] = "NONE";
    GoFilter[GoFilter["EDITS"] = 1] = "EDITS";
    GoFilter[GoFilter["NAVIGATION"] = 2] = "NAVIGATION";
})(GoFilter || (GoFilter = {}));
var GoScope;
(function (GoScope) {
    GoScope[GoScope["DEFAULT"] = 0] = "DEFAULT";
    GoScope[GoScope["EDITOR_GROUP"] = 1] = "EDITOR_GROUP";
    GoScope[GoScope["EDITOR"] = 2] = "EDITOR";
})(GoScope || (GoScope = {}));

export { GoFilter, GoScope };
