@echo off
chcp 65001 >nul
echo ========================================
echo 魔法画笔测试运行器
echo ========================================
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

REM 进入tests目录
cd tests

REM 检查命令行参数
if "%1"=="" (
    echo 🚀 运行所有测试...
    echo.
    node test-runner.js all
) else if "%1"=="suite" (
    echo 🚀 运行测试套件: %2
    echo.
    node test-runner.js suite "%2"
) else if "%1"=="test" (
    echo 🚀 运行测试: %2 > %3
    echo.
    node test-runner.js test "%2" "%3"
) else if "%1"=="list" (
    echo 📋 列出所有测试套件...
    echo.
    node test-runner.js list
) else if "%1"=="help" (
    node test-runner.js help
) else (
    echo ❌ 未知命令: %1
    echo.
    node test-runner.js help
)

REM 返回上级目录
cd ..

echo.
echo ========================================
echo 测试完成
echo ========================================
echo.

REM 暂停以便查看结果
if not "%1"=="list" if not "%1"=="help" (
    pause
)
