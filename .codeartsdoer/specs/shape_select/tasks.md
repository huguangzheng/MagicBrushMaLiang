# 编码任务文档

## 文档信息
- **特性名称**: 图形选择与增强功能
- **创建日期**: 2025-01-09
- **版本**: 1.0
- **状态**: Draft
- **关联文档**: spec.md, design.md

## 任务概览
- **主要任务数**: 6个
- **子任务数**: 21个
- **覆盖需求数**: 14个功能需求
- **测试用例数**: 18个

---

## 任务1: 扩展元素选择功能支持椭圆和五角星

### 1.1 实现点到椭圆的距离计算方法
**描述**: 在MagicBrushApp类中实现pointToEllipseDistance方法，用于计算点到椭圆边缘的最近距离，以支持椭圆元素的点击选择检测。

**输入**:
- px: number - 点的X坐标
- py: number - 点的Y坐标
- ellipse: Object - 椭圆元素对象，包含centerX, centerY, radiusX, radiusY属性

**输出**:
- number - 点到椭圆边缘的最近距离

**验收标准**:
- 方法能够正确计算点到椭圆边缘的距离
- 当点在椭圆内部时，返回0
- 当点在椭圆外部时，返回点到椭圆边缘的正距离
- 计算结果精确到小数点后2位

**代码生成提示**:
```
在src/js/app.js的MagicBrushApp类中添加pointToEllipseDistance方法：
1. 使用椭圆参数方程计算点到椭圆的距离
2. 可以使用牛顿迭代法求解点到椭圆边界的最近点
3. 考虑椭圆的数学特性：((x-cx)/rx)^2 + ((y-cy)/ry)^2 = 1
4. 返回计算得到的距离值
```

**关联需求**: REQ-SEL-001

---

### 1.2 实现点到五角星的距离计算方法
**描述**: 在MagicBrushApp类中实现pointToStarDistance方法，用于计算点到五角星边缘的最近距离，以支持五角星元素的点击选择检测。

**输入**:
- px: number - 点的X坐标
- py: number - 点的Y坐标
- star: Object - 五角星元素对象，包含centerX, centerY, outerRadius, innerRadius, points属性

**输出**:
- number - 点到五角星边缘的最近距离

**验收标准**:
- 方法能够正确计算点到五角星边缘的距离
- 遍历五角星的所有边，计算点到每条边的距离
- 返回所有边距离中的最小值
- 计算结果精确到小数点后2位

**代码生成提示**:
```
在src/js/app.js的MagicBrushApp类中添加pointToStarDistance方法：
1. 根据五角星的参数计算所有顶点坐标
2. 遍历五角星的每条边（连接相邻顶点）
3. 对每条边使用现有的pointToLineDistance方法计算距离
4. 返回所有边距离中的最小值
5. 参考现有drawStarPath方法的顶点计算逻辑
```

**关联需求**: REQ-SEL-001

---

### 1.3 扩展enhanceLineSelection方法支持椭圆和五角星
**描述**: 修改现有的enhanceLineSelection方法，在元素类型判断逻辑中添加对椭圆和五角星类型的支持，调用相应的距离计算方法。

**输入**:
- x: number - 鼠标X坐标
- y: number - 鼠标Y坐标

**输出**:
- Object | null - 选中的元素对象，未选中返回null

**验收标准**:
- 方法能够识别和选中椭圆类型元素
- 方法能够识别和选中五角星类型元素
- 保持对现有元素类型的支持（brush, line, rect, circle）
- 仅选择当前活动图层中的元素
- 选择距离阈值使用snapThreshold属性

**代码生成提示**:
```
在src/js/app.js中修改enhanceLineSelection方法：
1. 在现有的元素类型判断逻辑中添加ellipse和star分支
2. 对于ellipse类型，调用pointToEllipseDistance方法
3. 对于star类型，调用pointToStarDistance方法
4. 比较距离与minDistance，更新selectedElement
5. 确保不影响现有的其他元素类型的检测逻辑
```

**关联需求**: REQ-SEL-001, REQ-SEL-002

---

### 1.4 编写元素选择功能的测试用例
**描述**: 在test-feature9-background-and-select.js中添加测试用例，验证椭圆和五角星元素的选择功能。

