# 觸控放大鏡

## 目的

解決手機等小螢幕裝置上，棋盤操作時容易點到錯誤位置的問題。

## 功能需求

- 點擊棋盤時，放大顯示該位置附近 9x9 範圍的棋盤狀況
- 手指按著不放時，可以移動來調整點擊位置
- 放大鏡中即時顯示當前選中的位置
- 手指放開後，才真正下在最後的位置上

## 相關檔案

### 需要修改

- `src/components/GoBoard.tsx` - 添加 touch 事件處理

### 需要新建

- `src/components/MagnifierOverlay.tsx` - 放大鏡組件
- `src/hooks/useTouchMagnifier.ts` - 放大鏡邏輯封裝（可選）

## 技術設計

### 1. 狀態管理

在 `GoBoard.tsx` 中新增狀態：

```typescript
const [touchState, setTouchState] = useState({
  isTouching: false, // 是否正在觸摸
  touchPosition: null as Point | null, // 當前觸摸的棋盤座標
  touchStartPoint: null as { x: number; y: number } | null, // 初始觸摸點（螢幕座標）
});
```

### 2. Touch 事件處理

#### onTouchStart（手指按下）

- 轉換觸摸座標為棋盤位置
- 設置 `isTouching = true`
- 記錄初始位置
- 顯示放大鏡

#### onTouchMove（手指移動）

- 持續更新 `touchPosition`
- 更新放大鏡顯示內容
- 高亮當前懸停的交叉點

#### onTouchEnd（手指放開）

- 檢查最終位置是否合法
- 如果合法，呼叫 `handleClick(finalPosition)`
- 隱藏放大鏡
- 清空觸摸狀態

### 3. 座標轉換邏輯

```typescript
// 複用現有的座標轉換邏輯
const getTouchPosition = (e: React.TouchEvent<SVGElement>) => {
  const touch = e.touches[0];
  const rect = e.currentTarget.getBoundingClientRect();

  const scaleX = rect.width / BOARD_DIMENSIONS.WIDTH;
  const scaleY = rect.height / BOARD_DIMENSIONS.HEIGHT;

  const adjustedX = (touch.clientX - rect.left) / scaleX;
  const adjustedY = (touch.clientY - rect.top) / scaleY;

  const x = Math.round(
    (adjustedX - BOARD_CONFIG.PADDING) / BOARD_CONFIG.CELL_SIZE
  );
  const y = Math.round(
    (adjustedY - BOARD_CONFIG.PADDING) / BOARD_CONFIG.CELL_SIZE
  );

  return { x, y };
};
```

### 4. 放大鏡範圍計算

```typescript
// 計算 9x9 區域的範圍（以觸摸點為中心）
const getMagnifierRange = (centerX: number, centerY: number) => {
  const halfSize = 4; // 9x9 的半徑

  // 處理邊界情況
  const startX = Math.max(0, centerX - halfSize);
  const startY = Math.max(0, centerY - halfSize);
  const endX = Math.min(BOARD_CONFIG.SIZE - 1, centerX + halfSize);
  const endY = Math.min(BOARD_CONFIG.SIZE - 1, centerY + halfSize);

  return { startX, startY, endX, endY };
};
```

## MagnifierOverlay 組件設計

### Props

```typescript
interface MagnifierOverlayProps {
  centerPosition: Point; // 中心點座標
  currentPosition: Point; // 當前選中的座標
  boardState: StoneColor[][]; // 棋盤狀態
  nextColor: StoneColor; // 下一步的顏色
  fingerPosition: { x: number; y: number }; // 手指位置（螢幕座標）
}
```

### 顯示內容

- 9x9 的放大棋盤區域
- 該區域內已有的棋子（放大顯示）
- 當前選中位置的高亮指示器
- 半透明背景容器
- 顯示在手指上方約 80-100px（避免被遮擋）

### 視覺設計

- **容器**：圓形或方形，建議使用圓形（直徑約 200-250px）
- **背景**：半透明白色背景 `rgba(255, 255, 255, 0.95)`
- **邊框**：實線邊框 `2px solid #333`
- **放大倍率**：2.5-3x
- **當前位置標示**：彩色圓圈或十字準星
- **陰影**：`box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3)`

## 優化細節

### 防止誤觸

