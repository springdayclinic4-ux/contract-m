import prisma from '../config/database.js';

/**
 * Helper: 인증 및 세션 확인
 */
async function authenticateRequest(request, reply) {
  const token = request.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    reply.status(401).send({
      success: false,
      message: '인증이 필요합니다.'
    });
    return null;
  }

  const session = await prisma.session.findFirst({
    where: { accessToken: token }
  });

  if (!session) {
    reply.status(401).send({
      success: false,
      message: '유효하지 않은 토큰입니다.'
    });
    return null;
  }

  return session;
}

/**
 * Helper: 최근 30일 날짜 배열 생성 (YYYY-MM-DD)
 */
function getLast30DaysDates() {
  const dates = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

/**
 * Helper: 날짜 범위 시작 구하기
 */
function getDaysAgo(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

function getStartOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function statisticsRoutes(fastify, options) {
  // ============================================
  // GET /api/statistics - 마스터 관리자 대시보드 통계
  // ============================================
  fastify.get('/', async (request, reply) => {
    const session = await authenticateRequest(request, reply);
    if (!session) return;

    // 마스터 계정만 플랫폼 통계 조회 가능
    if (session.userType !== 'hospital') {
      return reply.status(403).send({
        success: false,
        message: '관리자 권한이 없습니다.'
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

    // 마스터 이메일 확인
    const MASTER_EMAILS = (process.env.MASTER_EMAILS || 'admin@theranova.co.kr').split(',').map(e => e.trim().toLowerCase());
    if (!MASTER_EMAILS.includes(hospital.email.toLowerCase())) {
      return reply.status(403).send({
        success: false,
        message: '관리자 권한이 없습니다.'
      });
    }

    const now = new Date();
    const startOfToday = getStartOfToday();
    const sevenDaysAgo = getDaysAgo(7);
    const thirtyDaysAgo = getDaysAgo(30);

    // ---- 모든 쿼리를 병렬로 실행 ----
    const [
      // DAU / WAU / MAU - 세션 기반 고유 사용자 수
      dauSessions,
      wauSessions,
      mauSessions,

      // 사용자 수
      totalHospitals,
      totalDoctors,
      totalEmployees,

      // 일용직 계약서 통계
      totalDailyContracts,
      dailyContractsByStatus,

      // 일반 근로계약서 통계
      totalLaborContracts,
      laborContractsByStatus,

      // 최근 30일 일용직 계약서 생성 (일별)
      dailyContractsPerDay,

      // 최근 30일 일반 근로계약서 생성 (일별)
      laborContractsPerDay,

      // 최근 30일 신규 병원 가입 (일별)
      newHospitalsPerDay,

      // 최근 30일 신규 의사 가입 (일별)
      newDoctorsPerDay,

      // 최근 30일 신규 직원 가입 (일별)
      newEmployeesPerDay,

      // 최근 일용직 계약서 10개
      recentDailyContracts,

      // 최근 일반 근로계약서 10개
      recentLaborContracts
    ] = await Promise.all([
      // DAU: 오늘 생성된 세션의 고유 사용자
      prisma.session.findMany({
        where: { createdAt: { gte: startOfToday } },
        distinct: ['userType', 'userId'],
        select: { userType: true, userId: true }
      }),

      // WAU: 최근 7일 세션의 고유 사용자
      prisma.session.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        distinct: ['userType', 'userId'],
        select: { userType: true, userId: true }
      }),

      // MAU: 최근 30일 세션의 고유 사용자
      prisma.session.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        distinct: ['userType', 'userId'],
        select: { userType: true, userId: true }
      }),

      // 총 사용자 수
      prisma.hospital.count(),
      prisma.doctor.count(),
      prisma.employee.count(),

      // 일용직 계약서
      prisma.contract.count(),
      prisma.contract.groupBy({
        by: ['status'],
        _count: { status: true }
      }),

      // 일반 근로계약서
      prisma.laborContract.count(),
      prisma.laborContract.groupBy({
        by: ['status'],
        _count: { status: true }
      }),

      // 최근 30일 일용직 계약서 일별 생성 수
      prisma.contract.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true }
      }),

      // 최근 30일 일반 근로계약서 일별 생성 수
      prisma.laborContract.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true }
      }),

      // 최근 30일 신규 병원
      prisma.hospital.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true }
      }),

      // 최근 30일 신규 의사
      prisma.doctor.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true }
      }),

      // 최근 30일 신규 직원
      prisma.employee.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true }
      }),

      // 최근 일용직 계약서 10개
      prisma.contract.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          contractNumber: true,
          doctorName: true,
          doctorEmail: true,
          wageGross: true,
          wageNet: true,
          workDates: true,
          status: true,
          createdAt: true,
          sentAt: true,
          signedAt: true,
          hospitalContract: {
            select: {
              hospitalName: true
            }
          }
        }
      }),

      // 최근 일반 근로계약서 10개
      prisma.laborContract.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          contractNumber: true,
          employeeName: true,
          employeeEmail: true,
          annualSalaryTotal: true,
          monthlyTotal: true,
          status: true,
          createdAt: true,
          sentAt: true,
          signedAt: true,
          hospitalContract: {
            select: {
              hospitalName: true
            }
          }
        }
      })
    ]);

    // ---- 상태별 개수를 객체로 변환 ----
    const dailyStatusCounts = dailyContractsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});

    const laborStatusCounts = laborContractsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});

    // ---- 일별 데이터 집계 ----
    const last30Days = getLast30DaysDates();

    function aggregateByDay(records) {
      const countMap = {};
      for (const r of records) {
        const dateStr = new Date(r.createdAt).toISOString().split('T')[0];
        countMap[dateStr] = (countMap[dateStr] || 0) + 1;
      }
      return last30Days.map(date => ({
        date,
        count: countMap[date] || 0
      }));
    }

    const contractsPerDayGraph = aggregateByDay(dailyContractsPerDay);
    const laborContractsPerDayGraph = aggregateByDay(laborContractsPerDay);

    // 신규 사용자 = 병원 + 의사 + 직원 합산
    const allNewUsers = [
      ...newHospitalsPerDay,
      ...newDoctorsPerDay,
      ...newEmployeesPerDay
    ];
    const newUsersPerDayGraph = aggregateByDay(allNewUsers);

    // 신규 사용자 유형별 일별 데이터
    const newHospitalsPerDayGraph = aggregateByDay(newHospitalsPerDay);
    const newDoctorsPerDayGraph = aggregateByDay(newDoctorsPerDay);
    const newEmployeesPerDayGraph = aggregateByDay(newEmployeesPerDay);

    return {
      success: true,
      data: {
        // 활성 사용자 지표
        active_users: {
          dau: dauSessions.length,
          wau: wauSessions.length,
          mau: mauSessions.length
        },

        // 전체 사용자 수
        users: {
          total: totalHospitals + totalDoctors + totalEmployees,
          hospitals: totalHospitals,
          doctors: totalDoctors,
          employees: totalEmployees
        },

        // 계약서 요약
        contracts: {
          total: totalDailyContracts + totalLaborContracts,
          daily_contracts: {
            total: totalDailyContracts,
            by_status: dailyStatusCounts
          },
          labor_contracts: {
            total: totalLaborContracts,
            by_status: laborStatusCounts
          }
        },

        // 그래프 데이터: 일별 계약서 생성 (최근 30일)
        contracts_per_day: contractsPerDayGraph,
        labor_contracts_per_day: laborContractsPerDayGraph,

        // 그래프 데이터: 일별 신규 사용자 (최근 30일)
        new_users_per_day: newUsersPerDayGraph,
        new_hospitals_per_day: newHospitalsPerDayGraph,
        new_doctors_per_day: newDoctorsPerDayGraph,
        new_employees_per_day: newEmployeesPerDayGraph,

        // 최근 활동
        recent_activity: {
          daily_contracts: recentDailyContracts.map(c => ({
            id: c.id,
            contract_number: c.contractNumber,
            doctor_name: c.doctorName,
            doctor_email: c.doctorEmail,
            hospital_name: c.hospitalContract?.hospitalName || null,
            wage_gross: c.wageGross,
            wage_net: c.wageNet,
            work_dates: c.workDates,
            status: c.status,
            created_at: c.createdAt,
            sent_at: c.sentAt,
            signed_at: c.signedAt
          })),
          labor_contracts: recentLaborContracts.map(c => ({
            id: c.id,
            contract_number: c.contractNumber,
            employee_name: c.employeeName,
            employee_email: c.employeeEmail,
            hospital_name: c.hospitalContract?.hospitalName || null,
            annual_salary_total: c.annualSalaryTotal,
            monthly_total: c.monthlyTotal,
            status: c.status,
            created_at: c.createdAt,
            sent_at: c.sentAt,
            signed_at: c.signedAt
          }))
        }
      }
    };
  });

  // ============================================
  // GET /api/statistics/my - 내 통계 (병원/의사/직원)
  // ============================================
  fastify.get('/my', async (request, reply) => {
    const session = await authenticateRequest(request, reply);
    if (!session) return;

    // 사용자 유형에 따라 분기
    if (session.userType === 'hospital') {
      return await getHospitalMyStats(session, reply);
    } else if (session.userType === 'doctor') {
      return await getDoctorMyStats(session, reply);
    } else if (session.userType === 'employee') {
      return await getEmployeeMyStats(session, reply);
    }

    return reply.status(400).send({
      success: false,
      message: '알 수 없는 사용자 유형입니다.'
    });
  });
}

