import prisma from '../src/config/database.js';

async function main() {
  await prisma.session.deleteMany();
  await prisma.emailVerification.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.employee.deleteMany();

  console.log('✅ 사용자/세션/이메일인증 데이터 전체 삭제 완료');
}

main()
  .catch((error) => {
    console.error('❌ 데이터 삭제 실패:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
