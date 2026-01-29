@echo off
echo PostgreSQL 데이터베이스 연결 확인
echo.

echo DATABASE_URL을 확인합니다...
echo.

REM .env 파일이 있는지 확인
if not exist .env (
    echo [오류] .env 파일이 없습니다!
    echo 환경변수생성_간단.bat을 먼저 실행하세요.
    pause
    exit /b 1
)

echo .env 파일을 찾았습니다.
echo.

REM Node.js로 DATABASE_URL 읽기
node -e "const fs = require('fs'); const content = fs.readFileSync('.env', 'utf8'); const match = content.match(/DATABASE_URL=(.+)/); if (match) { console.log('DATABASE_URL:', match[1]); } else { console.log('DATABASE_URL을 찾을 수 없습니다.'); }"

echo.
echo PostgreSQL 연결 테스트를 시도합니다...
echo.

REM PostgreSQL 경로 찾기
set PG_PATH_18="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set PG_PATH_17="C:\Program Files\PostgreSQL\17\bin\psql.exe"
set PG_PATH_16="C:\Program Files\PostgreSQL\16\bin\psql.exe"

if exist %PG_PATH_18% (
    echo PostgreSQL 18 발견!
    %PG_PATH_18% -U postgres -c "SELECT version();" 2>nul
    if errorlevel 1 (
        echo [오류] PostgreSQL 연결 실패!
        echo 비밀번호를 확인하세요.
    ) else (
        echo [성공] PostgreSQL 연결 성공!
    )
    goto :end
)

if exist %PG_PATH_17% (
    echo PostgreSQL 17 발견!
    %PG_PATH_17% -U postgres -c "SELECT version();" 2>nul
    if errorlevel 1 (
        echo [오류] PostgreSQL 연결 실패!
    ) else (
        echo [성공] PostgreSQL 연결 성공!
    )
    goto :end
)

if exist %PG_PATH_16% (
    echo PostgreSQL 16 발견!
    %PG_PATH_16% -U postgres -c "SELECT version();" 2>nul
    if errorlevel 1 (
        echo [오류] PostgreSQL 연결 실패!
    ) else (
        echo [성공] PostgreSQL 연결 성공!
    )
    goto :end
)

echo PostgreSQL을 찾을 수 없습니다.

:end
pause
