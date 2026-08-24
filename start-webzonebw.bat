```bat
@echo off
setlocal EnableExtensions

title WEBZONEBW.in - Local Development Server

echo.
echo ==========================================================
echo                 WEBZONEBW.in
echo             LOCAL DEVELOPMENT SERVER
echo ==========================================================
echo.

cd /d "%~dp0"

echo [WEBZONEBW] Project directory:
echo %CD%
echo.

REM ==========================================================
REM NODE.JS CHECK
REM ==========================================================

echo [WEBZONEBW] Checking Node.js...

where node >nul 2>&1

if errorlevel 1 (
    echo.
    echo ==========================================================
    echo ERROR: Node.js was not found.
    echo ==========================================================
    echo.
    echo Please install Node.js and restart this launcher.
    echo.
    pause
    exit /b 1
)

node -v

REM ==========================================================
REM NPM CHECK
REM ==========================================================

echo.
echo [WEBZONEBW] Checking npm...

where npm >nul 2>&1

if errorlevel 1 (
    echo.
    echo ==========================================================
    echo ERROR: npm was not found.
    echo ==========================================================
    echo.
    echo Please verify your Node.js installation.
    echo.
    pause
    exit /b 1
)

npm -v

REM ==========================================================
REM PACKAGE CHECK
REM ==========================================================

echo.
echo [WEBZONEBW] Checking project dependencies...

if not exist "package.json" (
    echo.
    echo ==========================================================
    echo ERROR: package.json was not found.
    echo ==========================================================
    echo.
    echo Make sure this launcher is inside the WebZoneBW project.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo.
    echo [WEBZONEBW] node_modules not found.
    echo [WEBZONEBW] Installing project dependencies...
    echo.

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
) else (
    echo [WEBZONEBW] Dependencies already available.
)

REM ==========================================================
REM SERVER INFORMATION
REM ==========================================================

echo.
echo ==========================================================
echo              WEBZONEBW LOCAL SERVER
echo ==========================================================
echo.

echo Local Website:
echo http://localhost:3000/
echo.

echo Main Pages:
echo http://localhost:3000/index.html
echo http://localhost:3000/about.html
echo http://localhost:3000/projects.html
echo http://localhost:3000/resume.html
echo http://localhost:3000/blog.html
echo http://localhost:3000/contact.html
echo.

echo WebZoneBW-ER:
echo http://localhost:3000/er/index.html
echo.

echo ==========================================================
echo HALLOWEEN STATUS
echo ==========================================================
echo.

if exist "halloween\index.html" (
    echo [LOCAL PREVIEW] Halloween project detected.
    echo Local path:
    echo http://localhost:3000/halloween/index.html
    echo.
    echo NOTE:
    echo Halloween is currently a development/preview experience.
    echo It is NOT being presented as a public production page.
) else (
    echo [STATUS] Halloween project is not currently present.
    echo.
    echo The Halloween experience remains unpublished until
    echo the seasonal launch is ready.
)

echo.
echo ==========================================================
echo LIVE WEBSITE
echo ==========================================================
echo.

echo Production:
echo https://www.webzonebw.in/

echo.
echo Public site status:
echo Main WebZoneBW pages are currently active.
echo Halloween remains unpublished until launch.

echo.
echo ==========================================================
echo Starting WEBZONEBW development server...
echo ==========================================================
echo.

echo Press CTRL+C to stop the server.
echo.

REM ==========================================================
REM START SERVER
REM ==========================================================

call npm start

echo.
echo ==========================================================
echo          WEBZONEBW SERVER STOPPED
echo ==========================================================
echo.

pause
endlocal
```