**输入**: 无

**输出**: 添加的测试用例代码

**验收标准**:
- 测试用例验证椭圆元素可以被正确选中
- 测试用例验证五角星元素可以被正确选中
- 测试用例验证选择工具仅选择当前图层元素
- 测试用例验证未命中元素时返回null
- 所有测试用例能够通过

**代码生成提示**:
```
在tests/test-feature9-background-and-select.js的testSelectTool方法中添加：
1. 测试椭圆元素选择的用例：创建椭圆元素，调用enhanceLineSelection，验证返回值
2. 测试五角星元素选择的用例：创建五角星元素，调用enhanceLineSelection，验证返回值
3. 测试多图层选择的用例：在两个图层创建元素，验证只选中当前图层元素
4. 使用框架的assertNotNull、assertEqual等方法进行断言
```

**关联需求**: REQ-SEL-001, REQ-SEL-002, REQ-TST-001, REQ-TST-002, REQ-TST-003

---

## 任务2: 扩展元素移动功能支持椭圆和五角星

### 2.1 扩展moveElement方法支持椭圆和五角星
**描述**: 修改现有的moveElement方法，在元素类型判断逻辑中添加对椭圆和五角星类型的支持，更新它们的位置坐标。

**输入**:
- element: Object - 要移动的元素对象
- dx: number - X轴偏移量
- dy: number - Y轴偏移量

**输出**: void

**验收标准**:
- 方法能够正确移动椭圆元素（更新centerX, centerY）
- 方法能够正确移动五角星元素（更新centerX, centerY）
- 保持对现有元素类型的支持（brush, line, rect, circle）
- 移动后的坐标值正确（原坐标 + 偏移量）

**代码生成提示**:
```
在src/js/app.js中修改moveElement方法：
1. 在现有的元素类型判断逻辑中添加ellipse和star分支
2. 对于ellipse类型：element.centerX += dx; element.centerY += dy;
3. 对于star类型：element.centerX += dx; element.centerY += dy;
4. 确保不影响现有的其他元素类型的移动逻辑
5. 保持方法的整体结构和错误处理
```

**关联需求**: REQ-MOV-001

---

### 2.2 实现光标样式管理方法
**描述**: 在MagicBrushApp类中实现setCursorStyle方法，用于设置画布光标样式，在拖动元素时显示小手形状。

**输入**:
- cursorStyle: string - 光标样式字符串（'grab' | 'default'）

**输出**: void

**验收标准**:
- 方法能够正确设置画布的cursor CSS属性
- 拖动开始时光标变为'grab'（小手形状）
- 拖动结束时光标恢复为'default'
- 光标变化及时，无明显延迟

**代码生成提示**:
```
在src/js/app.js的MagicBrushApp类中添加setCursorStyle方法：
1. 获取canvas元素的引用
2. 设置canvas.style.cursor = cursorStyle
3. 确保方法可以被事件处理器调用
4. 添加参数验证，只接受有效的光标样式值
```

**关联需求**: REQ-MOV-002

---

### 2.3 在鼠标事件中集成光标样式管理
**描述**: 修改鼠标事件处理逻辑，在拖动元素开始和结束时调用setCursorStyle方法，实现光标状态的切换。

**输入**: 无（修改现有事件处理器）

**输出**: 修改后的事件处理代码

**验收标准**:
- 按下鼠标时，如果选中了元素，光标变为小手形状
- 释放鼠标时，光标恢复为默认形状
- 光标变化与用户操作同步
- 不影响其他鼠标事件的正常处理

**代码生成提示**:
```
在src/js/app.js的鼠标事件处理逻辑中：
1. 找到mousedown事件处理器，在检测到拖动开始时调用this.setCursorStyle('grab')
2. 找到mouseup事件处理器，在拖动结束时调用this.setCursorStyle('default')
3. 确保只在拖动元素时改变光标，其他情况保持默认
4. 测试光标变化是否符合预期
```

**关联需求**: REQ-MOV-002

---

### 2.4 编写元素移动功能的测试用例
**描述**: 在test-feature9-background-and-select.js中添加测试用例，验证椭圆和五角星元素的移动功能。

