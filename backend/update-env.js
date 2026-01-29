import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PG_PASSWORD = 'ektlqhaskf1!';
const JWT_SECRET = 'faba88eb52cc638089b1e2529ada97111d2a85e2ac18f2579994ae161e602f36';
const JWT_REFRESH_SECRET = '0e493729d850e9e176b44aea03a6049f1db702712521f7e3594af125915d91d3';
const ENCRYPTION_KEY = '4f84869d76cc6c0f7a8624982962f92e0d01f2b8fb6b74a257da9cfd20060910';

const envPath = path.join(__dirname, '.env');

// 비밀번호에 특수문자가 있으므로 URL 인코딩
const encodedPassword = encodeURIComponent(PG_PASSWORD);

const envContent = `# Database
DATABASE_URL=postgresql://postgres:${encodedPassword}@localhost:5432/hos_contracts?schema=public

# JWT Secrets
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}

# Encryption
ENCRYPTION_KEY=${ENCRYPTION_KEY}

# AWS Configuration
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SES_FROM_EMAIL=

# Server
PORT=3000
NODE_ENV=development
`;

try {
  if (fs.existsSync(envPath)) {
    // 기존 파일이 있으면 DATABASE_URL만 업데이트
    let content = fs.readFileSync(envPath, 'utf8');
    content = content.replace(
      /DATABASE_URL=postgresql:\/\/postgres:[^@]*@localhost:5432\/hos_contracts[^\r\n]*/g,
      `DATABASE_URL=postgresql://postgres:${encodedPassword}@localhost:5432/hos_contracts?schema=public`
    );
    fs.writeFileSync(envPath, content, 'utf8');
    console.log('✅ .env 파일의 DATABASE_URL이 업데이트되었습니다!');
  } else {
    // 새 파일 생성
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ .env 파일이 생성되었습니다!');
  }
  console.log('\n이제 다음 명령어를 실행하세요:');
  console.log('  npm run db:migrate');
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
  process.exit(1);
}
