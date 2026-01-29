@echo off
echo Creating .env file...

node -e "const crypto = require('crypto'); const fs = require('fs'); const refresh = crypto.randomBytes(32).toString('hex'); const encryption = crypto.randomBytes(32).toString('hex'); const content = `# Server Configuration\nPORT=3000\nNODE_ENV=development\n\n# Database Configuration (PostgreSQL)\nDATABASE_URL=postgresql://postgres:password123@localhost:5432/hos_contracts?schema=public\n\n# JWT Configuration\nJWT_SECRET=faba88eb52cc638089b1e2529ada97111d2a85e2ac18f2579994ae161e602f36\nJWT_EXPIRES_IN=24h\nJWT_REFRESH_SECRET=${refresh}\nJWT_REFRESH_EXPIRES_IN=7d\n\n# Email Configuration (AWS SES) - 나중에 설정 가능\nAWS_REGION=ap-northeast-2\nAWS_ACCESS_KEY_ID=your_aws_access_key\nAWS_SECRET_ACCESS_KEY=your_aws_secret_key\nEMAIL_FROM=noreply@yourdomain.com\n\n# File Upload Configuration\nUPLOAD_DIR=./uploads\nMAX_FILE_SIZE=5242880\n\n# Public Data API (공공데이터포털) - 나중에 설정 가능\nPUBLIC_DATA_API_KEY=your_public_data_api_key\n\n# Frontend URL\nFRONTEND_URL=http://localhost:3001\n\n# Encryption Key (주민등록번호 암호화)\nENCRYPTION_KEY=${encryption}\n`; fs.writeFileSync('.env', content, 'utf8'); console.log('✅ .env file created successfully!'); console.log('JWT_REFRESH_SECRET:', refresh); console.log('ENCRYPTION_KEY:', encryption);"

echo.
echo Done!
pause
