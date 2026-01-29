@echo off
chcp 65001 >nul
echo ========================================
echo PostgreSQL 비밀번호 업데이트
echo ========================================
echo.

set PG_PASSWORD=ektlqhaskf1!
set JWT_SECRET=faba88eb52cc638089b1e2529ada97111d2a85e2ac18f2579994ae161e602f36

echo PostgreSQL 비밀번호: %PG_PASSWORD%
echo.

if not exist .env (
    echo .env 파일이 없습니다. 새로 생성합니다...
    echo.
    
    (
        echo # Database
        echo DATABASE_URL=postgresql://postgres:%PG_PASSWORD%@localhost:5432/hos_contracts?schema=public
        echo.
        echo # JWT Secrets
        echo JWT_SECRET=%JWT_SECRET%
        echo JWT_REFRESH_SECRET=0e493729d850e9e176b44aea03a6049f1db702712521f7e3594af125915d91d3
        echo.
        echo # Encryption
        echo ENCRYPTION_KEY=4f84869d76cc6c0f7a8624982962f92e0d01f2b8fb6b74a257da9cfd20060910
        echo.
        echo # AWS Configuration
        echo AWS_REGION=ap-northeast-2
        echo AWS_ACCESS_KEY_ID=
        echo AWS_SECRET_ACCESS_KEY=
        echo AWS_SES_FROM_EMAIL=
        echo.
        echo # Server
        echo PORT=3000
        echo NODE_ENV=development
    ) > .env
    
    echo .env 파일이 생성되었습니다!
) else (
    echo .env 파일이 존재합니다. DATABASE_URL을 업데이트합니다...
    echo.
    
    REM PowerShell을 사용하여 DATABASE_URL 업데이트
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$content = Get-Content .env -Raw; $content = $content -replace 'DATABASE_URL=postgresql://postgres:[^@]*@localhost:5432/hos_contracts[^\r\n]*', 'DATABASE_URL=postgresql://postgres:%PG_PASSWORD%@localhost:5432/hos_contracts?schema=public'; Set-Content .env -Value $content -NoNewline"
    
    echo DATABASE_URL이 업데이트되었습니다!
)

echo.
echo ========================================
echo 업데이트 완료!
echo ========================================
echo.
echo 이제 다음 명령어를 실행하세요:
echo   npm run db:migrate
echo.
pause