**输入**: 无

**输出**: 添加的测试用例代码

**验收标准**:
- 测试用例验证椭圆元素可以被正确移动
- 测试用例验证五角星元素可以被正确移动
- 测试用例验证移动后坐标值正确
- 测试用例验证光标样式变化
- 所有测试用例能够通过

**代码生成提示**:
```
在tests/test-feature9-background-and-select.js的testElementMovement方法中添加：
1. 测试移动椭圆的用例：创建椭圆，调用moveElement，验证centerX和centerY更新
2. 测试移动五角星的用例：创建五角星，调用moveElement，验证centerX和centerY更新
3. 测试光标变化的用例：调用setCursorStyle，验证canvas.style.cursor属性
4. 使用框架的assertEqual等方法进行断言
```

**关联需求**: REQ-MOV-001, REQ-MOV-002, REQ-TST-001, REQ-TST-002, REQ-TST-003

---

## 任务3: 实现选中元素的视觉反馈

### 3.1 实现线条中点计算方法
**描述**: 在MagicBrushApp类中实现calculateLineMidpoint方法，计算线条元素的中点坐标。

**输入**:
- line: Object - 线条元素对象，包含startX, startY, endX, endY属性（line类型）或points数组（brush类型）

**输出**:
- {x: number, y: number} - 中点坐标对象

**验收标准**:
- 对于line类型，返回起点和终点的中点
- 对于brush类型，返回所有点的平均位置
- 计算结果精确到小数点后2位
- 方法能够处理不同类型的线条元素

**代码生成提示**:
```
在src/js/app.js的MagicBrushApp类中添加calculateLineMidpoint方法：
1. 判断线条类型（line或brush）
2. 对于line类型：中点x = (startX + endX) / 2, 中点y = (startY + endY) / 2
3. 对于brush类型：计算所有点的x和y平均值
4. 返回包含x和y属性的对象
```

**关联需求**: REQ-VIS-001

---

### 3.2 实现闭合图形中心点获取方法
**描述**: 在MagicBrushApp类中实现getShapeCenter方法，获取闭合图形（圆、椭圆、五角星）的中心点坐标。

**输入**:
- shape: Object - 闭合图形元素对象

**输出**:
- {x: number, y: number} - 中心点坐标对象

**验收标准**:
- 对于circle类型，返回centerX和centerY
- 对于ellipse类型，返回centerX和centerY
- 对于star类型，返回centerX和centerY
- 方法能够处理所有闭合图形类型
- 返回值格式统一

**代码生成提示**:
```
在src/js/app.js的MagicBrushApp类中添加getShapeCenter方法：
1. 判断图形类型（circle, ellipse, star）
2. 对于所有闭合图形，中心点都是centerX和centerY
3. 返回包含x: centerX, y: centerY的对象
4. 添加类型检查，确保传入的是闭合图形
```

**关联需求**: REQ-VIS-002

---

### 3.3 实现选中元素标记渲染方法
**描述**: 在MagicBrushApp类中实现renderSelectionMarker方法，在画布上绘制选中元素的中点或中心标记。

**输入**:
- ctx: CanvasRenderingContext2D - Canvas绘图上下文
- element: Object - 选中的元素对象

**输出**: void

**验收标准**:
- 对于线条元素，在其中点位置绘制红色圆形标记
- 对于闭合图形，在其中心位置绘制红色圆形标记
- 标记大小为半径3px，边框1px
- 标记颜色为红色，与背景有足够对比度
- 标记在取消选择时自动隐藏（通过不绘制实现）

**代码生成提示**:
```
在src/js/app.js的MagicBrushApp类中添加renderSelectionMarker方法：
1. 判断元素类型，确定是线条还是闭合图形
2. 对于线条，调用calculateLineMidpoint获取中点
3. 对于闭合图形，调用getShapeCenter获取中心点
4. 使用ctx绘制红色圆形标记：
   - ctx.fillStyle = 'red'
   - ctx.beginPath()
   - ctx.arc(x, y, 3, 0, Math.PI * 2)
   - ctx.fill()
   - ctx.strokeStyle = 'white'
   - ctx.lineWidth = 1
   - ctx.stroke()
```

