@echo off
REM Approach 1: Generate static manifest and open viewer
REM Usage: start-scan.bat
REM Then the viewer.html will open in your browser

cls
echo.
echo 🔍 Generating Memory Bank Manifest...
echo.
echo This approach:
echo   ✅ Works offline
echo   ✅ Portable
echo   ✅ No runtime dependencies
echo   ❌ Static snapshot (must re-run to see new files)
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

REM Generate manifest
echo Scanning memory bank directory...
call node generate-manifest.js

if exist "manifest.json" (
    echo.
    echo ✅ Manifest generated successfully!
    echo.
    echo 📖 To view the memory bank:
    echo    Opening viewer.html in default browser...
    echo.

    REM Open in default browser
    start "" "file://%CD%/viewer.html"

    echo 💡 To see new/changed files, run this script again
    echo.
    pause
) else (
    echo.
    echo ❌ Failed to generate manifest
    pause
    exit /b 1
)
