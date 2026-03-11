import prisma from '../config/database.js';
import { requireAdmin } from '../middleware/adminAuth.js';

async function adminRoutes(fastify, options) {
  // All routes require admin authentication
  fastify.addHook('preHandler', async (request, reply) => {
    const isAdmin = await requireAdmin(request, reply);
    if (!isAdmin) return;
  });

  // ============================================
  // GET /api/admin/users - 전체 회원 목록
  // ============================================
  fastify.get('/users', async (request, reply) => {
    const { type, page = '1', limit = '20', search = '' } = request.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const results = {};

    if (!type || type === 'hospital') {
      const where = search ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { hospitalName: { contains: search, mode: 'insensitive' } },
          { directorName: { contains: search, mode: 'insensitive' } }
        ]
      } : {};

      const [hospitals, hospitalCount] = await Promise.all([
        prisma.hospital.findMany({
          where,
          select: {
            id: true, email: true, hospitalName: true, directorName: true,
            businessRegistrationNumber: true, hospitalAddress: true,
            hospitalPhone: true, managerName: true, managerPhone: true,
            emailVerified: true, createdAt: true, updatedAt: true,
            _count: { select: { contractsAsHospital: true, laborContractsAsHospital: true } }
          },
          orderBy: { createdAt: 'desc' },
          skip: type === 'hospital' ? skip : 0,
          take: type === 'hospital' ? limitNum : 5
        }),
        prisma.hospital.count({ where })
      ]);
      results.hospitals = { data: hospitals, total: hospitalCount };
    }

    if (!type || type === 'doctor') {
      const where = search ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } }
        ]
      } : {};

      const [doctors, doctorCount] = await Promise.all([
        prisma.doctor.findMany({
          where,
          select: {
            id: true, email: true, name: true, licenseNumber: true,
            address: true, phone: true, bankName: true,
            emailVerified: true, createdAt: true, updatedAt: true,
            _count: { select: { contractsAsDoctor: true, laborContractsAsDoctor: true } }
          },
          orderBy: { createdAt: 'desc' },
          skip: type === 'doctor' ? skip : 0,
          take: type === 'doctor' ? limitNum : 5
        }),
        prisma.doctor.count({ where })
      ]);
      results.doctors = { data: doctors, total: doctorCount };
    }

    if (!type || type === 'employee') {
      const where = search ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } }
        ]
      } : {};

      const [employees, employeeCount] = await Promise.all([
        prisma.employee.findMany({
          where,
          select: {
            id: true, email: true, name: true, birthDate: true,
            address: true, phone: true, bankName: true,
            emailVerified: true, createdAt: true, updatedAt: true,
            _count: { select: { laborContractsAsEmployee: true } }
          },
          orderBy: { createdAt: 'desc' },
          skip: type === 'employee' ? skip : 0,
          take: type === 'employee' ? limitNum : 5
        }),
        prisma.employee.count({ where })
      ]);
      results.employees = { data: employees, total: employeeCount };
    }

    return { success: true, data: results, page: pageNum, limit: limitNum };
  });

  // ============================================
  // GET /api/admin/users/:type/:id - 회원 상세
  // ============================================
  fastify.get('/users/:type/:id', async (request, reply) => {
    const { type, id } = request.params;

    let user;
    switch (type) {
      case 'hospital':
        user = await prisma.hospital.findUnique({
          where: { id },
          include: {
            contractsAsHospital: { orderBy: { createdAt: 'desc' }, take: 10 },
            laborContractsAsHospital: { orderBy: { createdAt: 'desc' }, take: 10 }
          }
        });
        break;
      case 'doctor':
        user = await prisma.doctor.findUnique({
          where: { id },
          include: {
            contractsAsDoctor: { orderBy: { createdAt: 'desc' }, take: 10 },
            laborContractsAsDoctor: { orderBy: { createdAt: 'desc' }, take: 10 }
          }
        });
        break;
      case 'employee':
        user = await prisma.employee.findUnique({
          where: { id },
          include: {
            laborContractsAsEmployee: { orderBy: { createdAt: 'desc' }, take: 10 }
          }
        });
        break;
      default:
        return reply.status(400).send({ success: false, message: '유효하지 않은 사용자 유형입니다.' });
    }

    if (!user) {
      return reply.status(404).send({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    // Remove password hash from response
    const { passwordHash, ...safeUser } = user;
    return { success: true, data: { ...safeUser, type } };
  });

  // ============================================
  // DELETE /api/admin/users/:type/:id - 회원 삭제
  // ============================================
  fastify.delete('/users/:type/:id', async (request, reply) => {
    const { type, id } = request.params;

    try {
      // Delete related sessions first
      await prisma.session.deleteMany({ where: { userId: id, userType: type } });

      switch (type) {
        case 'hospital':
          await prisma.hospital.delete({ where: { id } });
          break;
        case 'doctor':
          await prisma.doctor.delete({ where: { id } });
          break;
        case 'employee':
          await prisma.employee.delete({ where: { id } });
          break;
        default:
          return reply.status(400).send({ success: false, message: '유효하지 않은 사용자 유형입니다.' });
      }

      return { success: true, message: '사용자가 삭제되었습니다.' };
    } catch (err) {
      if (err.code === 'P2025') {
        return reply.status(404).send({ success: false, message: '사용자를 찾을 수 없습니다.' });
      }
      throw err;
    }
  });

  // ============================================
  // GET /api/admin/contracts - 전체 계약서 목록
  // ============================================
  fastify.get('/contracts', async (request, reply) => {
    const { type, page = '1', limit = '20', search = '', status } = request.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const results = {};

    if (!type || type === 'daily') {
      const where = {};
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { doctorName: { contains: search, mode: 'insensitive' } },
          { doctorEmail: { contains: search, mode: 'insensitive' } },
          { contractNumber: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [contracts, contractCount] = await Promise.all([
        prisma.contract.findMany({
          where,
          include: {
            hospitalContract: { select: { hospitalName: true, directorName: true } }
          },
          orderBy: { createdAt: 'desc' },
          skip: type === 'daily' ? skip : 0,
          take: type === 'daily' ? limitNum : limitNum
        }),
        prisma.contract.count({ where })
      ]);

      results.daily_contracts = {
        data: contracts.map(({ hospitalContract, ...c }) => ({
          ...c,
          hospitalName: hospitalContract?.hospitalName,
          directorName: hospitalContract?.directorName
        })),
        total: contractCount
      };
    }

    if (!type || type === 'labor') {
      const where = {};
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { employeeName: { contains: search, mode: 'insensitive' } },
          { employeeEmail: { contains: search, mode: 'insensitive' } },
          { contractNumber: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [contracts, contractCount] = await Promise.all([
        prisma.laborContract.findMany({
          where,
          include: {
            hospitalContract: { select: { hospitalName: true, directorName: true } }
          },
          orderBy: { createdAt: 'desc' },
          skip: type === 'labor' ? skip : 0,
          take: type === 'labor' ? limitNum : limitNum
        }),
        prisma.laborContract.count({ where })
      ]);

      results.labor_contracts = {
        data: contracts.map(({ hospitalContract, ...c }) => ({
          ...c,
          hospitalName: hospitalContract?.hospitalName,
          directorName: hospitalContract?.directorName
        })),
        total: contractCount
      };
    }

    return { success: true, data: results, page: pageNum, limit: limitNum };
  });

  // ============================================
  // GET /api/admin/contracts/:type/:id - 계약서 상세
  // ============================================
  fastify.get('/contracts/:type/:id', async (request, reply) => {
    const { type, id } = request.params;

    let contract;
    if (type === 'daily') {
      contract = await prisma.contract.findUnique({
        where: { id },
        include: {
          hospitalContract: { select: { hospitalName: true, directorName: true, hospitalAddress: true, hospitalPhone: true } },
          contractInvitations: true
        }
      });
    } else if (type === 'labor') {
      contract = await prisma.laborContract.findUnique({
        where: { id },
        include: {
          hospitalContract: { select: { hospitalName: true, directorName: true, hospitalAddress: true, hospitalPhone: true } },
          laborContractInvitations: true
        }
      });
    } else {
      return reply.status(400).send({ success: false, message: '유효하지 않은 계약서 유형입니다.' });
    }

    if (!contract) {
      return reply.status(404).send({ success: false, message: '계약서를 찾을 수 없습니다.' });
    }

    return { success: true, data: { ...contract, contractType: type } };
  });

  // ============================================
  // DELETE /api/admin/contracts/:type/:id - 계약서 삭제
  // ============================================
  fastify.delete('/contracts/:type/:id', async (request, reply) => {
    const { type, id } = request.params;

    try {
      if (type === 'daily') {
        await prisma.contract.delete({ where: { id } });
      } else if (type === 'labor') {
        await prisma.laborContract.delete({ where: { id } });
      } else {
        return reply.status(400).send({ success: false, message: '유효하지 않은 계약서 유형입니다.' });
      }

      return { success: true, message: '계약서가 삭제되었습니다.' };
    } catch (err) {
      if (err.code === 'P2025') {
        return reply.status(404).send({ success: false, message: '계약서를 찾을 수 없습니다.' });
      }
      throw err;
    }
  });

  // ============================================
  // GET /api/admin/stats - 관리자 대시보드 통계
  // ============================================
  fastify.get('/stats', async (request, reply) => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const [
      dauSessions, wauSessions, mauSessions,
      totalHospitals, totalDoctors, totalEmployees,
      totalDailyContracts, totalLaborContracts,
      dailyByStatus, laborByStatus,
      recentDailyContracts, recentLaborContracts,
      dailyContractsPerDay, newHospitalsPerDay, newDoctorsPerDay, newEmployeesPerDay
    ] = await Promise.all([
      prisma.session.findMany({ where: { createdAt: { gte: startOfToday } }, distinct: ['userType', 'userId'], select: { userType: true, userId: true } }),
      prisma.session.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, distinct: ['userType', 'userId'], select: { userType: true, userId: true } }),
      prisma.session.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, distinct: ['userType', 'userId'], select: { userType: true, userId: true } }),
      prisma.hospital.count(),
      prisma.doctor.count(),
      prisma.employee.count(),
      prisma.contract.count(),
      prisma.laborContract.count(),
      prisma.contract.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.laborContract.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.contract.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { hospitalContract: { select: { hospitalName: true } } } }),
      prisma.laborContract.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { hospitalContract: { select: { hospitalName: true } } } }),
      prisma.contract.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
      prisma.hospital.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
      prisma.doctor.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
      prisma.employee.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
    ]);

    // Build daily status counts
    const dailyStatusCounts = {};
    for (const item of dailyByStatus) dailyStatusCounts[item.status] = item._count.status;
    const laborStatusCounts = {};
    for (const item of laborByStatus) laborStatusCounts[item.status] = item._count.status;

    // Build 30-day graphs
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      last30Days.push(d.toISOString().split('T')[0]);
    }

    function aggregateByDay(records) {
      const countMap = {};
      for (const r of records) {
        const dateStr = new Date(r.createdAt).toISOString().split('T')[0];
        countMap[dateStr] = (countMap[dateStr] || 0) + 1;
      }
      return last30Days.map(date => ({ date, count: countMap[date] || 0 }));
    }

    return {
      success: true,
      data: {
        active_users: { dau: dauSessions.length, wau: wauSessions.length, mau: mauSessions.length },
        users: { total: totalHospitals + totalDoctors + totalEmployees, hospitals: totalHospitals, doctors: totalDoctors, employees: totalEmployees },
        contracts: {
          total: totalDailyContracts + totalLaborContracts,
          daily: { total: totalDailyContracts, by_status: dailyStatusCounts },
          labor: { total: totalLaborContracts, by_status: laborStatusCounts }
        },
        contracts_per_day: aggregateByDay(dailyContractsPerDay),
        new_users_per_day: aggregateByDay([...newHospitalsPerDay, ...newDoctorsPerDay, ...newEmployeesPerDay]),
        recent_daily_contracts: recentDailyContracts.map(({ hospitalContract, ...c }) => ({
          ...c, hospitalName: hospitalContract?.hospitalName
        })),
        recent_labor_contracts: recentLaborContracts.map(({ hospitalContract, ...c }) => ({
          ...c, hospitalName: hospitalContract?.hospitalName
        }))
      }
    };
  });
}

export default adminRoutes;
