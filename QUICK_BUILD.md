# Windows 打包快速示例

## 🎯 一键打包

### 步骤1: 准备环境
确保已安装 Node.js: https://nodejs.org/

### 步骤2: 双击运行
双击 `build.bat` 文件

### 步骤3: 选择选项
- 选择 `2` 打包为安装程序
- 或选择 `3` 打包为绿色软件

### 步骤4: 等待完成
打包完成后，可执行文件位于 `dist/` 目录

## 📝 命令行示例

```bash
# 1. 进入项目目录
cd d:/code/MagicBrushMaLiang

# 2. 安装依赖
npm install

# 3. 打包为安装程序
npm run dist:win

# 4. 打包为绿色软件
npm run dist

# 5. 运行应用（开发模式）
npm start
```

## 🎨 打包结果

### 安装程序
```
dist/MagicBrush Setup 1.0.0.exe
```
双击运行，按提示安装

### 绿色软件
```
dist/MagicBrush-win32-x64/MagicBrush.exe
```
双击直接运行，无需安装

## 🔧 自定义图标

1. 准备图标图片 (PNG格式，建议512x512)
2. 转换为ICO格式: https://www.favicon-generator.org/
3. 保存为 `build/icon.ico`
4. 取消注释 `package.json` 中的图标配置

## 📚 更多信息

- 详细指南: `BUILD_GUIDE.md`
- 使用说明: `WINDOWS_PACKAGING.md`
- 项目文档: `README.md`
