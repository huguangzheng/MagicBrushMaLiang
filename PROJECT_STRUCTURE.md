# 魔法画笔项目结构说明

## 📁 目录结构

```
MagicBrushMaLiang/
├── src/                          # 源代码目录
│   ├── js/                       # JavaScript文件
│   │   └── app.js               # 主应用逻辑
│   └── css/                      # CSS样式文件
│       └── styles.css           # 主样式表
│
├── tests/                        # 测试目录
│   ├── test-framework.js        # 测试框架
│   ├── test-runner.js           # 测试运行器
│   ├── test-web-runner.html     # Web测试界面
│   ├── test.html                # 基础测试页面
│   ├── test-feature1-drawing-tools.js
│   ├── test-feature2-color-selection.js
│   ├── test-feature3-brush-size-line-edit.js
│   ├── test-feature4-layer-management.js
│   ├── test-feature5-undo-clear.js
│   ├── test-feature6-auto-save-export.js
│   ├── test-feature7-ai-color-optimization.js
│   ├── README.md                # 测试文档
│   └── TEST_CHECKLIST.md        # 测试清单
│
├── index.html                    # 主HTML文件
├── start.bat                     # 应用启动脚本
├── dev-watch.bat                 # 开发监控脚本
├── dev-watch.js                  # 开发监控器
├── run-tests.bat                 # 测试运行脚本
├── verify-test-system.js         # 测试系统验证脚本
│
├── README.md                     # 项目主文档
├── USAGE.md                      # 使用指南
├── QUICKSTART.md                 # 快速开始
├── PROJECT_SUMMARY.md            # 项目总结
├── SHOWCASE.md                   # 功能展示
├── FEATURE_CHECKLIST.md          # 功能检查清单
│
├── TEST_SYSTEM_SUMMARY.md        # 测试系统总结
├── TEST_QUICK_REFERENCE.md       # 测试快速参考
├── test-system-verification-report.json  # 测试验证报告
│
├── LICENSE                       # MIT许可证
└── .git/                         # Git仓库
```

## 🎯 目录说明

### `/src` - 源代码目录
存放所有核心应用代码:
- `js/`: JavaScript源代码文件
- `css/`: CSS样式文件

### `/tests` - 测试目录
存放所有测试相关文件:
- 测试框架和运行器
- 7个功能点的测试用例
- 测试文档和清单

### 根目录文件
- `index.html`: 应用入口HTML文件
- `start.bat`: 启动应用的批处理脚本
- `dev-watch.*`: 开发监控模式相关文件
- `run-tests.bat`: 运行测试的批处理脚本
- `verify-test-system.js`: 测试系统验证脚本
- 各种文档文件

## 📝 文件引用关系

### HTML文件引用
- `index.html` 引用:
  - `src/css/styles.css` (样式)
  - `src/js/app.js` (逻辑)

### 测试文件引用
- `tests/test-runner.js` 引用:
  - `../src/js/app.js` (应用代码)
- `tests/test.html` 引用:
  - `../src/js/app.js` (应用代码)

### 开发监控
- `dev-watch.js` 监控:
  - `src/js/app.js`
  - `src/css/styles.css`
  - `index.html`

## 🚀 使用方式

### 启动应用
```bash
# 方法1: 直接打开
双击 index.html

# 方法2: 使用本地服务器
双击 start.bat
```

### 运行测试
```bash
# 运行所有测试
run-tests.bat

# 开发监控模式
dev-watch.bat
```

## 🔄 迁移说明

原本在根目录的文件已移动到 `src` 目录:
- `app.js` → `src/js/app.js`
- `styles.css` → `src/css/styles.css`

所有相关的引用路径都已更新,确保应用正常运行。

## 📊 统计信息

- **源代码文件**: 2个 (app.js, styles.css)
- **测试文件**: 13个
- **文档文件**: 8个
- **脚本文件**: 4个
- **总文件数**: 27个

## 🎨 设计原则

1. **分离关注点**: 源代码、测试、文档分离
2. **模块化**: 按类型组织文件 (js, css)
3. **可维护性**: 清晰的目录结构便于维护
4. **标准化**: 遵循前端项目最佳实践

---

*魔法画笔 - 专业的项目结构设计*
