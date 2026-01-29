@echo off
echo Removing node_modules and package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /q package-lock.json
echo Done!
echo.
echo Installing packages...
call npm install
echo.
echo Installation complete!
