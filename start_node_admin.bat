@echo off
:: Batch script to start the Node.js program as an administrator
set "NODE_PATH=%~dp0"
set "NODE_EXECUTABLE=node"

:: Check if the script is running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting administrative privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: Navigate to the root project directory
cd /d "%NODE_PATH%"

:: Start the Node.js application from the src folder
"%NODE_EXECUTABLE%" src/index.js
pause