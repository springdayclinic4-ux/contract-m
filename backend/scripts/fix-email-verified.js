import prisma from '../src/config/database.js';

async function fixEmailVerified() {
  try {
    console.log('이메일 인증 상태 수정 중...');

    // 모든 사용자의 emailVerified를 true로 설정
    const [hospitals, doctors, employees] = await Promise.all([
      prisma.hospital.updateMany({
        data: { emailVerified: true }
      }),
      prisma.doctor.updateMany({
        data: { emailVerified: true }
      }),
      prisma.employee.updateMany({
        data: { emailVerified: true }
      })
    ]);

    console.log(`✅ 수정 완료:`);
    console.log(`  - 병원: ${hospitals.count}개`);
    console.log(`  - 의사: ${doctors.count}개`);
    console.log(`  - 일반직원: ${employees.count}개`);
    console.log('\n이제 로그인할 수 있습니다!');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEmailVerified();
