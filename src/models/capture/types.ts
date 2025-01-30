import { Point } from '@/types/point';
import { StoneColor } from '@/constants/gameConfig';

export interface Group {
  stones: Point[];
  liberties: Point[];
  color: StoneColor;
}

export interface CaptureAnalysis {
  groups: Group[];
  capturedGroups: Group[];
}