// ============================================
// 병원 계정: 내가 생성한 모든 계약서 통계
// ============================================
async function getHospitalMyStats(session, reply) {
  const hospitalId = session.userId;

  const [
    hospital,
    dailyContracts,
    dailyContractsByStatus,
    laborContracts,
    laborContractsByStatus
  ] = await Promise.all([
    prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: { hospitalName: true, email: true }
    }),

    // 내가 만든 일용직 계약서 전체
    prisma.contract.findMany({
      where: { hospitalId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        contractNumber: true,
        doctorName: true,
        doctorEmail: true,
        wageGross: true,
        wageNet: true,
        wageType: true,
        workDates: true,
        status: true,
        createdAt: true,
        sentAt: true,
        signedAt: true
      }
    }),

    // 일용직 계약서 상태별
    prisma.contract.groupBy({
      by: ['status'],
      where: { hospitalId },
      _count: { status: true }
    }),

    // 내가 만든 일반 근로계약서 전체
    prisma.laborContract.findMany({
      where: { hospitalId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        contractNumber: true,
        employeeName: true,
        employeeEmail: true,
        annualSalaryTotal: true,
        monthlyTotal: true,
        workContractStartDate: true,
        workContractEndDate: true,
        status: true,
        createdAt: true,
        sentAt: true,
        signedAt: true
      }
    }),

    // 일반 근로계약서 상태별
    prisma.laborContract.groupBy({
      by: ['status'],
      where: { hospitalId },
      _count: { status: true }
    })
  ]);

  if (!hospital) {
    return reply.status(404).send({
      success: false,
      message: '사용자를 찾을 수 없습니다.'
    });
  }

  // 상태별 집계
  const dailyStatusCounts = dailyContractsByStatus.reduce((acc, item) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {});

  const laborStatusCounts = laborContractsByStatus.reduce((acc, item) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {});

  // 총 지급액 계산 (서명 완료된 계약서만)
  const totalDailyWageGross = dailyContracts
    .filter(c => c.status === 'signed')
    .reduce((sum, c) => sum + (Number(c.wageGross) || 0), 0);

  const totalDailyWageNet = dailyContracts
    .filter(c => c.status === 'signed')
    .reduce((sum, c) => sum + (Number(c.wageNet) || 0), 0);

  const totalLaborAnnualSalary = laborContracts
    .filter(c => c.status === 'signed')
    .reduce((sum, c) => sum + (Number(c.annualSalaryTotal) || 0), 0);

  const totalLaborMonthly = laborContracts
    .filter(c => c.status === 'signed')
    .reduce((sum, c) => sum + (Number(c.monthlyTotal) || 0), 0);

  return {
    success: true,
    data: {
      user_type: 'hospital',
      hospital_name: hospital.hospitalName,

      summary: {
        total_contracts: dailyContracts.length + laborContracts.length,
        daily_contracts: {
          total: dailyContracts.length,
          by_status: dailyStatusCounts,
          total_wage_gross: totalDailyWageGross,
          total_wage_net: totalDailyWageNet
        },
        labor_contracts: {
          total: laborContracts.length,
          by_status: laborStatusCounts,
          total_annual_salary: totalLaborAnnualSalary,
          total_monthly: totalLaborMonthly
        }
      },

      daily_contracts: dailyContracts.map(c => ({
        id: c.id,
        contract_number: c.contractNumber,
        doctor_name: c.doctorName,
        doctor_email: c.doctorEmail,
        wage_gross: c.wageGross,
        wage_net: c.wageNet,
        wage_type: c.wageType,
        work_dates: c.workDates,
        status: c.status,
        created_at: c.createdAt,
        sent_at: c.sentAt,
        signed_at: c.signedAt
      })),

      labor_contracts: laborContracts.map(c => ({
        id: c.id,
        contract_number: c.contractNumber,
        employee_name: c.employeeName,
        employee_email: c.employeeEmail,
        annual_salary_total: c.annualSalaryTotal,
        monthly_total: c.monthlyTotal,
        work_contract_start_date: c.workContractStartDate,
        work_contract_end_date: c.workContractEndDate,
        status: c.status,
        created_at: c.createdAt,
        sent_at: c.sentAt,
        signed_at: c.signedAt
      }))
    }
  };
}

