import prisma from '../config/database.js';

async function statisticsRoutes(fastify, options) {
  /**
   * 통계 조회 (마스터 계정 전용)
   * GET /api/statistics
   */
  fastify.get('/', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.status(401).send({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const session = await prisma.session.findFirst({
      where: { accessToken: token }
    });

    if (!session) {
      return reply.status(401).send({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }

    // 마스터 권한 확인 (병원 계정만 통계 조회 가능)
    if (session.userType !== 'hospital') {
      return reply.status(403).send({
        success: false,
        message: '통계는 병원 계정(마스터)만 조회할 수 있습니다.'
      });
    }

    const hospital = await prisma.hospital.findUnique({
      where: { id: session.userId }
    });

    if (!hospital) {
      return reply.status(404).send({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // 전체 통계 조회
    const [
      totalDailyContracts,
      totalRegularContracts,
      totalDoctors,
      totalEmployees,
      totalHospitals,
      contractsByStatus,
      laborContractsByStatus,
      recentContracts,
      recentLaborContracts
    ] = await Promise.all([
      // 일용직 계약서 개수
      prisma.contract.count(),
      
      // 일반 근로계약서 개수
      prisma.laborContract.count(),
      
      // 의사 수
      prisma.doctor.count(),
      
      // 직원 수
      prisma.employee.count(),
      
      // 병원 수
      prisma.hospital.count(),
      
      // 일용직 계약서 상태별 개수
      prisma.contract.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      
      // 일반 근로계약서 상태별 개수
      prisma.laborContract.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      
      // 최근 일용직 계약서 5개
      prisma.contract.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          contractNumber: true,
          doctorName: true,
          status: true,
          createdAt: true
        }
      }),
      
      // 최근 일반 근로계약서 5개
      prisma.laborContract.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          contractNumber: true,
          employeeName: true,
          status: true,
          createdAt: true
        }
      })
    ]);

    // 상태별 개수를 객체로 변환
    const dailyStatusCounts = contractsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});

    const regularStatusCounts = laborContractsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        summary: {
          total_daily_contracts: totalDailyContracts,
          total_regular_contracts: totalRegularContracts,
          total_contracts: totalDailyContracts + totalRegularContracts,
          total_doctors: totalDoctors,
          total_employees: totalEmployees,
          total_hospitals: totalHospitals
        },
        daily_contracts: {
          total: totalDailyContracts,
          by_status: dailyStatusCounts
        },
        regular_contracts: {
          total: totalRegularContracts,
          by_status: regularStatusCounts
        },
        recent_activity: {
          daily_contracts: recentContracts,
          regular_contracts: recentLaborContracts
        }
      }
    };
  });

  /**
   * 내 통계 조회 (모든 사용자)
   * GET /api/statistics/my
   */
  fastify.get('/my', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.status(401).send({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const session = await prisma.session.findFirst({
      where: { accessToken: token }
    });

    if (!session) {
      return reply.status(401).send({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }

    // 내 계약서 통계
    const [myDailyContracts, myRegularContracts] = await Promise.all([
      prisma.contract.count({
        where: {
          creatorType: session.userType,
          creatorId: session.userId
        }
      }),
      
      prisma.laborContract.count({
        where: {
          creatorType: session.userType,
          creatorId: session.userId
        }
      })
    ]);

    return {
      success: true,
      data: {
        my_daily_contracts: myDailyContracts,
        my_regular_contracts: myRegularContracts,
        my_total_contracts: myDailyContracts + myRegularContracts
      }
    };
  });
}

export default statisticsRoutes;
