# JWT Secret 생성 및 .env 파일 생성 스크립트

Write-Host "Generating JWT secrets..." -ForegroundColor Green

# JWT Secret 생성
$jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
$jwtRefreshSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
$encryptionKey = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Node.js를 사용한 더 안전한 랜덤 생성 시도
try {
    $nodeResult = node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(32).toString('hex'));"
    if ($nodeResult) {
        $jwtSecret = $nodeResult.Trim()
        $jwtRefreshSecret = (node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(32).toString('hex'));").Trim()
        $encryptionKey = (node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(32).toString('hex'));").Trim()
    }
} catch {
    Write-Host "Using PowerShell random generation..." -ForegroundColor Yellow
}

Write-Host "Creating .env file..." -ForegroundColor Green

# .env 파일 내용 생성
$envContent = @"
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (PostgreSQL)
DATABASE_URL=postgresql://postgres:password123@localhost:5432/hos_contracts?schema=public

# JWT Configuration
JWT_SECRET=$jwtSecret
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=$jwtRefreshSecret
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (AWS SES) - 나중에 설정 가능
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
EMAIL_FROM=noreply@yourdomain.com

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Public Data API (공공데이터포털) - 나중에 설정 가능
PUBLIC_DATA_API_KEY=your_public_data_api_key

# Frontend URL
FRONTEND_URL=http://localhost:3001

# Encryption Key (주민등록번호 암호화)
ENCRYPTION_KEY=$encryptionKey
"@

# .env 파일 저장
$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline

Write-Host ""
Write-Host ".env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Generated secrets:" -ForegroundColor Cyan
Write-Host "JWT_SECRET: $jwtSecret" -ForegroundColor Gray
Write-Host "JWT_REFRESH_SECRET: $jwtRefreshSecret" -ForegroundColor Gray
Write-Host "ENCRYPTION_KEY: $encryptionKey" -ForegroundColor Gray
Write-Host ""
Write-Host "Please check the .env file and update AWS credentials when needed." -ForegroundColor Yellow
