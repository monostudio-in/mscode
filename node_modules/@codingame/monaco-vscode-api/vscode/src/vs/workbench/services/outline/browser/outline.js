

var OutlineTarget;
(function (OutlineTarget) {
    OutlineTarget[OutlineTarget["OutlinePane"] = 1] = "OutlinePane";
    OutlineTarget[OutlineTarget["Breadcrumbs"] = 2] = "Breadcrumbs";
    OutlineTarget[OutlineTarget["QuickPick"] = 4] = "QuickPick";
})(OutlineTarget || (OutlineTarget = {}));
var OutlineConfigKeys;
(function (OutlineConfigKeys) {
    OutlineConfigKeys["icons"] = "outline.icons";
    OutlineConfigKeys["collapseItems"] = "outline.collapseItems";
    OutlineConfigKeys["problemsEnabled"] = "outline.problems.enabled";
    OutlineConfigKeys["problemsColors"] = "outline.problems.colors";
    OutlineConfigKeys["problemsBadges"] = "outline.problems.badges";
})(OutlineConfigKeys || (OutlineConfigKeys = {}));
var OutlineConfigCollapseItemsValues;
(function (OutlineConfigCollapseItemsValues) {
    OutlineConfigCollapseItemsValues["Collapsed"] = "alwaysCollapse";
    OutlineConfigCollapseItemsValues["Expanded"] = "alwaysExpand";
})(OutlineConfigCollapseItemsValues || (OutlineConfigCollapseItemsValues = {}));

export { OutlineConfigCollapseItemsValues, OutlineConfigKeys, OutlineTarget };
