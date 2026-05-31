import { Size2D } from "../../../../../../common/core/2d/size.js";
import { OffsetRange } from "../../../../../../common/core/ranges/offsetRange.js";
/**
 * The tower areas are arranged from left to right, touch and are aligned at the bottom.
 * How high can a tower be placed at the requested horizontal range, so that its size fits into the union of the stacked availableTowerAreas?
 */
export declare function getMaxTowerHeightInAvailableArea(towerHorizontalRange: OffsetRange, availableTowerAreas: Size2D[]): number;
