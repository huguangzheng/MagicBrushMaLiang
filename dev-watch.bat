@echo off
chcp 65001 >nul
echo ========================================
echo 魔法画笔开发监控模式
echo ========================================
echo.
echo 此模式将监控文件变化并自动运行测试
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未找到Node.js
    echo 请先安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js已安装
echo.

REM 检查测试文件是否存在
if not exist "tests\test-runner.js" (
    echo ❌ 错误: 未找到测试运行器
    echo 请确保tests目录存在并包含test-runner.js
    pause
    exit /b 1
)

echo ✅ 测试文件已找到
echo.
echo ========================================
echo 启动开发监控...
echo ========================================
echo.
echo 监控的文件:
echo   - app.js
echo   - styles.css
echo   - index.html
echo.
echo 当这些文件发生变化时,将自动运行所有测试
echo.
echo 按 Ctrl+C 停止监控
echo.
echo ========================================
echo.

REM 启动开发监控
node dev-watch.js

REM 如果脚本意外退出
echo.
echo ========================================
echo 监控已停止
echo ========================================
pause
