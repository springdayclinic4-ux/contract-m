@echo off
echo ========================================
echo PostgreSQL 비밀번호 테스트
echo ========================================
echo.
echo 이 스크립트는 여러 일반적인 비밀번호를 테스트합니다.
echo.
echo 주의: 이 방법은 보안상 권장되지 않지만, 빠른 확인용으로 사용할 수 있습니다.
echo.

set TEST_PASSWORDS=postgres admin password 1234 password123 postgres123

echo 테스트할 비밀번호 목록:
for %%p in (%TEST_PASSWORDS%) do echo - %%p

echo.
echo PostgreSQL 경로 찾기...
echo.

set PG_PATH_18="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set PG_PATH_17="C:\Program Files\PostgreSQL\17\bin\psql.exe"
set PG_PATH_16="C:\Program Files\PostgreSQL\16\bin\psql.exe"

set PSQL_PATH=

if exist %PG_PATH_18% (
    set PSQL_PATH=%PG_PATH_18%
    echo PostgreSQL 18 발견!
    goto :test
)

if exist %PG_PATH_17% (
    set PSQL_PATH=%PG_PATH_17%
    echo PostgreSQL 17 발견!
    goto :test
)

if exist %PG_PATH_16% (
    set PSQL_PATH=%PG_PATH_16%
    echo PostgreSQL 16 발견!
    goto :test
)

echo PostgreSQL을 찾을 수 없습니다.
pause
exit /b 1

:test
echo.
echo 비밀번호 테스트 중...
echo (각 비밀번호를 시도합니다. 시간이 걸릴 수 있습니다.)
echo.

for %%p in (%TEST_PASSWORDS%) do (
    echo 테스트 중: %%p
    echo %%p| %PSQL_PATH% -U postgres -c "SELECT version();" 2>nul >nul
    if not errorlevel 1 (
        echo.
        echo ========================================
        echo [성공] 비밀번호를 찾았습니다: %%p
        echo ========================================
        echo.
        echo .env 파일의 DATABASE_URL을 다음과 같이 설정하세요:
        echo DATABASE_URL=postgresql://postgres:%%p@localhost:5432/hos_contracts?schema=public
        echo.
        pause
        exit /b 0
    )
)

echo.
echo ========================================
echo [실패] 일반적인 비밀번호로 연결할 수 없습니다.
echo ========================================
echo.
echo 다음 방법을 시도하세요:
echo 1. pgAdmin에서 서버 연결 시 비밀번호 확인
echo 2. Windows 자격 증명 관리자에서 확인
echo 3. PostgreSQL 비밀번호 재설정
echo.
echo 자세한 내용은 "PostgreSQL비밀번호확인가이드.md"를 참고하세요.
echo.
pause
