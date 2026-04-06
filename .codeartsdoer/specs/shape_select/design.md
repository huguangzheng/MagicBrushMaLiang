# 技术设计文档

## 文档信息
- **特性名称**: 图形选择与增强功能
- **创建日期**: 2025-01-09
- **版本**: 1.0
- **状态**: Draft
- **关联需求**: spec.md

## 1. 设计概述

### 1.1 设计目标
本设计旨在扩展现有画布应用的图形选择、移动和清除功能，确保所有图形元素类型（线条、圆、椭圆、五角星）都能被正确选中、移动和擦除，同时提供清晰的视觉反馈（中点/中心标记），并通过全面的测试用例确保代码覆盖率达到85%且100%通过。

### 1.2 设计范围
- 扩展元素选择算法以支持椭圆和五角星类型
- 扩展元素移动逻辑以支持椭圆和五角星类型
- 扩展清除刷子擦除逻辑以支持椭圆和五角星类型
- 实现选中元素的视觉反馈（中点/中心标记显示）
- 实现移动元素时的光标状态变化
- 编写全面的测试用例覆盖所有新增功能

### 1.3 技术选型
| 技术/框架 | 版本 | 用途 | 选择理由 |
|-----------|------|------|----------|
| JavaScript | ES6+ | 核心逻辑实现 | 现有项目技术栈，无需额外引入 |
| HTML5 Canvas | - | 图形渲染 | 现有项目技术栈，高性能2D图形绘制 |
| 测试框架 | 自定义 | 单元测试 | 现有项目测试框架，保持一致性 |

## 2. 系统架构

### 2.1 整体架构图
```
┌─────────────────────────────────────────────────────────┐
│                     用户交互层                            │
│  (鼠标点击、拖动、工具切换、光标变化)                      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   事件处理层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │选择事件  │  │移动事件  │  │清除事件  │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
└───────┼─────────────┼─────────────┼────────────────────┘
        │             │             │
┌───────▼─────────────▼─────────────▼────────────────────┐
│                   业务逻辑层                              │
│  ┌────────────────────────────────────────────┐        │
│  │        元素选择检测器                      │        │
│  │  - 增强选择算法(支持椭圆/五角星)           │        │
│  │  - 距离计算方法                           │        │
│  └────────────────────────────────────────────┘        │
│  ┌────────────────────────────────────────────┐        │
│  │        元素移动管理器                      │        │
│  │  - 移动逻辑扩展(支持椭圆/五角星)           │        │
│  │  - 光标状态管理                           │        │
│  └────────────────────────────────────────────┘        │
│  ┌────────────────────────────────────────────┐        │
│  │        清除刷子管理器                      │        │
│  │  - 擦除逻辑扩展(支持椭圆/五角星)           │        │
│  │  - 碰撞检测方法                           │        │
│  └────────────────────────────────────────────┘        │
│  ┌────────────────────────────────────────────┐        │
│  │        视觉反馈渲染器                      │        │
│  │  - 中点/中心标记绘制                       │        │
│  │  - 标记显示/隐藏控制                       │        │
│  └────────────────────────────────────────────┘        │
│  ┌────────────────────────────────────────────┐        │
│  │        选中状态管理器                      │        │
│  │  - 批量选中状态管理                        │        │
│  │  - 双击取消选中功能                        │        │
│  │  - 选中状态切换控制                        │        │
│  └────────────────────────────────────────────┘        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   数据层                                 │
│  ┌────────────────────────────────────────────┐        │
│  │        图层管理器                          │        │
│  │  - 元素存储                               │        │
│  │  - 图层切换                               │        │
│  └────────────────────────────────────────────┘        │
│  ┌────────────────────────────────────────────┐        │
│  │        图形元素数据结构                    │        │
│  │  - 线条/圆/椭圆/五角星等类型               │        │
│  │  - 位置/尺寸/颜色等属性                    │        │
│  └────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### 2.2 模块划分
| 模块名称 | 职责描述 | 依赖模块 |
|----------|----------|----------|
| 元素选择检测器 | 检测鼠标点击位置是否命中图形元素，支持所有图形类型 | 图层管理器、图形元素数据结构 |
| 元素移动管理器 | 处理选中元素的拖动移动，更新元素位置，管理光标状态 | 图层管理器、图形元素数据结构 |
| 清除刷子管理器 | 检测橡皮擦路径与图形元素的碰撞，删除相交元素 | 图层管理器、图形元素数据结构 |
| 视觉反馈渲染器 | 渲染选中元素的中点/中心标记，控制标记显示状态 | 图层管理器、图形元素数据结构 |
| 选中状态管理器 | 管理元素的选中状态，支持批量选中和双击取消选中功能 | 图层管理器、图形元素数据结构、元素选择检测器 |
| 测试模块 | 编写和执行测试用例，验证功能正确性 | 所有业务逻辑模块 |

### 2.3 数据流图
```
用户点击画布
    │
    ▼
