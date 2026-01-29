@echo off
chcp 65001 >nul
echo ========================================
echo 프론트엔드 패키지 설치
echo ========================================
echo.

cd /d "%~dp0"

echo 필요한 패키지 설치 중...
echo - TailwindCSS
echo - Zod (검증)
echo - React Hook Form
echo - Axios
echo.

call npm install

if errorlevel 1 (
    echo.
    echo [오류] 패키지 설치 실패
    pause
    exit /b 1
)

echo.
echo TailwindCSS 추가 패키지 설치 중...
echo.

call npm install -D tailwindcss postcss autoprefixer
call npx tailwindcss init -p

if errorlevel 1 (
    echo.
    echo [경고] TailwindCSS 설치 중 오류 발생
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
