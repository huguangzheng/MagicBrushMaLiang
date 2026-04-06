# MagicBrush - Windows 打包说明

## 🎯 项目概述

MagicBrush (魔法画笔) 是一个功能强大的HTML5 Canvas绘图应用，现已支持打包为Windows桌面应用程序。

## 📦 打包方案

本项目使用 **Electron** 将Web应用打包为Windows可执行文件，支持：
- ✅ 安装程序 (.exe) - 便于用户安装和卸载
- ✅ 绿色软件 (免安装) - 可直接运行，适合便携使用
- ✅ Windows 10/11 兼容

## 🚀 快速开始

### 方式1: 使用自动化脚本（推荐）

双击运行 `build.bat` 文件，按照提示选择操作：

1. 运行应用（开发模式）
2. 打包为安装程序
3. 打包为绿色软件
4. 退出

### 方式2: 手动命令行操作

```bash
# 1. 安装依赖
npm install

# 2. 运行应用（开发模式）
npm start

# 3. 打包为安装程序
npm run dist:win

# 4. 打包为绿色软件
npm run dist
```

## 📋 系统要求

### 开发环境
- **Node.js**: v18 或更高版本
- **npm**: v9 或更高版本
- **操作系统**: Windows 10/11

### 运行环境
- **操作系统**: Windows 10 或更高版本
- **内存**: 至少 4GB RAM
- **磁盘空间**: 至少 100MB 可用空间

## 📁 项目结构

```
MagicBrushMaLiang/
├── electron/
│   └── main.js              # Electron 主进程
├── build/
│   └── icon_placeholder.txt # 图标占位符说明
├── src/
│   ├── css/
│   │   └── styles.css       # 样式文件
│   └── js/
│       └── app.js           # 应用逻辑
├── index.html               # 应用入口
├── package.json             # 项目配置
├── build.bat                # 快速打包脚本
├── BUILD_GUIDE.md           # 详细打包指南
└── WINDOWS_PACKAGING.md     # 本文档
```

## 🎨 自定义配置

### 修改应用名称

编辑 `package.json`:
```json
{
  "name": "magicbrush",
  "productName": "MagicBrush",
  "build": {
    "appId": "com.magicbrush.app"
  }
}
```

### 修改窗口大小

编辑 `electron/main.js`:
```javascript
mainWindow = new BrowserWindow({
    width: 1400,  // 修改窗口宽度
    height: 900,  // 修改窗口高度
    minWidth: 1024,
    minHeight: 768
});
```

### 添加应用图标

1. 准备一个PNG格式的图标图片（建议512x512或更大）
2. 将其转换为.ico格式
3. 保存为 `build/icon.ico`
4. 取消注释 `package.json` 和 `electron/main.js` 中的图标配置

**在线转换工具**: https://www.favicon-generator.org/

## 📦 打包输出

打包完成后，在 `dist/` 目录下会生成：

```
dist/
├── MagicBrush Setup 1.0.0.exe    # 安装程序
├── MagicBrush-win32-x64/         # 绿色软件文件夹
│   ├── MagicBrush.exe            # 主程序
│   ├── resources/
│   │   └── app.asar             # 应用代码
│   └── ...
└── builder-effective-config.yaml
```

## 🔧 常见问题

### Q1: 安装依赖失败
```bash
# 清除缓存并重新安装
npm cache clean --force
npm install
```

### Q2: 打包失败 - 找不到图标
暂时注释掉 `package.json` 中的 icon 配置即可

### Q3: 打包失败 - 权限问题
以管理员身份运行命令提示符，然后执行打包命令

### Q4: 应用启动失败
- 检查 `index.html` 是否存在
- 检查 `src/js/app.js` 和 `src/css/styles.css` 是否存在
- 确保所有文件路径正确

### Q5: 打包体积过大
在 `package.json` 中配置排除不需要的文件：
```json
{
  "build": {
    "files": [
      "**/*",
      "!**/*.test.js",
      "!tests/**",
      "!.codeartsdoer/**",
      "!.arts/**"
    ]
  }
}
```

## 🎯 功能特性

MagicBrush 支持以下绘图功能：

- ✅ 多种绘图工具（画笔、直线、矩形、圆形、椭圆、五角星）
- ✅ 颜色选择和快速颜色
- ✅ 画笔大小调节
- ✅ 多图层管理
- ✅ 撤销/重做功能
- ✅ 橡皮擦工具
- ✅ 网格显示和吸附
- ✅ 画布缩放
- ✅ 导出为PNG/JPG
- ✅ 工程导入/导出
- ✅ AI配色优化
- ✅ 选择和移动元素
- ✅ 快捷键支持（CTRL+Z撤销，DEL删除）

## 📖 详细文档

- **BUILD_GUIDE.md** - 详细的打包指南和配置说明
- **README.md** - 项目总体说明
- **QUICKSTART.md** - 快速开始指南
- **USAGE.md** - 使用说明

## 🔗 技术栈

- **Electron**: v28.0.0 - 跨平台桌面应用框架
- **HTML5**: 应用界面
- **Canvas API**: 绘图功能
- **JavaScript**: 应用逻辑
- **Electron Builder**: v24.6.0 - 打包工具

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交问题和改进建议！

## 📞 支持

如有问题，请查看详细文档或提交Issue。

---

**祝您使用愉快！** 🎉