[元素选择检测器]
    │
    ├─→ 检测命中元素类型
    │   ├─→ 椭圆: pointToEllipseDistance()
    │   ├─→ 五角星: pointToStarDistance()
    │   └─→ 其他类型: 现有算法
    │
    ▼
设置选中元素
    │
    ├─→ [视觉反馈渲染器] → 绘制中点/中心标记
    │
    ▼
用户拖动元素
    │
    ▼
[元素移动管理器]
    │
    ├─→ 设置光标为小手形状
    ├─→ 根据元素类型更新位置
    │   ├─→ 椭圆: 更新centerX, centerY
    │   ├─→ 五角星: 更新centerX, centerY
    │   └─→ 其他类型: 现有逻辑
    │
    ▼
更新元素数据
    │
    ▼
重新渲染画布

用户使用清除刷子
    │
    ▼
[清除刷子管理器]
    │
    ├─→ 检测橡皮擦路径与元素碰撞
    │   ├─→ 椭圆: isEllipseIntersectEraser()
    │   ├─→ 五角星: isStarIntersectEraser()
    │   └─→ 其他类型: 现有算法
    │
    ▼
删除相交元素
    │
    ▼
重新渲染画布

用户双击画布
    │
    ▼
>[选中状态管理器]
    │
    ├─→ 检查是否为选择工具模式
    │   ├─→ 否: 不执行操作
    │   └─→ 是: 继续检测
    │
    ├─→ 检查双击位置是否有元素
    │   ├─→ 有元素: 保持选中状态
    │   └─→ 无元素: 取消所有选中
    │       ├─→ 清空selectedElements数组
    │       └─→ 清空selectedElement对象
    │
    ▼
重新渲染画布（隐藏标记）
```

## 3. 详细设计

### 3.1 元素选择检测器

#### 3.1.1 类/接口设计
```javascript
/**
 * 元素选择检测器
 * 职责: 检测鼠标点击位置是否命中图形元素
 */
class ElementSelectionDetector {
    /**
     * 检测指定位置是否有元素被选中
     * @param {number} x - 鼠标X坐标
     * @param {number} y - 鼠标Y坐标
     * @returns {Object|null} 选中的元素对象，未选中返回null
     */
    detectElementAtPosition(x, y) {
        // 实现逻辑
    }

    /**
     * 计算点到椭圆的距离
     * @param {number} px - 点X坐标
     * @param {number} py - 点Y坐标
     * @param {Object} ellipse - 椭圆元素对象
     * @returns {number} 点到椭圆边缘的距离
     */
    pointToEllipseDistance(px, py, ellipse) {
        // 实现逻辑
    }

    /**
     * 计算点到五角星的距离
     * @param {number} px - 点X坐标
     * @param {number} py - 点Y坐标
     * @param {Object} star - 五角星元素对象
     * @returns {number} 点到五角星边缘的距离
     */
    pointToStarDistance(px, py, star) {
        // 实现逻辑
    }
}
```

#### 3.1.2 核心方法
| 方法名 | 输入 | 输出 | 描述 |
|--------|------|------|------|
| detectElementAtPosition | x: number, y: number | Object \| null | 检测指定位置是否命中图形元素，返回最接近的元素 |
| pointToEllipseDistance | px: number, py: number, ellipse: Object | number | 计算点到椭圆边缘的最近距离 |
| pointToStarDistance | px: number, py: number, star: Object | number | 计算点到五角星边缘的最近距离 |

#### 3.1.3 状态管理
此模块为无状态工具类，每次调用独立执行检测逻辑，不维护内部状态。

### 3.2 元素移动管理器

#### 3.2.1 类/接口设计
```javascript
/**
 * 元素移动管理器
 * 职责: 处理选中元素的移动操作和光标状态管理
 */
