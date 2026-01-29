import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

// DATABASE_URL 확인
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL 환경 변수가 설정되지 않았습니다.');
  console.error('   .env 파일에 DATABASE_URL을 설정하세요.');
  process.exit(1);
}

// Prisma 7에서는 DATABASE_URL 환경 변수를 자동으로 읽습니다
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Test connection
prisma.$connect()
  .then(() => {
    console.log('✅ PostgreSQL database connected via Prisma');
  })
  .catch((err) => {
    console.error('❌ PostgreSQL connection error:', err.message);
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
