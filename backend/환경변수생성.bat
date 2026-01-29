@echo off
chcp 65001 >nul
echo Generating additional secrets...

node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(32).toString('hex'));" > temp_refresh.txt
node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(32).toString('hex'));" > temp_encryption.txt

for /f "delims=" %%a in (temp_refresh.txt) do set JWT_REFRESH_SECRET=%%a
for /f "delims=" %%a in (temp_encryption.txt) do set ENCRYPTION_KEY=%%a

set JWT_SECRET=faba88eb52cc638089b1e2529ada97111d2a85e2ac18f2579994ae161e602f36

echo.
echo Creating .env file with your JWT_SECRET...

(
echo # Server Configuration
echo PORT=3000
echo NODE_ENV=development
echo.
echo # Database Configuration ^(PostgreSQL^)
echo DATABASE_URL=postgresql://postgres:password123@localhost:5432/hos_contracts?schema=public
echo.
echo # JWT Configuration
echo JWT_SECRET=%JWT_SECRET%
echo JWT_EXPIRES_IN=24h
echo JWT_REFRESH_SECRET=%JWT_REFRESH_SECRET%
echo JWT_REFRESH_EXPIRES_IN=7d
echo.
echo # Email Configuration ^(AWS SES^) - 나중에 설정 가능
echo AWS_REGION=ap-northeast-2
echo AWS_ACCESS_KEY_ID=your_aws_access_key
echo AWS_SECRET_ACCESS_KEY=your_aws_secret_key
echo EMAIL_FROM=noreply@yourdomain.com
echo.
echo # File Upload Configuration
echo UPLOAD_DIR=./uploads
echo MAX_FILE_SIZE=5242880
echo.
echo # Public Data API ^(공공데이터포털^) - 나중에 설정 가능
echo PUBLIC_DATA_API_KEY=your_public_data_api_key
echo.
echo # Frontend URL
echo FRONTEND_URL=http://localhost:3001
echo.
echo # Encryption Key ^(주민등록번호 암호화^)
echo ENCRYPTION_KEY=%ENCRYPTION_KEY%
) > .env

del temp_refresh.txt temp_encryption.txt 2>nul
echo.
echo .env file created successfully!
echo.
echo JWT_SECRET: %JWT_SECRET%
echo JWT_REFRESH_SECRET: %JWT_REFRESH_SECRET%
echo ENCRYPTION_KEY: %ENCRYPTION_KEY%
echo.
echo Please check the .env file and update AWS credentials when needed.
pause