**关联需求**: REQ-VIS-001, REQ-VIS-002, REQ-VIS-003

---

### 3.4 在渲染循环中集成标记绘制
**描述**: 修改render方法，在绘制完所有图层后，如果存在选中元素，调用renderSelectionMarker方法绘制标记。

**输入**: 无（修改现有render方法）

**输出**: 修改后的render方法代码

**验收标准**:
- 选中元素时，标记点正确显示
- 取消选择时，标记点自动隐藏
- 标记点始终显示在元素上方
- 不影响其他元素的正常渲染
- 标记点清晰可见，不与背景混淆

**代码生成提示**:
```
在src/js/app.js的render方法中：
1. 找到绘制完所有图层后的位置
2. 检查this.selectedElement是否存在
3. 如果存在，调用this.renderSelectionMarker(this.ctx, this.selectedElement)
4. 确保标记点在所有图层之上绘制
5. 测试选中/取消选择的视觉效果
```

**关联需求**: REQ-VIS-001, REQ-VIS-002, REQ-VIS-003

---

### 3.5 编写视觉反馈功能的测试用例
**描述**: 在test-feature9-background-and-select.js中添加测试用例，验证选中元素的标记显示功能。

**输入**: 无

**输出**: 添加的测试用例代码

**验收标准**:
- 测试用例验证线条中点计算正确
- 测试用例验证闭合图形中心点获取正确
- 测试用例验证标记点能够正确绘制
- 测试用例验证取消选择时标记隐藏
- 所有测试用例能够通过

**代码生成提示**:
```
在tests/test-feature9-background-and-select.js中添加新的测试方法testVisualFeedback：
1. 测试calculateLineMidpoint：创建线条，调用方法，验证返回的中点坐标
2. 测试getShapeCenter：创建圆、椭圆、五角星，调用方法，验证返回的中心坐标
3. 测试renderSelectionMarker：可以验证方法存在且可调用（渲染测试较难自动化）
4. 使用框架的assertEqual等方法进行断言
```

**关联需求**: REQ-VIS-001, REQ-VIS-002, REQ-VIS-003, REQ-TST-001, REQ-TST-002, REQ-TST-003

---

## 任务4: 扩展清除刷子功能支持椭圆和五角星

### 4.1 实现椭圆与橡皮擦相交检测方法
**描述**: 在MagicBrushApp类中实现isEllipseIntersectEraser方法，检测椭圆元素是否与橡皮擦路径相交。

**输入**:
- ellipse: Object - 椭圆元素对象
- eraserPath: Object - 橡皮擦路径对象，包含points数组和size属性
- halfSize: number - 橡皮擦半径

**输出**:
- boolean - 是否相交

**验收标准**:
- 方法能够正确检测椭圆与橡皮擦路径的相交
- 检测橡皮擦路径上的每个点是否在椭圆内部或边缘
- 使用点到椭圆的距离计算进行检测
- 当任意橡皮擦点与椭圆距离小于等于halfSize时返回true

**代码生成提示**:
```
在src/js/app.js的MagicBrushApp类中添加isEllipseIntersectEraser方法：
1. 遍历eraserPath.points数组中的每个点
2. 对每个点调用pointToEllipseDistance方法计算距离
3. 如果距离 <= halfSize，返回true
4. 如果所有点都不相交，返回false
5. 复用现有的距离计算逻辑
```

**关联需求**: REQ-CLR-001

---

### 4.2 实现五角星与橡皮擦相交检测方法
**描述**: 在MagicBrushApp类中实现isStarIntersectEraser方法，检测五角星元素是否与橡皮擦路径相交。

**输入**:
- star: Object - 五角星元素对象
- eraserPath: Object - 橡皮擦路径对象，包含points数组和size属性
- halfSize: number - 橡皮擦半径

**输出**:
- boolean - 是否相交

**验收标准**:
- 方法能够正确检测五角星与橡皮擦路径的相交
- 检测橡皮擦路径上的每个点是否在五角星内部或边缘
- 使用点到五角星的距离计算进行检测
- 当任意橡皮擦点与五角星距离小于等于halfSize时返回true

