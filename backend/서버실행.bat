@echo off
chcp 65001 >nul
echo ========================================
echo HOS Contract Management API 서버 실행
echo ========================================
echo.

cd /d "%~dp0"

if not exist .env (
    echo [경고] .env 파일이 없습니다.
    echo 먼저 .env 파일을 생성하세요:
    echo   node update-env.js
    echo.
    pause
    exit /b 1
)

echo 서버를 시작합니다...
echo.
echo 서버 중지: Ctrl + C
echo.
echo ========================================
echo.

call npm run dev
