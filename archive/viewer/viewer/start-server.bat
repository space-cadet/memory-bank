@echo off
REM Approach 2: Start the dynamic server for real-time file discovery
REM Usage: start-server.bat
REM Then open http://localhost:8000/viewer.html in your browser

cls
echo.
echo 🚀 Starting Memory Bank Viewer Server...
echo.
echo This approach:
echo   ✅ Real-time file discovery (always fresh)
echo   ✅ No build step needed
echo   ❌ Requires Node.js
echo   ❌ Must use http://
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed.
    echo    Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Using Node.js %NODE_VERSION%
echo.

REM Change to script directory
cd /d "%~dp0"

echo Starting server on http://localhost:8000...
echo.
echo 📖 Open in your browser: http://localhost:8000/viewer.html
echo 📡 API endpoint: http://localhost:8000/api/files
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js
pause