class ElementMovementManager {
    /**
     * 移动指定元素
     * @param {Object} element - 要移动的元素对象
     * @param {number} dx - X轴偏移量
     * @param {number} dy - Y轴偏移量
     */
    moveElement(element, dx, dy) {
        // 实现逻辑
    }

    /**
     * 设置光标状态
     * @param {string} cursorStyle - 光标样式 ('grab' | 'default')
     */
    setCursorStyle(cursorStyle) {
        // 实现逻辑
    }
}
```

#### 3.2.2 核心方法
| 方法名 | 输入 | 输出 | 描述 |
|--------|------|------|------|
| moveElement | element: Object, dx: number, dy: number | void | 根据元素类型更新其位置坐标 |
| setCursorStyle | cursorStyle: string | void | 设置画布光标样式 |

#### 3.2.3 状态管理
光标状态通过修改DOM元素的cursor CSS属性实现，不在此模块维护。

### 3.3 清除刷子管理器

#### 3.3.1 类/接口设计
```javascript
/**
 * 清除刷子管理器
 * 职责: 检测橡皮擦路径与图形元素的碰撞并删除相交元素
 */
class EraserManager {
    /**
     * 应用橡皮擦擦除操作
     * @param {Object} eraserPath - 橡皮擦路径对象
     */
    applyEraser(eraserPath) {
        // 实现逻辑
    }

    /**
     * 检测椭圆是否与橡皮擦路径相交
     * @param {Object} ellipse - 椭圆元素对象
     * @param {Object} eraserPath - 橡皮擦路径对象
     * @param {number} halfSize - 橡皮擦半径
     * @returns {boolean} 是否相交
     */
    isEllipseIntersectEraser(ellipse, eraserPath, halfSize) {
        // 实现逻辑
    }

    /**
     * 检测五角星是否与橡皮擦路径相交
     * @param {Object} star - 五角星元素对象
     * @param {Object} eraserPath - 橡皮擦路径对象
     * @param {number} halfSize - 橡皮擦半径
     * @returns {boolean} 是否相交
     */
    isStarIntersectEraser(star, eraserPath, halfSize) {
        // 实现逻辑
    }
}
```

#### 3.3.2 核心方法
| 方法名 | 输入 | 输出 | 描述 |
|--------|------|------|------|
| applyEraser | eraserPath: Object | void | 应用橡皮擦操作，删除相交的元素 |
| isEllipseIntersectEraser | ellipse: Object, eraserPath: Object, halfSize: number | boolean | 检测椭圆是否与橡皮擦路径相交 |
| isStarIntersectEraser | star: Object, eraserPath: Object, halfSize: number | boolean | 检测五角星是否与橡皮擦路径相交 |

#### 3.3.3 状态管理
此模块通过修改图层数据结构实现元素删除，不维护内部状态。

### 3.4 视觉反馈渲染器

#### 3.4.1 类/接口设计
```javascript
/**
 * 视觉反馈渲染器
 * 职责: 渲染选中元素的中点/中心标记
 */
class VisualFeedbackRenderer {
    /**
     * 渲染选中元素的标记点
     * @param {CanvasRenderingContext2D} ctx - Canvas绘图上下文
     * @param {Object} element - 选中的元素对象
     */
    renderSelectionMarker(ctx, element) {
        // 实现逻辑
    }

    /**
     * 计算线条元素的中点
     * @param {Object} line - 线条元素对象
     * @returns {Object} 中点坐标 {x, y}
     */
    calculateLineMidpoint(line) {
        // 实现逻辑
    }

