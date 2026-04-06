@echo off
echo ========================================
echo MagicBrush - Windows 打包快速开始
echo ========================================
echo.

REM 检查 Node.js 是否安装
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo [信息] Node.js 版本:
node -v
echo.

REM 检查 npm 是否安装
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 npm
    pause
    exit /b 1
)

echo [信息] npm 版本:
npm -v
echo.

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo [信息] 正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
    echo [成功] 依赖安装完成
) else (
    echo [信息] 依赖已安装，跳过安装步骤
)
echo.

echo ========================================
echo 选择操作:
echo ========================================
echo 1. 运行应用 (开发模式)
echo 2. 打包为安装程序 (.exe)
echo 3. 打包为绿色软件 (免安装)
echo 4. 退出
echo ========================================
set /p choice="请输入选项 (1-4): "

if "%choice%"=="1" (
    echo.
    echo [信息] 正在启动应用...
    call npm start
) else if "%choice%"=="2" (
    echo.
    echo [信息] 正在打包为安装程序...
    echo [提示] 这可能需要几分钟时间，请耐心等待...
    call npm run dist:win
    if %errorlevel% equ 0 (
        echo.
        echo [成功] 打包完成!
        echo [提示] 安装程序位于: dist\MagicBrush Setup 1.0.0.exe
    ) else (
        echo [错误] 打包失败
    )
) else if "%choice%"=="3" (
    echo.
    echo [信息] 正在打包为绿色软件...
    echo [提示] 这可能需要几分钟时间，请耐心等待...
    call npm run dist
    if %errorlevel% equ 0 (
        echo.
        echo [成功] 打包完成!
        echo [提示] 绿色软件位于: dist\MagicBrush-win32-x64\
    ) else (
        echo [错误] 打包失败
    )
) else if "%choice%"=="4" (
    echo.
    echo [信息] 退出
    exit /b 0
) else (
    echo.
    echo [错误] 无效的选项
)

echo.
pause
