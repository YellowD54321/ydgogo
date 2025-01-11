# 棋步紀錄資料結構

## 檔案

- `src/models/moveNode/MoveNode.ts`
- `src/models/moveNode/types.ts`
- `src/models/moveNode/__tests__/MoveNode.test.ts`
- `src/models/moveTree/MoveTree.ts`
- `src/models/moveTree/types.ts`
- `src/models/moveTree/__tests__/MoveTree.test.ts`

## 功能

- 紀錄棋步
- 紀錄棋步的來源
- 紀錄棋步的目標
- 紀錄棋步的顏色
- 紀錄棋步的類型
- 紀錄棋步的座標
- 可以 previous step
- 可以 next step
- 可以 clear
- 可以將所有分支顯示在畫面上
- 可以點擊畫面上任一分支的任一棋步，並切換到該棋步

## 資料結構

```typescript
export enum StoneColor {
  EMPTY = 'EMPTY',
  BLACK = 'BLACK',
  WHITE = 'WHITE',
}

interface MoveNode {
  id: string; // 唯一識別符，總步數
  x: number;
  y: number;
  color: StoneColor; // 黑或白
  parentNode: MoveNode | null; // 指向父節點
  childrenNodes: MoveNode[]; // 子節點陣列（分支）
}

interface Pointer {
  currentNode: MoveNode; // 當前節點
  currentMoveNumber: number; // 當前步數
  totalMoveNumber: number; // 總步數
}

interface MoveTree {
  rootNode: MoveNode;
  pointer: Pointer;
}
```
