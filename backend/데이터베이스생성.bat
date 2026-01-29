@echo off
echo PostgreSQL 데이터베이스 생성 스크립트
echo.
echo PostgreSQL 설치 경로를 확인 중...

set PG_PATH_18="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set PG_PATH_17="C:\Program Files\PostgreSQL\17\bin\psql.exe"
set PG_PATH_16="C:\Program Files\PostgreSQL\16\bin\psql.exe"
set PG_PATH_15="C:\Program Files\PostgreSQL\15\bin\psql.exe"

if exist %PG_PATH_18% (
    echo PostgreSQL 18 발견!
    %PG_PATH_18% -U postgres -c "CREATE DATABASE hos_contracts;" 2>nul
    if errorlevel 1 (
        echo 데이터베이스가 이미 존재하거나 오류가 발생했습니다.
        echo 수동으로 확인해주세요.
    ) else (
        echo 데이터베이스 생성 완료!
    )
    goto :end
)

if exist %PG_PATH_17% (
    echo PostgreSQL 17 발견!
    %PG_PATH_17% -U postgres -c "CREATE DATABASE hos_contracts;" 2>nul
    if errorlevel 1 (
        echo 데이터베이스가 이미 존재하거나 오류가 발생했습니다.
    ) else (
        echo 데이터베이스 생성 완료!
    )
    goto :end
)

if exist %PG_PATH_16% (
    echo PostgreSQL 16 발견!
    %PG_PATH_16% -U postgres -c "CREATE DATABASE hos_contracts;" 2>nul
    if errorlevel 1 (
        echo 데이터베이스가 이미 존재하거나 오류가 발생했습니다.
    ) else (
        echo 데이터베이스 생성 완료!
    )
    goto :end
)

if exist %PG_PATH_15% (
    echo PostgreSQL 15 발견!
    %PG_PATH_15% -U postgres -c "CREATE DATABASE hos_contracts;" 2>nul
    if errorlevel 1 (
        echo 데이터베이스가 이미 존재하거나 오류가 발생했습니다.
    ) else (
        echo 데이터베이스 생성 완료!
    )
    goto :end
)

echo PostgreSQL을 찾을 수 없습니다.
echo.
echo 다음 중 하나를 시도하세요:
echo 1. pgAdmin을 사용하여 데이터베이스 생성
echo 2. PostgreSQL 설치 경로에서 직접 실행
echo 3. Prisma Migrate로 자동 생성 시도: npm run db:migrate
echo.

:end
pause