// ============================================
// 의사 계정: 내가 관련된 모든 계약서 통계
// ============================================
async function getDoctorMyStats(session, reply) {
  const doctorId = session.userId;

  // 먼저 의사 정보 조회 (이메일 필요)
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: { name: true, email: true }
  });

  if (!doctor) {
    return reply.status(404).send({
      success: false,
      message: '사용자를 찾을 수 없습니다.'
    });
  }

  const contractWhere = {
    OR: [
      { doctorId },
      { doctorEmail: doctor.email }
    ]
  };

  const [dailyContracts, dailyContractsByStatus, laborContracts, laborContractsByStatus] = await Promise.all([
    // doctorId 또는 doctorEmail 매칭으로 조회
    prisma.contract.findMany({
      where: contractWhere,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        contractNumber: true,
        wageGross: true,
        wageNet: true,
        wageType: true,
        workDates: true,
        status: true,
        createdAt: true,
        sentAt: true,
        signedAt: true,
        hospitalContract: {
          select: {
            hospitalName: true
          }
        }
      }
    }),

    // 상태별
    prisma.contract.groupBy({
      by: ['status'],
      where: contractWhere,
      _count: { status: true }
    }),

    // 일반 근로계약서에서도 의사로 참여한 것 조회
    prisma.laborContract.findMany({
      where: {
        OR: [
          { doctorId },
          { employeeEmail: doctor.email }
        ]
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        contractNumber: true,
        annualSalaryTotal: true,
        monthlyTotal: true,
        workContractStartDate: true,
        workContractEndDate: true,
        status: true,
        createdAt: true,
        sentAt: true,
        signedAt: true,
        hospitalContract: {
          select: {
            hospitalName: true
          }
        }
      }
    }),

    prisma.laborContract.groupBy({
      by: ['status'],
      where: { doctorId },
      _count: { status: true }
    })
  ]);

  // 상태별 집계
  const dailyStatusCounts = dailyContractsByStatus.reduce((acc, item) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {});

  const laborStatusCounts = laborContractsByStatus.reduce((acc, item) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {});

  // 총 수입 계산 (서명 완료된 계약서만)
  const totalEarningsGross = dailyContracts
    .filter(c => c.status === 'signed')
    .reduce((sum, c) => sum + (Number(c.wageGross) || 0), 0);

  const totalEarningsNet = dailyContracts
    .filter(c => c.status === 'signed')
    .reduce((sum, c) => sum + (Number(c.wageNet) || 0), 0);

  return {
    success: true,
    data: {
      user_type: 'doctor',
      doctor_name: doctor.name,

      summary: {
        total_contracts: dailyContracts.length + laborContracts.length,
        daily_contracts: {
          total: dailyContracts.length,
          by_status: dailyStatusCounts,
          total_earnings_gross: totalEarningsGross,
          total_earnings_net: totalEarningsNet
        },
        labor_contracts: {
          total: laborContracts.length,
          by_status: laborStatusCounts
        }
      },

      daily_contracts: dailyContracts.map(c => ({
        id: c.id,
        contract_number: c.contractNumber,
        hospital_name: c.hospitalContract?.hospitalName || null,
        wage_gross: c.wageGross,
        wage_net: c.wageNet,
        wage_type: c.wageType,
        work_dates: c.workDates,
        status: c.status,
        created_at: c.createdAt,
        sent_at: c.sentAt,
        signed_at: c.signedAt
      })),

      labor_contracts: laborContracts.map(c => ({
        id: c.id,
        contract_number: c.contractNumber,
        hospital_name: c.hospitalContract?.hospitalName || null,
        annual_salary_total: c.annualSalaryTotal,
        monthly_total: c.monthlyTotal,
        work_contract_start_date: c.workContractStartDate,
        work_contract_end_date: c.workContractEndDate,
        status: c.status,
        created_at: c.createdAt,
        sent_at: c.sentAt,
        signed_at: c.signedAt
      }))
    }
  };
}

