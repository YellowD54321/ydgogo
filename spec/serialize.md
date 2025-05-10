# 圍棋應用序列化方案

## 概述

本文檔定義了圍棋應用中的序列化方案，用於將 MoveNode 和 MoveTree 對象序列化為 JSON 字符串，以便存儲在 IndexedDB 中。

## 序列化介面定義

```typescript
// 節點序列化後的數據結構
export interface ISerializedMoveNode {
  id: string;
  x: number;
  y: number;
  color: StoneColor;
  currentMoveNumber: number;
  capturedGroups: Group[];
  parentId: string | null;
  childrenIds: string[];
}

// 樹序列化後的數據結構
export interface ISerializedMoveTree {
  nodes: Record<string, ISerializedMoveNode>;
  rootNodeId: string;
  pointer: {
    currentNodeId: string;
    currentMoveNumber: number;
    totalMoveNumber: number;
  };
}
```

## MoveNode 序列化

### MoveNode.serialize 方法

```typescript
// 在 MoveNode 類中添加
public serialize(): ISerializedMoveNode {
  return {
    id: this.id,
    x: this.x,
    y: this.y,
    color: this.color,
    currentMoveNumber: this.currentMoveNumber,
    capturedGroups: this.capturedGroups,
    // 只存 ID 的引用，避免循環引用
    parentId: this.parentNode ? this.parentNode.id : null,
    childrenIds: this.childrenNodes.map(child => child.id)
  };
}
```

### MoveNode 反序列化靜態方法

```typescript
// 在 MoveNode 類中添加
public static deserialize(data: ISerializedMoveNode): MoveNode {
  return new MoveNode({
    x: data.x,
    y: data.y,
    color: data.color,
    parentNode: null, // 暫時設為 null，後續會連接
    totalMoveNumber: data.currentMoveNumber > 0 ? data.currentMoveNumber - 1 : 0,
    capturedGroups: data.capturedGroups || []
  });
}
```

## MoveTree 序列化

### MoveTree.serialize 方法

```typescript
// 在 MoveTree 類中添加
public serialize(): string {
  const nodesMap: Record<string, ISerializedMoveNode> = {};

  // 收集所有節點數據
  const collectNodes = (node: IMoveNode) => {
    nodesMap[node.id] = node.serialize();
    node.childrenNodes.forEach(child => collectNodes(child));
  };

  collectNodes(this.rootNode);

  const serializedTree: ISerializedMoveTree = {
    nodes: nodesMap,
    rootNodeId: this.rootNode.id,
    pointer: {
      currentNodeId: this.pointer.currentNode.id,
      currentMoveNumber: this.pointer.currentMoveNumber,
      totalMoveNumber: this.pointer.totalMoveNumber
    }
  };

  return JSON.stringify(serializedTree);
}
```

### MoveTree 反序列化靜態方法

```typescript
// 在 MoveTree 類中添加
public static deserialize(serializedData: string): MoveTree {
  const data: ISerializedMoveTree = JSON.parse(serializedData);
  const moveTree = new MoveTree();
  const nodesMap: Record<string, IMoveNode> = {};

  // 首先創建所有節點
  Object.entries(data.nodes).forEach(([id, nodeData]) => {
    const node = MoveNode.deserialize(nodeData);
    // 重設 ID
    Object.defineProperty(node, 'id', { value: id });
    nodesMap[id] = node;
  });

  // 然後連接父子關係
  Object.entries(data.nodes).forEach(([id, nodeData]) => {
    const node = nodesMap[id];

    // 建立父子關係但不重複調用 addChild
    if (nodeData.parentId && nodesMap[nodeData.parentId]) {
      node.parentNode = nodesMap[nodeData.parentId];

      // 檢查父節點的子節點列表是否已包含此節點
      if (!node.parentNode.childrenNodes.some(child => child.id === id)) {
        node.parentNode.childrenNodes.push(node);
      }
    }
  });

  // 設置樹的根節點和當前指針
  moveTree.rootNode = nodesMap[data.rootNodeId];
  moveTree.pointer = {
    currentNode: nodesMap[data.pointer.currentNodeId],
    currentMoveNumber: data.pointer.currentMoveNumber,
    totalMoveNumber: data.pointer.totalMoveNumber
  };

  return moveTree;
}
```

## 序列化流程

1. **MoveNode 序列化**：

   - 每個節點將自身數據轉換為明確定義的 ISerializedMoveNode 類型
   - 避免循環引用：存儲父節點和子節點的 ID 而非引用

2. **MoveTree 序列化**：

   - 遍歷整棵樹並收集所有節點的序列化數據
   - 保存根節點 ID 和當前指針位置
   - 將整個數據結構轉換為 JSON 字符串

3. **反序列化過程**：
   - 兩階段恢復：先創建所有節點，再建立節點間關係
   - 確保節點 ID 保持一致
   - 恢復指針位置

## 處理注意事項

1. **循環引用**：使用 ID 引用代替直接對象引用
2. **數據一致性**：確保 ID 和 currentMoveNumber 等特殊屬性正確保留
3. **父子關係**：避免在反序列化時重複調用 addChild 導致的重複添加問題
4. **型別安全**：使用明確的介面定義代替 any 型別，提高代碼的可維護性和安全性
