export interface IClickTarget {
    type: ClickTargetType;
    event: MouseEvent;
}
export declare enum ClickTargetType {
    Container = 0,
    ContributedTextItem = 1,
    ContributedCommandItem = 2
}