    /**
     * 获取闭合图形的中心点
     * @param {Object} shape - 闭合图形元素对象
     * @returns {Object} 中心点坐标 {x, y}
     */
    getShapeCenter(shape) {
        // 实现逻辑
    }
}
```

#### 3.4.2 核心方法
| 方法名 | 输入 | 输出 | 描述 |
|--------|------|------|------|
| renderSelectionMarker | ctx: CanvasRenderingContext2D, element: Object | void | 在画布上绘制选中元素的标记点 |
| calculateLineMidpoint | line: Object | {x: number, y: number} | 计算线条元素的中点坐标 |
| getShapeCenter | shape: Object | {x: number, y: number} | 获取闭合图形的中心点坐标 |

#### 3.4.3 状态管理
标记点的显示状态通过在渲染循环中检查selectedElement属性实现，不单独维护状态。

### 3.5 选中状态管理器

#### 3.5.1 类/接口设计
```javascript
/**
 * 选中状态管理器
 * 职责: 管理元素的选中状态，支持批量选中和双击取消选中功能
 */
class SelectionStateManager {
    /**
     * 批量选中的元素数组
     * @type {Array<GraphicalElement>}
     */
    selectedElements: Array<GraphicalElement>;

    /**
     * 单个选中的元素
     * @type {GraphicalElement|null}
     */
    selectedElement: GraphicalElement|null;

    /**
     * 处理双击事件
     * @param {MouseEvent} e - 鼠标双击事件
     */
    handleDoubleClick(e: MouseEvent): void;

    /**
     * 取消所有选中
     */
    clearAllSelection(): void;
}
```

#### 3.5.2 核心方法
```javascript
/**
 * 处理双击事件
 * @param {MouseEvent} e - 鼠标双击事件
 */
handleDoubleClick(e) {
    const { x, y } = this.eventToWorld(e);

    // 只有选择工具模式才处理双击
    if (this.currentTool !== 'select') {
        return;
    }

    // 检查双击位置是否有元素
    const clickedElement = this.enhanceLineSelection(x, y);
    
    if (!clickedElement) {
        // 双击空白处，取消所有批量选中
        if (this.selectedElements.length > 0) {
            this.selectedElements = [];
            this.render();
        }
        // 同时也取消单个选中
        if (this.selectedElement) {
            this.selectedElement = null;
            this.render();
        }
    }
}

/**
 * 取消所有选中
 */
clearAllSelection() {
    this.selectedElements = [];
    this.selectedElement = null;
    this.render();
}
```

#### 3.5.3 状态管理
选中状态通过selectedElements数组和selectedElement对象管理：
- selectedElements: 存储批量选中的多个元素
- selectedElement: 存储单个选中的元素
- 双击空白处时清空两个选中状态容器并重新渲染

## 4. 数据模型

### 4.1 数据结构
```javascript
/**
 * 图形元素基础接口
 */
interface GraphicalElement {
    type: 'brush' | 'line' | 'rect' | 'circle' | 'ellipse' | 'star' | 'eraser';
    color: string;
    size: number;
}

/**
 * 线条元素
 */
interface LineElement extends GraphicalElement {
    type: 'line' | 'brush' | 'eraser';
    points?: Array<{x: number, y: number}>;  // brush/eraser类型
    startX?: number;  // line类型
    startY?: number;
    endX?: number;
    endY?: number;
}

/**
 * 圆形元素
 */
interface CircleElement extends GraphicalElement {
    type: 'circle';
    centerX: number;
    centerY: number;
    radius: number;
}

/**
 * 椭圆元素
 */
interface EllipseElement extends GraphicalElement {
    type: 'ellipse';
    centerX: number;
    centerY: number;
    radiusX: number;
    radiusY: number;
}

/**
 * 五角星元素
 */
interface StarElement extends GraphicalElement {
    type: 'star';
    centerX: number;
    centerY: number;
    outerRadius: number;
    innerRadius: number;
    points: number;  // 顶点数量，默认5
}

/**
 * 矩形元素
 */
interface RectElement extends GraphicalElement {
    type: 'rect';
    startX: number;
    startY: number;
    width: number;
    height: number;
}

/**
 * 图层数据结构
 */
