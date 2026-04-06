# MagicBrush - Windows 打包指南

## 项目结构
```
MagicBrushMaLiang/
├── electron/
│   └── main.js          # Electron 主进程
├── build/
│   └── icon.ico         # 应用图标 (需要添加)
├── src/
│   ├── css/
│   └── js/
├── index.html           # 应用入口
├── package.json         # 项目配置
└── BUILD_GUIDE.md       # 本文档
```

## 安装依赖

### 1. 安装 Node.js
从 https://nodejs.org/ 下载并安装 Node.js (推荐 v18 或更高版本)

### 2. 安装项目依赖
```bash
cd d:/code/MagicBrushMaLiang
npm install
```

## 准备应用图标

### 方法1: 使用在线工具
1. 访问 https://www.favicon-generator.org/
2. 上传一个 PNG 图片 (建议 512x512 或更大)
3. 生成 .ico 文件并保存到 `build/icon.ico`

### 方法2: 使用 ImageMagick (已安装)
```bash
# 将你的图标图片 (icon.png) 转换为 .ico
magick icon.png -define icon:auto-resize=256,128,96,64,48,32,16 build/icon.ico
```

### 方法3: 暂时使用默认图标
如果没有图标，可以暂时注释掉 `package.json` 中的 icon 配置

## 运行应用

### 开发模式
```bash
npm start
```

## 打包应用

### 方式1: 打包为安装程序 (.exe)
```bash
npm run dist:win
```

这会在 `dist` 目录下生成：
- `MagicBrush Setup 1.0.0.exe` - 安装程序

### 方式2: 打包为绿色软件 (免安装)
```bash
npm run dist
```

这会在 `dist` 目录下生成：
- `MagicBrush-win32-x64` - 可执行文件夹（免安装）

## 打包输出位置

所有打包的文件都在 `dist/` 目录中：

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

## 常见问题

### 1. 安装依赖失败
```bash
# 清除缓存并重新安装
npm cache clean --force
npm install
```

### 2. 打包失败 - 找不到图标
确保 `build/icon.ico` 文件存在，或临时注释掉 `package.json` 中的 icon 配置

### 3. 打包失败 - 权限问题
以管理员身份运行命令提示符，然后执行打包命令

### 4. 应用启动失败
- 检查 `index.html` 是否存在
- 检查 `src/js/app.js` 和 `src/css/styles.css` 是否存在
- 确保所有文件路径正确

## 高级配置

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
    // ...
});
```

### 添加自动更新
可以使用 `electron-updater` 实现自动更新功能

## 发布应用

### 1. 测试安装程序
```
dist/MagicBrush Setup 1.0.0.exe
```

### 2. 测试绿色软件
```
dist/MagicBrush-win32-x64/MagicBrush.exe
```

### 3. 分发
- 安装程序便于用户安装和卸载
- 绿色软件可以直接运行，适合便携使用

## 性能优化

### 1. 减小打包体积
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

### 2. 启用代码压缩
Electron Builder 会自动压缩代码

## 系统要求

- Windows 10 或更高版本
- 至少 4GB RAM
- 100MB 可用磁盘空间

## 技术栈

- **Electron**: 跨平台桌面应用框架
- **HTML5**: 应用界面
- **Canvas API**: 绘图功能
- **JavaScript**: 应用逻辑

## 参考链接

- Electron 官方文档: https://www.electronjs.org/
- Electron Builder 文档: https://www.electron.build/
