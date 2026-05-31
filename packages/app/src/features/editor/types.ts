// src/features/editor/types.ts
// Shared types for the editor feature.

export interface DropCoords {
  left:   number;
  top:    number;
  height: number;
}

export interface SelectionDrops {
  start: DropCoords;
  end:   DropCoords;
}