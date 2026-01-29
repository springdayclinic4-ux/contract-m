@echo off
chcp 65001 >nul
echo ========================================
echo Prisma 클라이언트 재생성
echo ========================================
echo.

cd /d "%~dp0"

echo Prisma 클라이언트 재생성 중...
echo.

call npm run db:generate

if errorlevel 1 (
    echo.
    echo [오류] Prisma 클라이언트 생성 실패
    pause
    exit /b 1
)

echo.
echo ========================================
echo 재생성 완료!
echo ========================================
echo.
echo 이제 다음 명령어를 실행하세요:
echo   npm run dev
echo.
pause