interface Layer {
    name: string;
    visible: boolean;
    elements: Array<GraphicalElement>;
    color?: string;  // 背景颜色
}
```

### 4.2 数据关系
- 一个应用包含多个图层（Layer）
- 一个图层包含多个图形元素（GraphicalElement）
- 图形元素通过type属性区分不同类型
- 所有图形元素共享基础属性（color, size）
- 不同类型的图形元素有各自特有的属性

### 4.3 数据存储
- 图层数据存储在应用的layers数组中
- 当前活动图层索引存储在currentLayerIndex属性中
- 当前选中元素存储在selectedElement属性中
- 所有数据存储在内存中，通过历史记录机制实现撤销/重做

## 5. API设计

### 5.1 内部API
| API名称 | 方法 | 参数 | 返回值 | 描述 |
|---------|------|------|--------|------|
| enhanceLineSelection | instance method | x: number, y: number | Object \| null | 检测指定位置的元素（需扩展支持椭圆/五角星） |
| moveElement | instance method | element: Object, dx: number, dy: number | void | 移动指定元素（需扩展支持椭圆/五角星） |
| applyEraser | instance method | eraserPath: Object | void | 应用橡皮擦擦除（需扩展支持椭圆/五角星） |
| pointToEllipseDistance | instance method | px: number, py: number, ellipse: Object | number | 计算点到椭圆的距离（新增） |
| pointToStarDistance | instance method | px: number, py: number, star: Object | number | 计算点到五角星的距离（新增） |
| isEllipseIntersectEraser | instance method | ellipse: Object, eraserPath: Object, halfSize: number | boolean | 检测椭圆是否与橡皮擦相交（新增） |
| isStarIntersectEraser | instance method | star: Object, eraserPath: Object, halfSize: number | boolean | 检测五角星是否与橡皮擦相交（新增） |
| calculateLineMidpoint | instance method | line: Object | {x: number, y: number} | 计算线条中点（新增） |
| getShapeCenter | instance method | shape: Object | {x: number, y: number} | 获取图形中心点（新增） |
| renderSelectionMarker | instance method | ctx: CanvasRenderingContext2D, element: Object | void | 渲染选中元素标记（新增） |
| setCursorStyle | instance method | cursorStyle: string | void | 设置光标样式（新增） |

### 5.2 外部接口
本特性不涉及外部系统接口，所有功能在应用内部实现。

## 6. 用户界面设计

### 6.1 界面布局
本特性不改变现有界面布局，仅在现有画布上增强交互功能：
- 选择工具：点击图形元素进行选中
- 选中状态：显示元素的中点/中心标记
- 拖动状态：鼠标光标变为小手形状
- 清除刷子：擦除路径覆盖的元素

### 6.2 交互设计
```
用户操作流程：
1. 选择工具模式
   ↓
2. 点击图形元素
   ↓
3. 元素被选中，显示中点/中心标记
   ↓
4. 按住鼠标拖动元素
   ↓
5. 光标变为小手形状，元素跟随移动
   ↓
6. 释放鼠标，元素移动到新位置
   ↓
7. 光标恢复默认形状

清除刷子流程：
1. 选择清除刷子工具
   ↓
2. 在画布上拖动绘制擦除路径
   ↓
3. 路径覆盖的元素被删除
   ↓
