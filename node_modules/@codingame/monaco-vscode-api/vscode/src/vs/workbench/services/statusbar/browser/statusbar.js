

var StatusbarAlignment;
(function (StatusbarAlignment) {
    StatusbarAlignment[StatusbarAlignment["LEFT"] = 0] = "LEFT";
    StatusbarAlignment[StatusbarAlignment["RIGHT"] = 1] = "RIGHT";
})(StatusbarAlignment || (StatusbarAlignment = {}));
function isStatusbarEntryLocation(thing) {
    const candidate = thing;
    return typeof candidate?.location?.id === 'string' && typeof candidate.alignment === 'number';
}
function isStatusbarEntryPriority(thing) {
    const candidate = thing;
    return (typeof candidate?.primary === 'number' || isStatusbarEntryLocation(candidate?.primary)) && typeof candidate?.secondary === 'number';
}
const ShowTooltipCommand = {
    id: 'statusBar.entry.showTooltip',
    title: ''
};
const StatusbarEntryKinds = ['standard', 'warning', 'error', 'prominent', 'remote', 'offline'];
function isTooltipWithCommands(thing) {
    const candidate = thing;
    return !!candidate?.content && Array.isArray(candidate?.commands);
}

export { ShowTooltipCommand, StatusbarAlignment, StatusbarEntryKinds, isStatusbarEntryLocation, isStatusbarEntryPriority, isTooltipWithCommands };