**代码生成提示**:
```
在src/js/app.js的MagicBrushApp类中添加isStarIntersectEraser方法：
1. 遍历eraserPath.points数组中的每个点
2. 对每个点调用pointToStarDistance方法计算距离
3. 如果距离 <= halfSize，返回true
4. 如果所有点都不相交，返回false
5. 复用现有的距离计算逻辑
```

**关联需求**: REQ-CLR-001

---

### 4.3 扩展applyEraser方法支持椭圆和五角星
**描述**: 修改现有的applyEraser方法，在元素类型判断逻辑中添加对椭圆和五角星类型的支持，调用相应的相交检测方法。

**输入**:
- eraserPath: Object - 橡皮擦路径对象

**输出**: void

**验收标准**:
- 方法能够检测并删除与橡皮擦相交的椭圆元素
- 方法能够检测并删除与橡皮擦相交的五角星元素
- 保持对现有元素类型的支持（brush, line, circle, rect）
- 仅删除当前活动图层中的元素
- 不向图层添加新元素

**代码生成提示**:
```
在src/js/app.js中修改applyEraser方法：
1. 在现有的元素类型判断逻辑中添加ellipse和star分支
2. 对于ellipse类型，调用isEllipseIntersectEraser方法
3. 对于star类型，调用isStarIntersectEraser方法
4. 如果相交，将元素添加到elementsToRemove数组
5. 确保不影响现有的其他元素类型的擦除逻辑
6. 验证不添加新元素到图层
```

**关联需求**: REQ-CLR-001, REQ-CLR-002, REQ-CLR-003

---

### 4.4 编写清除刷子功能的测试用例
**描述**: 在test-feature9-background-and-select.js中添加测试用例，验证椭圆和五角星元素的清除功能。

**输入**: 无

**输出**: 添加的测试用例代码

**验收标准**:
- 测试用例验证椭圆元素可以被正确清除
- 测试用例验证五角星元素可以被正确清除
- 测试用例验证清除刷子仅影响当前图层
- 测试用例验证清除不添加新元素
- 所有测试用例能够通过

**代码生成提示**:
```
在tests/test-feature9-background-and-select.js的testEraserNoTrace方法中添加：
1. 测试清除椭圆的用例：创建椭圆，创建橡皮擦路径，调用applyEraser，验证元素被删除
2. 测试清除五角星的用例：创建五角星，创建橡皮擦路径，调用applyEraser，验证元素被删除
3. 测试多图层清除的用例：在两个图层创建元素，验证只删除当前图层元素
4. 测试不添加元素的用例：验证清除前后元素数量不增加
5. 使用框架的assertEqual、assertNull等方法进行断言
```

**关联需求**: REQ-CLR-001, REQ-CLR-002, REQ-CLR-003, REQ-TST-001, REQ-TST-002, REQ-TST-003

---

## 任务5: 测试覆盖率优化和验证

### 5.1 执行测试并分析覆盖率
**描述**: 运行完整的测试套件，执行覆盖率分析，识别未覆盖的代码路径，确保覆盖率达到85%以上。

**输入**: 无

**输出**: 测试报告和覆盖率报告

**验收标准**:
- 所有测试用例100%通过
- 代码覆盖率达到85%以上
- 识别并记录未覆盖的代码路径
- 生成详细的测试报告

**代码生成提示**:
```
使用测试运行器执行测试：
1. 运行node tests/test-runner.js执行所有测试
2. 查看测试输出，确保所有测试通过
3. 如果有覆盖率工具，生成覆盖率报告
4. 分析未覆盖的代码，判断是否需要补充测试用例
5. 记录测试结果和覆盖率数据
```

**关联需求**: REQ-TST-001, REQ-TST-002

---

### 5.2 补充边界条件和异常情况测试
**描述**: 根据覆盖率分析结果，补充边界条件和异常情况的测试用例，确保覆盖所有代码路径。

**输入**: 覆盖率报告

**输出**: 补充的测试用例代码

**验收标准**:
- 覆盖所有未测试的代码分支
- 包含边界条件测试（元素在画布边缘、重叠元素等）
- 包含异常情况测试（无效输入、空值等）
- 所有新测试用例能够通过
- 最终覆盖率达到85%以上

