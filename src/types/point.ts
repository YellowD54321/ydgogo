import { StoneColor } from '@/constants/gameConfig';

export interface Point {
  x: number;
  y: number;
}

export interface Stone extends Point {
  color: StoneColor;
}

export interface NullablePoint {
  x?: number | null;
  y?: number | null;
}

export interface NullableStone extends NullablePoint {
  color: StoneColor;
}
