# 魔法画笔测试文档

## 📋 测试概述

本项目为魔法画笔应用提供了完整的测试系统,包括7个功能点的全面测试用例,支持自动化测试、单独测试触发、开发监控等功能。

## 🧪 测试架构

### 测试框架
- **测试框架**: `tests/test-framework.js` - 自定义的JavaScript测试框架
- **测试运行器**: `tests/test-runner.js` - 命令行测试运行器
- **Web运行器**: `tests/test-web-runner.html` - 浏览器可视化测试界面
- **基础测试页面**: `tests/test.html` - 基础功能测试页面

### 测试覆盖

#### 功能点1: 基本绘图工具
- **文件**: `tests/test-feature1-drawing-tools.js`
- **测试内容**:
  - 画笔工具功能
  - 橡皮擦工具功能
  - 形状工具(直线、矩形、圆形)
  - 编辑工具功能
  - 画笔颜色和大小

#### 功能点2: 颜色选择
- **文件**: `tests/test-feature2-color-selection.js`
- **测试内容**:
  - 颜色选择器功能
  - RGB格式支持
  - HEX格式支持
  - 颜色应用
  - 颜色历史
  - 颜色验证

#### 功能点3: 画笔粗细调节和线条弧度编辑
- **文件**: `tests/test-feature3-brush-size-line-edit.js`
- **测试内容**:
  - 画笔大小范围
  - 画笔大小调节
  - 画笔大小实时应用
  - 线条编辑模式
  - 线条选择
  - 控制点拖动
  - 线条连续性
  - 编辑撤销

#### 功能点4: 图层管理能力
- **文件**: `tests/test-feature4-layer-management.js`
- **测试内容**:
  - 添加图层
  - 删除图层
  - 图层上移/下移
  - 图层可见性
  - 图层选择
  - 图层预览
  - 图层独立编辑

#### 功能点5: 撤销/一键清除功能
- **文件**: `tests/test-feature5-undo-clear.js`
- **测试内容**:
  - 撤销操作
  - 撤销限制
  - 撤销历史
  - 清除画布
  - 清除图层
  - 撤销清除

#### 功能点6: 自动存档和工程导入导出
- **文件**: `tests/test-feature6-auto-save-export.js`
- **测试内容**:
  - 自动保存
  - 自动保存间隔
  - 自动保存数据
  - 自动保存恢复
  - 工程导出
  - 工程导入
  - 数据完整性
  - 导出格式

#### 功能点7: AI配色优化
- **文件**: `tests/test-feature7-ai-color-optimization.js`
- **测试内容**:
  - 颜色信息收集
  - AI配色优化
  - 颜色优化应用
  - 优化保持结构
  - 优化撤销
  - 空图层处理
  - 多颜色优化
  - 错误处理

## 🚀 使用方法

### 方法1: 命令行测试

#### 运行所有测试
```bash
# Windows
run-tests.bat

# 或使用Node.js直接运行
node tests/test-runner.js all
```

#### 运行特定测试套件
```bash
# Windows
run-tests.bat suite "功能点1: 基本绘图工具"

# 或使用Node.js
node tests/test-runner.js suite "功能点1: 基本绘图工具"
```

#### 运行特定测试用例
```bash
# Windows
run-tests.bat test "功能点1: 基本绘图工具" "画笔工具应该能够绘制线条"

# 或使用Node.js
node tests/test-runner.js test "功能点1: 基本绘图工具" "画笔工具应该能够绘制线条"
```

#### 列出所有测试套件
```bash
# Windows
run-tests.bat list

# 或使用Node.js
node tests/test-runner.js list
```

### 方法2: Web界面测试

1. 在浏览器中打开 `tests/test-web-runner.html`
2. 点击"运行所有测试"按钮
3. 查看测试结果
4. 可以导出测试报告

### 方法3: 开发监控模式

启动开发监控模式,当文件变化时自动运行测试:

```bash
# Windows
dev-watch.bat

# 或使用Node.js
node dev-watch.js
```

监控模式会监控以下文件:
- `app.js`
- `styles.css`
- `index.html`

