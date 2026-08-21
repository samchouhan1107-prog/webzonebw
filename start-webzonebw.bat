@echo off
setlocal

title WEBZONEBW.in Server

echo.
echo ==========================================================
echo              WEBZONEBW.in SERVER
echo ==========================================================
echo.

cd /d "%~dp0"

echo [WEBZONEBW] Project:
echo %CD%
echo.

echo [WEBZONEBW] Checking Node.js...
node -v
if errorlevel 1 (
    echo.
    echo ERROR: Node.js is not installed or not available.
    echo Please install Node.js and try again.
    pause
    exit /b 1
)

echo.
echo [WEBZONEBW] Checking npm...
npm -v
if errorlevel 1 (
    echo.
    echo ERROR: npm is not available.
    pause
    exit /b 1
)

echo.
echo [WEBZONEBW] Installing/checking dependencies...
call npm install

if errorlevel 1 (
    echo.
    echo ==========================================================
    echo ERROR: npm install failed.
    echo ==========================================================
    echo.
    pause
    exit /b 1
)

echo.
echo ==========================================================
echo Starting WEBZONEBW.in
echo ==========================================================
echo.
echo Website:
echo http://localhost:3000/
echo.
echo Halloween:
echo http://localhost:3000/Halloween/
echo.
echo Press CTRL+C to stop the server.
echo.

call npm start

echo.
echo ==========================================================
echo WEBZONEBW server stopped.
echo ==========================================================
echo.

pause
endlocal