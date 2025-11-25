@echo off
REM Quick start script for Windows
REM Usage: quickstart.bat

cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   Blockchain Voting System - Quick Start               ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Step 1: Install dependencies
echo [1/4] Installing dependencies...
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo Trying npm install --force...
    call npm install --force
)
echo ✓ Dependencies installed
echo.

REM Step 2: Compile contracts
echo [2/4] Compiling smart contracts...
call npm run compile
if errorlevel 1 (
    echo ERROR: Compilation failed
    pause
    exit /b 1
)
echo ✓ Contracts compiled
echo.

REM Step 3: Run tests
echo [3/4] Running tests...
call npm test
if errorlevel 1 (
    echo ERROR: Tests failed
    pause
    exit /b 1
)
echo ✓ All tests passed
echo.

REM Step 4: Ready for dev
echo [4/4] Ready to start development!
echo.
echo Next steps:
echo.
echo   Terminal 1: npm run node
echo   Terminal 2: npm run deploy:localhost
echo   Terminal 3: npm run serve
echo.
echo   Then open: http://localhost:3000
echo.
echo ✓ Setup complete!
echo.
pause
