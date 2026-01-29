@echo off
chcp 65001 >nul
echo ========================================
echo .env 파일 생성/업데이트
echo ========================================
echo.

cd /d "%~dp0"

echo Node.js 스크립트로 .env 파일 생성 중...
echo.

node update-env.js

if errorlevel 1 (
    echo.
    echo [오류] .env 파일 생성 실패
    echo.
    echo 수동으로 .env 파일을 생성하세요:
    echo.
    echo backend/.env 파일을 만들고 다음 내용을 입력:
    echo.
    echo DATABASE_URL=postgresql://postgres:ektlqhaskf1!@localhost:5432/hos_contracts?schema=public
    echo JWT_SECRET=faba88eb52cc638089b1e2529ada97111d2a85e2ac18f2579994ae161e602f36
    echo JWT_REFRESH_SECRET=0e493729d850e9e176b44aea03a6049f1db702712521f7e3594af125915d91d3
    echo ENCRYPTION_KEY=4f84869d76cc6c0f7a8624982962f92e0d01f2b8fb6b74a257da9cfd20060910
    echo AWS_REGION=ap-northeast-2
    echo PORT=3000
    echo NODE_ENV=development
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo .env 파일 설정 완료!
echo ========================================
echo.
echo 이제 다음 명령어를 실행하세요:
echo   npm run db:migrate
echo.
pause