**代码生成提示**:
```
根据覆盖率报告补充测试用例：
1. 识别未覆盖的代码分支（如else分支、异常处理等）
2. 在test-feature9-background-and-select.js中添加相应测试
3. 测试边界情况：元素在画布边缘、多个元素重叠、元素尺寸小于橡皮擦等
4. 测试异常情况：传入null、undefined、缺少必要属性的元素对象
5. 确保每个测试用例都有清晰的描述和断言
```

**关联需求**: REQ-TST-001, REQ-TST-002, REQ-TST-003

---

### 5.3 验证性能需求和用户体验
**描述**: 执行性能测试，验证选择响应时间和移动流畅性是否符合需求，确保用户体验良好。

**输入**: 无

**输出**: 性能测试报告

**验收标准**:
- 选择响应时间小于100毫秒
- 移动流畅性达到60fps（延迟小于16毫秒）
- 视觉反馈清晰可见
- 光标变化及时

**代码生成提示**:
```
编写性能测试代码：
1. 在测试文件中添加性能测试用例
2. 使用performance.now()测量选择操作的响应时间
3. 使用requestAnimationFrame监控移动操作的帧率
4. 验证视觉反馈在不同背景下的可见性
5. 记录性能测试结果，确保符合需求
```

**关联需求**: NFR-PERF-001, NFR-PERF-002, NFR-USA-001, NFR-USA-002

---

## 任务6: 实现双击取消批量选中功能

### 6.1 实现handleDoubleClick方法
**描述**: 在MagicBrushApp类中实现handleDoubleClick方法，用于处理画布的双击事件，实现双击空白处取消批量选中功能。

**输入**:
- e: MouseEvent - 鼠标双击事件对象

**输出**:
- void - 无返回值

**验收标准**:
- 方法能够正确处理双击事件
- 双击空白处时能够取消所有批量选中的元素
- 双击空白处时能够取消单个选中的元素
- 双击元素本身时保持选中状态
- 非选择工具模式下双击不执行取消选中操作

**代码生成提示**:
```
在src/js/app.js的MagicBrushApp类中添加handleDoubleClick方法：
1. 使用eventToWorld方法将屏幕坐标转换为世界坐标
2. 检查当前工具是否为选择工具
3. 使用enhanceLineSelection方法检测双击位置是否有元素
4. 如果没有元素，清空selectedElements和selectedElement
5. 调用render方法重新渲染画布
```

**关联需求**: REQ-VIS-004

---

### 6.2 在setupEventListeners中绑定双击事件
**描述**: 在setupEventListeners方法中为canvas元素添加dblclick事件监听器，绑定handleDoubleClick方法。

**输入**:
- 无

**输出**:
- void - 无返回值

**验收标准**:
- dblclick事件监听器成功绑定到canvas元素
- 双击事件能够正确触发handleDoubleClick方法
- 事件绑定不影响其他鼠标事件的处理

**代码生成提示**:
```
在src/js/app.js的setupEventListeners方法中添加：
this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
```

**关联需求**: REQ-VIS-004

---

### 6.3 编写双击取消选中功能的测试用例
**描述**: 在test-feature9-background-and-select.js中添加testDoubleClickDeselect方法，编写测试用例验证双击取消选中功能的正确性。

**输入**:
- 无

**输出**:
- void - 无返回值

**验收标准**:
- 测试handleDoubleClick方法存在
- 测试双击空白处能够取消批量选中
- 测试双击空白处能够取消单个选中
- 测试非选择工具模式下双击不生效
- 所有测试用例能够通过

**代码生成提示**:
```
在tests/test-feature9-background-and-select.js的TestFeature9类中添加testDoubleClickDeselect方法：
1. 测试handleDoubleClick方法存在
2. 测试双击空白处取消批量选中
3. 测试双击空白处取消单个选中
4. 测试非选择工具模式下双击不生效
```

**关联需求**: REQ-TST-001, REQ-TST-002, REQ-TST-003

---

## 任务依赖关系

