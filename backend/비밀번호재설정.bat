@echo off
echo ========================================
echo PostgreSQL 비밀번호 재설정 가이드
echo ========================================
echo.
echo 이 스크립트는 PostgreSQL 비밀번호를 재설정하는 방법을 안내합니다.
echo.
echo 방법 1: pgAdmin 사용 (권장)
echo ----------------------------------------
echo 1. pgAdmin 실행
echo 2. 서버 연결 시 비밀번호 입력
echo 3. 서버 우클릭 - Properties - Connection
echo 4. 비밀번호 변경
echo.
echo 방법 2: SQL Shell 사용
echo ----------------------------------------
echo 1. 시작 메뉴에서 "SQL Shell (psql)" 실행
echo 2. 연결 정보 입력:
echo    - 서버: localhost (Enter)
echo    - 데이터베이스: postgres (Enter)
echo    - 포트: 5432 (Enter)
echo    - 사용자명: postgres (Enter)
echo    - 비밀번호: (기존 비밀번호 입력)
echo.
echo 3. 연결 성공 후 다음 명령어 실행:
echo    ALTER USER postgres WITH PASSWORD '새비밀번호';
echo.
echo 방법 3: 비밀번호를 모르는 경우
echo ----------------------------------------
echo pgAdmin에서 서버 연결 시도:
echo - 일반적인 기본 비밀번호 시도: postgres, admin, password, 1234
echo - 또는 설치 시 설정한 비밀번호
echo.
echo ========================================
echo.
echo .env 파일의 DATABASE_URL을 업데이트하는 방법:
echo.
echo 1. backend/.env 파일 열기
echo 2. 다음 줄 찾기:
echo    DATABASE_URL=postgresql://postgres:비밀번호@localhost:5432/hos_contracts?schema=public
echo 3. '비밀번호' 부분을 새로 설정한 비밀번호로 변경
echo.
echo ========================================
pause
