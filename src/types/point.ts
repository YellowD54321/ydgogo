import { StoneColor } from '@/constants/gameConfig';

export interface Point {
  x: number;
  y: number;
}

export interface Stone extends Point {
  color: StoneColor;
}
