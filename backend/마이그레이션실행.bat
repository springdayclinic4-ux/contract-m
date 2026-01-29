@echo off
chcp 65001 >nul
echo ========================================
echo 데이터베이스 마이그레이션 실행
echo ========================================
echo.

cd /d "%~dp0"

echo 현재 디렉토리: %CD%
echo.

if not exist package.json (
    echo [오류] package.json 파일을 찾을 수 없습니다.
    echo 올바른 backend 디렉토리에서 실행하세요.
    pause
    exit /b 1
)

if not exist .env (
    echo [경고] .env 파일이 없습니다.
    echo.
    echo 먼저 .env 파일을 생성하세요:
    echo   1. node update-env.js 실행
    echo   2. 또는 .env 파일을 직접 생성
    echo.
    pause
    exit /b 1
)

echo .env 파일 확인 완료
echo.

echo 마이그레이션 실행 중...
echo.

call npm run db:migrate

if errorlevel 1 (
    echo.
    echo [오류] 마이그레이션 실행 중 오류가 발생했습니다.
    echo.
    echo 확인 사항:
    echo   1. PostgreSQL 서비스가 실행 중인지 확인
    echo   2. .env 파일의 DATABASE_URL이 올바른지 확인
    echo   3. 데이터베이스 'hos_contracts'가 생성되어 있는지 확인
    echo.
) else (
    echo.
    echo [성공] 마이그레이션이 완료되었습니다!
    echo.
)

pause
