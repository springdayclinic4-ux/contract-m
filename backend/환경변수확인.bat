@echo off
echo ========================================
echo .env 파일 확인 및 생성
echo ========================================
echo.

if exist .env (
    echo [확인] .env 파일이 존재합니다.
    echo.
    echo .env 파일 내용:
    echo ----------------------------------------
    type .env | findstr /C:"DATABASE_URL"
    echo ----------------------------------------
    echo.
) else (
    echo [경고] .env 파일이 없습니다!
    echo.
    echo .env 파일을 생성합니다...
    call 환경변수생성_간단.bat
    echo.
)

echo.
echo ========================================
echo PostgreSQL 연결 테스트
echo ========================================
echo.

REM PostgreSQL 경로 찾기
set PG_PATH_18="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set PG_PATH_17="C:\Program Files\PostgreSQL\17\bin\psql.exe"
set PG_PATH_16="C:\Program Files\PostgreSQL\16\bin\psql.exe"

if exist %PG_PATH_18% (
    echo PostgreSQL 18 발견!
    echo 연결 테스트 중...
    %PG_PATH_18% -U postgres -c "SELECT version();" 2>nul
    if errorlevel 1 (
        echo.
        echo [오류] PostgreSQL 연결 실패!
        echo.
        echo 가능한 원인:
        echo 1. 비밀번호가 잘못되었습니다
        echo 2. PostgreSQL 서비스가 실행되지 않았습니다
        echo 3. .env 파일의 DATABASE_URL을 확인하세요
        echo.
    ) else (
        echo.
        echo [성공] PostgreSQL 연결 성공!
        echo.
    )
    goto :check_db
)

if exist %PG_PATH_17% (
    echo PostgreSQL 17 발견!
    %PG_PATH_17% -U postgres -c "SELECT version();" 2>nul
    if errorlevel 1 (
        echo [오류] PostgreSQL 연결 실패!
    ) else (
        echo [성공] PostgreSQL 연결 성공!
    )
    goto :check_db
)

if exist %PG_PATH_16% (
    echo PostgreSQL 16 발견!
    %PG_PATH_16% -U postgres -c "SELECT version();" 2>nul
    if errorlevel 1 (
        echo [오류] PostgreSQL 연결 실패!
    ) else (
        echo [성공] PostgreSQL 연결 성공!
    )
    goto :check_db
)

echo PostgreSQL을 찾을 수 없습니다.
goto :end

:check_db
echo.
echo ========================================
echo 데이터베이스 존재 확인
echo ========================================
echo.

if exist %PG_PATH_18% (
    %PG_PATH_18% -U postgres -lqt 2>nul | findstr /C:"hos_contracts" >nul
    if errorlevel 1 (
        echo [경고] hos_contracts 데이터베이스가 없습니다.
        echo 데이터베이스생성.bat을 실행하세요.
    ) else (
        echo [확인] hos_contracts 데이터베이스가 존재합니다.
    )
    goto :end
)

if exist %PG_PATH_17% (
    %PG_PATH_17% -U postgres -lqt 2>nul | findstr /C:"hos_contracts" >nul
    if errorlevel 1 (
        echo [경고] hos_contracts 데이터베이스가 없습니다.
    ) else (
        echo [확인] hos_contracts 데이터베이스가 존재합니다.
    )
    goto :end
)

if exist %PG_PATH_16% (
    %PG_PATH_16% -U postgres -lqt 2>nul | findstr /C:"hos_contracts" >nul
    if errorlevel 1 (
        echo [경고] hos_contracts 데이터베이스가 없습니다.
    ) else (
        echo [확인] hos_contracts 데이터베이스가 존재합니다.
    )
    goto :end
)

:end
echo.
pause