4. 画布重新渲染
```

### 6.3 样式设计
- 中点/中心标记：红色圆形，半径3px，边框1px
- 拖动光标：使用CSS cursor: grab样式
- 选中高亮：元素外围绘制半透明蓝色边框（已有）

## 7. 性能设计

### 7.1 性能目标
| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| 选择响应时间 | <100ms | 使用performance.now()测量点击到选中完成的时间 |
| 移动流畅性 | 60fps | 使用requestAnimationFrame监控帧率 |
| 渲染延迟 | <16ms | 测量从数据更新到画布重绘的时间 |

### 7.2 优化策略
- **空间索引优化**：对于大量元素场景，可考虑使用四叉树等空间索引结构加速碰撞检测
- **渲染优化**：仅在元素状态改变时触发重绘，避免不必要的渲染
- **距离计算优化**：使用数学公式优化点到椭圆/五角星的距离计算，避免复杂的几何运算
- **事件节流**：对mousemove事件进行节流处理，避免频繁更新

## 8. 安全设计

### 8.1 安全措施
- **输入验证**：对所有坐标参数进行边界检查，防止数组越界
- **类型检查**：确保元素对象包含必要的属性，避免运行时错误
- **错误处理**：对异常情况进行捕获和处理，提供友好的错误提示

### 8.2 权限控制
本特性不涉及权限控制，所有用户均可使用选择、移动和清除功能。

## 9. 测试设计

### 9.1 测试策略
采用单元测试和集成测试相结合的策略：
- **单元测试**：对每个核心方法进行独立测试，验证输入输出正确性
- **集成测试**：测试多个模块协作的完整流程，验证端到端功能
- **覆盖率目标**：确保代码覆盖率达到85%以上

### 9.2 测试用例设计

| 用例ID | 测试场景 | 预期结果 | 优先级 |
|--------|----------|----------|--------|
| TC-SEL-001 | 选择椭圆元素 | 椭圆元素被正确选中 | High |
| TC-SEL-002 | 选择五角星元素 | 五角星元素被正确选中 | High |
| TC-SEL-003 | 选择重叠元素 | 选中距离最近的元素 | Medium |
| TC-MOV-001 | 移动椭圆元素 | 椭圆元素位置正确更新 | High |
| TC-MOV-002 | 移动五角星元素 | 五角星元素位置正确更新 | High |
| TC-MOV-003 | 移动时光标变化 | 光标正确变为小手形状 | Medium |
| TC-VIS-001 | 显示线条中点 | 线条中点正确显示 | Medium |
| TC-VIS-002 | 显示椭圆中心 | 椭圆中心正确显示 | Medium |
| TC-VIS-003 | 显示五角星中心 | 五角星中心正确显示 | Medium |
| TC-CLR-001 | 清除椭圆元素 | 椭圆元素被正确删除 | High |
| TC-CLR-002 | 清除五角星元素 | 五角星元素被正确删除 | High |
| TC-CLR-003 | 清除多个元素 | 所有相交元素被删除 | High |
| TC-PERF-001 | 选择性能测试 | 选择响应时间<100ms | Medium |
| TC-PERF-002 | 移动性能测试 | 移动流畅性60fps | Medium |

## 10. 部署设计

### 10.1 部署架构
本特性为纯前端功能，无需后端部署，直接集成到现有应用中。

### 10.2 环境配置
- **开发环境**：Node.js + 现有测试框架
- **浏览器支持**：现代浏览器（Chrome, Firefox, Safari, Edge）
- **Canvas支持**：浏览器需支持HTML5 Canvas API

## 11. 风险与限制

### 11.1 技术风险
| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 椭圆/五角星距离计算复杂度高 | 性能下降 | 使用近似算法，优化计算逻辑 |
| 碰撞检测精度不足 | 用户体验差 | 调整检测阈值，提供视觉反馈 |
| 大量元素时性能问题 | 操作卡顿 | 实现空间索引优化 |
| 测试覆盖率不足 | 质量风险 | 编写全面的测试用例，覆盖所有场景 |

### 11.2 设计限制
- 不支持多元素同时选择和批量操作
- 不支持图形元素的旋转、缩放等复杂变换
- 不支持图形元素的属性编辑（颜色、大小等）
- 椭圆和五角星元素假设已存在于系统中，不涉及绘制功能

## 12. 附录

### 12.1 术语表
| 术语 | 定义 |
|------|------|
| 椭圆元素 | 具有中心点、X轴半径、Y轴半径的闭合图形 |
| 五角星元素 | 具有中心点、外半径、内半径、顶点数量的星形图形 |
| 中点 | 线条元素的几何中心位置 |
| 中心点 | 闭合图形（圆、椭圆、五角星）的几何中心 |
| 碰撞检测 | 判断橡皮擦路径是否与图形元素相交的算法 |
| 距离计算 | 计算点到图形元素边缘最近距离的算法 |
| 视觉反馈 | 通过视觉标记提示用户当前选中状态的机制 |

### 12.2 参考资料
- EARS格式规范文档
- 技术设计原则文档
- 现有代码库（app.js, 测试文件）
- HTML5 Canvas API文档

## 13. 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| 1.0 | 2025-01-09 | 初始版本 | - |
| 1.1 | 2026-04-06 | 添加双击取消批量选中功能设计 | - |
| 1.2 | 2026-04-06 | 添加橡皮擦删除规则设计 | - |

---

*本文档遵循技术设计原则编写*