```typescript
const DRAG_THRESHOLD = 10; // pixels
const isDragging = distance(touchStart, touchCurrent) > DRAG_THRESHOLD;

// 如果移動距離太小，可能是誤觸，不執行落子
```

### 只在觸控設備啟用

```typescript
const isTouchDevice = 'ontouchstart' in window;

// 可以提供設定選項讓使用者手動開關
```

### 邊界處理

- 靠近棋盤邊緣時，9x9 區域會縮小
- 放大鏡位置要避免超出螢幕範圍
- 手指位置太靠近螢幕頂部時，放大鏡改顯示在手指下方

## 實作步驟

1. ✅ 在 `GoBoard.tsx` 添加 touch 事件處理器和狀態
2. ✅ 實作座標轉換邏輯（複用現有邏輯）
3. ✅ 創建 `MagnifierOverlay.tsx` 組件（先用固定位置測試）
4. ✅ 實作 9x9 區域的棋盤渲染邏輯
5. ✅ 實作放大鏡位置跟隨手指移動
6. ✅ 完善視覺效果（動畫、陰影、邊框）
7. ✅ 處理邊界情況
8. ✅ 添加防誤觸邏輯
9. ✅ 測試各種螢幕尺寸和觸控情境
10. ✅ （可選）添加開關選項到設定中

## 測試重點

- ✅ Touch 事件正確轉換為棋盤座標
- ✅ 邊界情況處理（靠近棋盤邊緣時）
- ✅ 放大鏡正確顯示 9x9 區域內的棋子
- ✅ 拖動後正確落子在最終位置
- ✅ 不影響現有的滑鼠操作邏輯
- ✅ 放大鏡位置不會超出螢幕範圍
- ✅ 合法性檢查（不能下在已有棋子的位置）

## 注意事項

- 保持與現有滑鼠操作邏輯的相容性
- 確保觸控和滑鼠操作不會互相干擾
- 放大鏡只在 touch 事件時顯示，不影響桌面版體驗
- 考慮效能問題，避免在 touchmove 中進行過重的計算
- 確保放大鏡中的棋子渲染與主棋盤一致

## 未來擴展

- 可調整放大倍率
- 可調整放大區域大小（7x7 或 11x11）
- 可自訂放大鏡外觀（圓形/方形/主題色）
- 添加震動反饋（當選中有效位置時）
- 支援多點觸控手勢（縮放、旋轉等）

---

## 實作進度 TODO

### 已完成 ✅

- [x] 創建 `src/hooks/useTouchMagnifier.ts` hook
  - 封裝觸控狀態管理 (`touchState`)
  - 座標轉換邏輯 (`getTouchPosition`)
  - 事件處理器 (`handleTouchStart`, `handleTouchMove`, `handleTouchEnd`)
- [x] 整合到 `src/components/GoBoard.tsx`
  - 使用 `useTouchMagnifier` hook
  - 添加 `style={{ touchAction: 'none' }}` 解決 passive event listener 問題
  - 綁定觸控事件處理器 `{...touchHandlers}`
- [x] 基本觸控功能測試
  - 手指按下顯示預覽棋子
  - 手指移動可以調整位置
  - 手指放開在最終位置落子

### 待實作 ⏳

- [x] 創建 `src/components/MagnifierOverlay.tsx` 放大鏡組件
  - [x] 設計組件 Props 介面
  - [x] 實作 9x9 區域範圍計算
  - [x] 渲染放大的棋盤格線
  - [x] 渲染放大的棋子
  - [x] 高亮當前選中位置
- [x] 整合放大鏡到 GoBoard
  - [x] 根據 `touchState.isTouching` 條件渲染
  - [x] 傳遞必要的 props（位置、棋盤狀態等）
  - [x] 計算放大鏡顯示位置（手指上方）
- [x] 視覺效果優化
  - [x] 添加邊框和陰影
  - [x] 添加背景半透明效果
  - [ ] 考慮添加淡入淡出動畫（可選）
- [x] 邊界處理
  - [x] 棋盤邊緣時調整顯示範圍
  - [x] 螢幕頂部時放大鏡改顯示在手指下方
- [ ] 測試與優化（需要在實際設備上測試）
  - [ ] 不同螢幕尺寸測試
  - [ ] 效能測試與優化
  - [ ] 與滑鼠操作的相容性測試