当这些文件发生变化时,会自动运行所有测试用例。

## 📊 测试报告

### 命令行报告
测试运行后会自动生成JSON格式的测试报告:
- 文件位置: `test-report.json`
- 包含内容: 测试摘要、详细结果、错误信息

### Web报告
在Web界面中可以:
- 实时查看测试结果
- 查看通过/失败的测试详情
- 导出JSON格式报告

## 🔧 测试框架API

### 基本断言
```javascript
framework.assertEqual(actual, expected, message);
framework.assertNotEqual(actual, expected, message);
framework.assertTrue(value, message);
framework.assertFalse(value, message);
framework.assertNull(value, message);
framework.assertNotNull(value, message);
framework.assertContains(haystack, needle, message);
framework.assertInArray(array, item, message);
```

### 测试套件
```javascript
framework.describe('套件名称', () => {
    framework.it('测试用例名称', async () => {
        // 测试代码
    });
});
```

## 📝 添加新测试

### 1. 创建测试文件
在 `tests/` 目录下创建新的测试文件,例如 `test-feature8-new-feature.js`

### 2. 编写测试类
```javascript
class Feature8Tests {
    constructor(framework, appInstance) {
        this.framework = framework;
        this.app = appInstance;
    }

    registerTests() {
        this.framework.describe('功能点8: 新功能', () => {
            this.testNewFeature();
        });
    }

    testNewFeature() {
        this.framework.it('应该能够做某事', async () => {
            // 测试代码
            this.framework.assertTrue(true);
        });
    }
}

module.exports = Feature8Tests;
```

### 3. 注册测试
在 `tests/test-runner.js` 中添加:
```javascript
const Feature8Tests = require('./test-feature8-new-feature.js');

// 在 registerAllTests 方法中添加
const feature8Tests = new Feature8Tests(this.framework, this.app);
feature8Tests.registerTests();
```

## 🎯 测试最佳实践

### 1. 测试命名
- 测试套件名称应该清晰描述功能
- 测试用例名称应该使用"应该能够..."的格式
- 名称应该具体且有意义

### 2. 测试结构
- 每个测试用例应该独立
- 测试应该有明确的准备、执行、验证阶段
- 使用异步函数处理异步操作

### 3. 断言使用
- 每个测试用例至少包含一个断言
- 使用有意义的断言消息
- 验证关键功能和边界情况

### 4. 模拟数据
- 使用模拟数据而不是真实数据
- 模拟数据应该简单且可预测
- 避免依赖外部资源

## 🐛 调试测试

### 1. 运行单个测试
```bash
node tests/test-runner.js test "功能点1: 基本绘图工具" "画笔工具应该能够绘制线条"
```

### 2. 查看详细错误
测试失败时会显示详细的错误信息,包括:
- 失败的测试用例
- 期望值和实际值
- 错误堆栈

### 3. 使用console.log
在测试代码中添加console.log进行调试:
```javascript
this.framework.it('测试用例', async () => {
    console.log('调试信息');
    // 测试代码
});
```

## 📈 持续集成

### 自动化测试
可以通过以下方式集成到CI/CD流程:

#### GitHub Actions
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'
      - name: Run tests
        run: node tests/test-runner.js all
```

#### GitLab CI
```yaml
test:
  script:
    - node tests/test-runner.js all
  only:
    - merge_requests
    - master
```

## 🤝 贡献指南

### 提交测试
1. 确保所有测试通过
2. 添加新功能的测试用例
3. 更新测试文档
4. 提交时包含测试结果

### 报告问题
如果发现测试问题:
1. 提供详细的错误信息
2. 说明复现步骤
3. 包含环境信息
4. 提供修复建议(如果有)

## 📚 相关资源

- [项目主文档](../README.md)
- [使用指南](../USAGE.md)
- [快速开始](../QUICKSTART.md)
- [技术总结](../PROJECT_SUMMARY.md)

## 📞 联系方式

- GitHub Issues: https://github.com/huguangzheng/MagicBrushMaLiang/issues
- Email: support@magicbrush.com

---

**魔法画笔测试系统** - 确保代码质量和功能完整性
