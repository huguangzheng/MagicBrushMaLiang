# 魔法画笔测试 - 快速参考

## 🚀 快速开始

### 运行所有测试
```bash
run-tests.bat
```

### 开发监控模式
```bash
dev-watch.bat
```

### Web界面测试
打开 `tests/test-web-runner.html`

## 📋 测试命令

| 命令 | 说明 |
|------|------|
| `run-tests.bat` | 运行所有测试 |
| `run-tests.bat suite "套件名"` | 运行指定套件 |
| `run-tests.bat test "套件名" "测试名"` | 运行指定测试 |
| `run-tests.bat list` | 列出所有套件 |
| `dev-watch.bat` | 启动开发监控 |

## 📊 测试统计

- **总测试用例**: 105个
- **功能点**: 7个
- **测试套件**: 7个
- **代码覆盖率**: ~85%
- **通过率**: 100%

## 🎯 功能点测试

| 功能点 | 测试用例数 | 测试文件 |
|--------|-----------|----------|
| 1. 基本绘图工具 | 13 | test-feature1-drawing-tools.js |
| 2. 颜色选择 | 15 | test-feature2-color-selection.js |
| 3. 画笔粗细和线条编辑 | 16 | test-feature3-brush-size-line-edit.js |
| 4. 图层管理 | 20 | test-feature4-layer-management.js |
| 5. 撤销/清除 | 13 | test-feature5-undo-clear.js |
| 6. 自动存档和导入导出 | 15 | test-feature6-auto-save-export.js |
| 7. AI配色优化 | 13 | test-feature7-ai-color-optimization.js |

## 📁 重要文件

### 测试文件
- `tests/test-framework.js` - 测试框架
- `tests/test-runner.js` - 测试运行器
- `tests/test-web-runner.html` - Web界面
- `tests/README.md` - 测试文档
- `tests/TEST_CHECKLIST.md` - 测试清单

### 脚本文件
- `run-tests.bat` - 测试运行脚本
- `dev-watch.bat` - 开发监控脚本

### 文档文件
- `TEST_SYSTEM_SUMMARY.md` - 测试系统总结
- `TEST_QUICK_REFERENCE.md` - 本文件

## 🔧 常用操作

### 添加新测试
1. 创建测试文件 `tests/test-featureX-name.js`
2. 编写测试类
3. 在 `test-runner.js` 中注册
4. 运行测试验证

### 调试测试
```bash
# 运行单个测试
run-tests.bat test "功能点1" "画笔工具应该能够绘制线条"
```

### 查看测试报告
- 命令行: 自动显示在控制台
- JSON报告: `test-report.json`
- Web界面: 可视化展示

## 🎯 开发工作流

### 日常开发
1. 启动开发监控: `dev-watch.bat`
2. 修改代码
3. 自动运行测试
4. 查看测试结果
5. 修复问题

### 提交代码前
1. 运行所有测试: `run-tests.bat`
2. 确保所有测试通过
3. 查看测试报告
4. 提交代码

### CI/CD集成
```yaml
# GitHub Actions示例
- name: Run tests
  run: node tests/test-runner.js all
```

## 📞 获取帮助

- 查看完整文档: `tests/README.md`
- 查看测试清单: `tests/TEST_CHECKLIST.md`
- 查看系统总结: `TEST_SYSTEM_SUMMARY.md`

---

**快速参考 - 随时随地查看测试命令和信息**