// ============================================
// 직원 계정: 내가 관련된 모든 계약서 통계
// ============================================
async function getEmployeeMyStats(session, reply) {
  const employeeId = session.userId;

  // 먼저 직원 정보 조회 (이메일 필요)
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { name: true, email: true }
  });

  if (!employee) {
    return reply.status(404).send({
      success: false,
      message: '사용자를 찾을 수 없습니다.'
    });
  }

  const contractWhere = {
    OR: [
      { employeeId },
      { employeeEmail: employee.email }
    ]
  };

  const [laborContracts, laborContractsByStatus] = await Promise.all([
    // employeeId 또는 employeeEmail 매칭으로 조회
    prisma.laborContract.findMany({
      where: contractWhere,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        contractNumber: true,
        annualSalaryTotal: true,
        monthlyTotal: true,
        workContractStartDate: true,
        workContractEndDate: true,
        status: true,
        createdAt: true,
        sentAt: true,
        signedAt: true,
        hospitalContract: {
          select: {
            hospitalName: true
          }
        }
      }
    }),

    // 상태별
    prisma.laborContract.groupBy({
      by: ['status'],
      where: contractWhere,
      _count: { status: true }
    })
  ]);

  const laborStatusCounts = laborContractsByStatus.reduce((acc, item) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {});

  const totalEarningsMonthly = laborContracts
    .filter(c => c.status === 'signed')
    .reduce((sum, c) => sum + (Number(c.monthlyTotal) || 0), 0);

  return {
    success: true,
    data: {
      user_type: 'employee',
      employee_name: employee.name,

      summary: {
        total_contracts: laborContracts.length,
        labor_contracts: {
          total: laborContracts.length,
          by_status: laborStatusCounts,
          total_earnings_monthly: totalEarningsMonthly
        }
      },

      labor_contracts: laborContracts.map(c => ({
        id: c.id,
        contract_number: c.contractNumber,
        hospital_name: c.hospitalContract?.hospitalName || null,
        annual_salary_total: c.annualSalaryTotal,
        monthly_total: c.monthlyTotal,
        work_contract_start_date: c.workContractStartDate,
        work_contract_end_date: c.workContractEndDate,
        status: c.status,
        created_at: c.createdAt,
        sent_at: c.sentAt,
        signed_at: c.signedAt
      }))
    }
  };
}

export default statisticsRoutes;
