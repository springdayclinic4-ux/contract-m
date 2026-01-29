@echo off
chcp 65001 >nul
echo ========================================
echo TailwindCSS v3 설치
echo ========================================
echo.

cd /d "%~dp0"

echo TailwindCSS v4는 PostCSS 플러그인이 분리되어 v3로 다운그레이드합니다...
echo.

call npm uninstall tailwindcss
call npm install -D tailwindcss@3.4.1 postcss autoprefixer

if errorlevel 1 (
    echo.
    echo [오류] 설치 실패
    pause
    exit /b 1
)

echo.
echo TailwindCSS 설정 파일 생성 중...
call npx tailwindcss init -p

echo.
echo ========================================
echo 설치 완료!
echo ========================================
echo.
echo 이제 다음 명령어를 실행하세요:
echo   npm run dev
echo.
pause
