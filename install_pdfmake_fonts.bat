@echo off
setlocal enabledelayedexpansion

REM Enable detailed error messages
set ERROR_FLAG=0


REM Go to package directory
if %ERROR_FLAG% equ 0 (
    cd node_modules\pdfmake || (
        echo Failed to navigate to pdfmake directory
        set ERROR_FLAG=1
    )
)

REM Create fonts directory if not exists
if %ERROR_FLAG% equ 0 (
    if not exist examples\fonts (
        mkdir examples\fonts
        echo Created examples\fonts directory
    ) else (
        echo examples\fonts directory already exists
    )
)

REM Copy fonts to examples/fonts
if %ERROR_FLAG% equ 0 (
    xcopy "..\..\src\assets\fonts\*" examples\fonts\ /Y
    if %errorlevel% neq 0 (
        echo Failed to copy fonts
        set ERROR_FLAG=1
    )
)

REM Run build-vfs.js
if %ERROR_FLAG% equ 0 (
    node build-vfs.js "./examples/fonts"
    if %errorlevel% neq 0 (
        echo Failed to build vfs_fonts.js
        set ERROR_FLAG=1
    )
    cd ..
)

if %ERROR_FLAG% equ 0 (
    echo Process completed successfully.
) else (
    echo Process failed.
)

pause
exit /b %ERROR_FLAG%
