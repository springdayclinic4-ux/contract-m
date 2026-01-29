@echo off
chcp 65001 >nul
echo ========================================
echo .env 파일 업데이트
echo ========================================
echo.

set PG_PASSWORD=ektlqhaskf1!

echo PostgreSQL 비밀번호: %PG_PASSWORD%
echo.

if not exist .env (
    echo .env 파일이 없습니다. 새로 생성합니다...
    echo.
    
    REM JWT_SECRET 생성 (사용자가 제공한 값)
    set JWT_SECRET=faba88eb52cc638089b1e2529ada97111d2a85e2ac18f2579994ae161e602f36
    
    REM 추가 시크릿 생성
    set JWT_REFRESH_SECRET=
    set ENCRYPTION_KEY=
    
    for /f "tokens=*" %%a in ('powershell -Command "[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))"') do set JWT_REFRESH_SECRET=%%a
    for /f "tokens=*" %%a in ('powershell -Command "[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))"') do set ENCRYPTION_KEY=%%a
    
    (
        echo # Database
        echo DATABASE_URL=postgresql://postgres:%PG_PASSWORD%@localhost:5432/hos_contracts?schema=public
        echo.
        echo # JWT Secrets
        echo JWT_SECRET=%JWT_SECRET%
        echo JWT_REFRESH_SECRET=%JWT_REFRESH_SECRET%
        echo.
        echo # Encryption
        echo ENCRYPTION_KEY=%ENCRYPTION_KEY%
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
    
    REM 임시 파일 생성
    set TEMP_FILE=%TEMP%\env_update_%RANDOM%.tmp
    
    REM DATABASE_URL 업데이트
    powershell -Command "(Get-Content .env) -replace 'DATABASE_URL=postgresql://postgres:[^@]*@localhost:5432/hos_contracts', 'DATABASE_URL=postgresql://postgres:%PG_PASSWORD%@localhost:5432/hos_contracts' | Set-Content %TEMP_FILE%"
    
    REM 파일 교체
    move /Y %TEMP_FILE% .env >nul
    
    echo DATABASE_URL이 업데이트되었습니다!
)

echo.
echo ========================================
echo 업데이트 완료!
echo ========================================
echo.
echo DATABASE_URL=postgresql://postgres:***@localhost:5432/hos_contracts?schema=public
echo.
echo 이제 다음 명령어를 실행하세요:
echo   npm run db:migrate
echo.
pause