```
任务1: 扩展元素选择功能
  ├─ 1.1 实现点到椭圆的距离计算方法
  ├─ 1.2 实现点到五角星的距离计算方法
  ├─ 1.3 扩展enhanceLineSelection方法支持椭圆和五角星 (依赖1.1, 1.2)
  └─ 1.4 编写元素选择功能的测试用例 (依赖1.3)

任务2: 扩展元素移动功能
  ├─ 2.1 扩展moveElement方法支持椭圆和五角星
  ├─ 2.2 实现光标样式管理方法
  ├─ 2.3 在鼠标事件中集成光标样式管理 (依赖2.2)
  └─ 2.4 编写元素移动功能的测试用例 (依赖2.1, 2.3)

任务3: 实现选中元素的视觉反馈
  ├─ 3.1 实现线条中点计算方法
  ├─ 3.2 实现闭合图形中心点获取方法
  ├─ 3.3 实现选中元素标记渲染方法 (依赖3.1, 3.2)
  ├─ 3.4 在渲染循环中集成标记绘制 (依赖3.3)
  └─ 3.5 编写视觉反馈功能的测试用例 (依赖3.1, 3.2, 3.3)

任务4: 扩展清除刷子功能
  ├─ 4.1 实现椭圆与橡皮擦相交检测方法 (依赖1.1)
  ├─ 4.2 实现五角星与橡皮擦相交检测方法 (依赖1.2)
  ├─ 4.3 扩展applyEraser方法支持椭圆和五角星 (依赖4.1, 4.2)
  └─ 4.4 编写清除刷子功能的测试用例 (依赖4.3)

任务5: 测试覆盖率优化和验证
  ├─ 5.1 执行测试并分析覆盖率 (依赖1.4, 2.4, 3.5, 4.4)
  ├─ 5.2 补充边界条件和异常情况测试 (依赖5.1)
  └─ 5.3 验证性能需求和用户体验 (依赖5.2)

任务6: 实现双击取消批量选中功能
  ├─ 6.1 实现handleDoubleClick方法 (依赖1.3)
  ├─ 6.2 在setupEventListeners中绑定双击事件 (依赖6.1)
  └─ 6.3 编写双击取消选中功能的测试用例 (依赖6.1, 6.2)
```

## 任务优先级

### 高优先级任务
- 任务1: 扩展元素选择功能支持椭圆和五角星
- 任务2: 扩展元素移动功能支持椭圆和五角星
- 任务4: 扩展清除刷子功能支持椭圆和五角星

### 中优先级任务
- 任务3: 实现选中元素的视觉反馈
- 任务6: 实现双击取消批量选中功能

### 低优先级任务
- 任务5: 测试覆盖率优化和验证（但必须完成以确保质量）

## 代码生成提示汇总

### 核心方法实现位置
所有核心方法应在`src/js/app.js`的`MagicBrushApp`类中实现：
- pointToEllipseDistance
- pointToStarDistance
- setCursorStyle
- calculateLineMidpoint
- getShapeCenter
- renderSelectionMarker
- isEllipseIntersectEraser
- isStarIntersectEraser
- handleDoubleClick

### 现有方法修改位置
以下方法需要在`src/js/app.js`中修改：
- enhanceLineSelection（添加椭圆和五角星支持）
- moveElement（添加椭圆和五角星支持）
- applyEraser（添加椭圆和五角星支持）
- render（集成标记绘制）
- 鼠标事件处理器（集成光标样式管理）
- setupEventListeners（添加双击事件监听器）

### 测试用例编写位置
所有测试用例应在`tests/test-feature9-background-and-select.js`中添加：
- testSelectTool方法中添加选择功能测试
- testElementMovement方法中添加移动功能测试
- 新增testVisualFeedback方法添加视觉反馈测试
- testEraserNoTrace方法中添加清除功能测试
- 新增testDoubleClickDeselect方法添加双击取消选中测试

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| 1.0 | 2025-01-09 | 初始版本 | - |
| 1.1 | 2026-04-06 | 添加双击取消批量选中功能任务 | - |
| 1.2 | 2026-04-06 | 添加橡皮擦删除规则说明 | - |

---

*本文档基于需求规格和技术设计生成，所有任务按自然语言描述，可直接用于编码实施*
