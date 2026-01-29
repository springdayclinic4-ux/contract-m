@echo off
chcp 65001 >nul
echo ========================================
echo Prisma 5.x 설치
echo ========================================
echo.

cd /d "%~dp0"

echo Prisma 5.19.1로 다운그레이드 중...
echo (Prisma 7.x에서 발생하는 엔진 타입 문제 해결)
echo.

call npm install prisma@5.19.1 @prisma/client@5.19.1

if errorlevel 1 (
    echo.
    echo [오류] Prisma 설치 실패
    pause
    exit /b 1
)

echo.
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
echo 설치 완료!
echo ========================================
echo.
echo 이제 다음 명령어를 실행하세요:
echo   npm run dev
echo.
pause
