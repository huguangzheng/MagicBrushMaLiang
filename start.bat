@echo off
echo 正在启动魔法画笔应用...
echo.
echo 请在浏览器中打开以下地址:
echo http://localhost:8000
echo.
echo 按 Ctrl+C 停止服务器
echo.

python -m http.server 8000

pause
