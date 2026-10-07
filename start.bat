@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"

echo ==================================================
echo    Khayili Sabz  -  one click site launcher
echo ==================================================

where node >nul 2>nul
if errorlevel 1 (
    echo [X] Node.js peyda nashod. Avval nasb konid: https://nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules\json-server" (
    echo [..] npm install dar hal anjam ast, sabr konid...
    call npm install --no-fund --no-audit
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest 'http://localhost:8080' -UseBasicParsing -TimeoutSec 1 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>nul
if not errorlevel 1 (
    echo [OK] Server ghablan dar hal kar ast.
    start "" "http://localhost:8080"
    ping -n 3 127.0.0.1 >nul
    exit /b 0
)

echo [..] Roshan kardan-e server (API:3000 + Web:8080)...
start "KhayiliSabz servers" cmd /k node run.js

set /a tries=0
:wait
ping -n 2 127.0.0.1 >nul
set /a tries+=1
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest 'http://localhost:8080' -UseBasicParsing -TimeoutSec 1 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>nul
if not errorlevel 1 goto ready
if %tries% geq 30 goto failed
goto wait

:ready
echo [OK] Saite shoma amade ast: http://localhost:8080
start "" "http://localhost:8080"
ping -n 4 127.0.0.1 >nul
exit /b 0

:failed
echo [X] Server ta 30 saniye roshan nashod. Be panele server negah konid.
pause
exit /b 1
