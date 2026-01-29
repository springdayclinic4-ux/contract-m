import prisma from '../config/database.js';
import { generateUUID } from '../utils/crypto.js';

async function contractRoutes(fastify, options) {
  /**
   * 일용직 계약서 생성
   * POST /api/contracts/daily
   */
  fastify.post('/daily', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.status(401).send({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    // 세션에서 사용자 정보 확인
    const session = await prisma.session.findFirst({
      where: { accessToken: token }
    });

    if (!session) {
      return reply.status(401).send({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }

    const {
      doctor_email,
      doctor_name,
      doctor_license_number,
      doctor_address,
      doctor_phone,
      work_dates,
      start_time,
      end_time,
      break_time,
      wage_gross,
      wage_net,
      wage_type,
      special_conditions,
      include_security_pledge,
      include_pay_stub,
      include_crime_check
    } = request.body;

    // 계약서 번호 생성 (YYYYMMDD-UUID)
    const contractNumber = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${generateUUID().slice(0, 8)}`;

    // 계약서 생성
    const contract = await prisma.contract.create({
      data: {
        contractNumber,
        creatorType: session.userType,
        creatorId: session.userId,
        hospitalId: session.userType === 'hospital' ? session.userId : null,
        doctorEmail: doctor_email,
        doctorName: doctor_name,
        doctorLicenseNumber: doctor_license_number,
        doctorAddress: doctor_address,
        doctorPhone: doctor_phone || null,
        workDates: work_dates,
        startTime: start_time || null,
        endTime: end_time || null,
        breakTime: break_time || null,
        wageGross: wage_gross ? parseFloat(wage_gross) : null,
        wageNet: wage_net ? parseFloat(wage_net) : null,
        wageType: wage_type || null,
        specialConditions: special_conditions || null,
        includeSecurityPledge: include_security_pledge !== false,
        includePayStub: include_pay_stub !== false,
        includeCrimeCheck: include_crime_check !== false,
        status: 'draft'
      }
    });

    return reply.status(201).send({
      success: true,
      message: '일용직 계약서가 생성되었습니다.',
      data: contract
    });
  });

  /**
   * 일반 근로계약서 생성
   * POST /api/contracts/regular
   */
  fastify.post('/regular', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.status(401).send({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    // 세션에서 사용자 정보 확인
    const session = await prisma.session.findFirst({
      where: { accessToken: token }
    });

    if (!session) {
      return reply.status(401).send({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }

    const {
      employee_email,
      employee_name,
      employee_birth_date,
      employee_address,
      employee_phone,
      contract_type,
      work_contract_start_date,
      work_contract_end_date,
      salary_contract_start_date,
      salary_contract_end_date,
      probation_period,
      probation_salary_rate,
      annual_salary_total,
      base_salary,
      meal_allowance,
      fixed_overtime_allowance,
      monthly_base_salary,
      monthly_meal_allowance,
      monthly_overtime_allowance,
      monthly_total,
      regular_hourly_wage,
      monthly_base_hours,
      monthly_overtime_hours,
      pay_date,
      work_content,
      work_location,
      work_start_time,
      work_end_time,
      break_time,
      work_days_per_week,
      include_security_pledge,
      include_privacy_consent
    } = request.body;

    // 계약서 번호 생성
    const contractNumber = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${generateUUID().slice(0, 8)}`;

    // 근로계약서 생성
    const laborContract = await prisma.laborContract.create({
      data: {
        contractNumber,
        creatorType: session.userType,
        creatorId: session.userId,
        hospitalId: session.userType === 'hospital' ? session.userId : null,
        employeeEmail: employee_email,
        employeeName: employee_name,
        employeeBirthDate: employee_birth_date ? new Date(employee_birth_date) : null,
        employeeAddress: employee_address,
        employeePhone: employee_phone || null,
        contractType: contract_type || null,
        workContractStartDate: work_contract_start_date ? new Date(work_contract_start_date) : null,
        workContractEndDate: work_contract_end_date ? new Date(work_contract_end_date) : null,
        salaryContractStartDate: salary_contract_start_date ? new Date(salary_contract_start_date) : null,
        salaryContractEndDate: salary_contract_end_date ? new Date(salary_contract_end_date) : null,
        probationPeriod: probation_period || null,
        probationSalaryRate: probation_salary_rate ? parseFloat(probation_salary_rate) : null,
        annualSalaryTotal: annual_salary_total ? parseFloat(annual_salary_total) : null,
        baseSalary: base_salary ? parseFloat(base_salary) : null,
        mealAllowance: meal_allowance ? parseFloat(meal_allowance) : null,
        fixedOvertimeAllowance: fixed_overtime_allowance ? parseFloat(fixed_overtime_allowance) : null,
        monthlyBaseSalary: monthly_base_salary ? parseFloat(monthly_base_salary) : null,
        monthlyMealAllowance: monthly_meal_allowance ? parseFloat(monthly_meal_allowance) : null,
        monthlyOvertimeAllowance: monthly_overtime_allowance ? parseFloat(monthly_overtime_allowance) : null,
        monthlyTotal: monthly_total ? parseFloat(monthly_total) : null,
        regularHourlyWage: regular_hourly_wage ? parseFloat(regular_hourly_wage) : null,
        monthlyBaseHours: monthly_base_hours || null,
        monthlyOvertimeHours: monthly_overtime_hours || null,
        payDate: pay_date || null,
        workContent: work_content || null,
        workLocation: work_location || null,
        workStartTime: work_start_time || null,
        workEndTime: work_end_time || null,
        breakTime: break_time || null,
        workDaysPerWeek: work_days_per_week || null,
        includeSecurityPledge: include_security_pledge !== false,
        includePrivacyConsent: include_privacy_consent !== false,
        status: 'draft'
      }
    });

    return reply.status(201).send({
      success: true,
      message: '일반 근로계약서가 생성되었습니다.',
      data: laborContract
    });
  });

  /**
   * 계약서 목록 조회
   * GET /api/contracts
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

    // 일용직 계약서 조회
    const contracts = await prisma.contract.findMany({
      where: {
        creatorType: session.userType,
        creatorId: session.userId
      },
      include: {
        hospitalContract: {
          select: {
            hospitalName: true,
            directorName: true,
            hospitalAddress: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 근로계약서 조회
    const laborContracts = await prisma.laborContract.findMany({
      where: {
        creatorType: session.userType,
        creatorId: session.userId
      },
      include: {
        hospitalContract: {
          select: {
            hospitalName: true,
            directorName: true,
            hospitalAddress: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 병원 정보를 최상위로 병합
    const formattedContracts = contracts.map(({ hospitalContract, ...contract }) => ({
      ...contract,
      hospitalName: hospitalContract?.hospitalName,
      directorName: hospitalContract?.directorName,
      hospitalAddress: hospitalContract?.hospitalAddress
    }));

    const formattedLaborContracts = laborContracts.map(({ hospitalContract, ...contract }) => ({
      ...contract,
      hospitalName: hospitalContract?.hospitalName,
      directorName: hospitalContract?.directorName,
      hospitalAddress: hospitalContract?.hospitalAddress
    }));

    return {
      success: true,
      data: {
        daily_contracts: formattedContracts,
        regular_contracts: formattedLaborContracts
      }
    };
  });

  /**
   * 계약서 상세 조회
   * GET /api/contracts/:id
   */
  fastify.get('/:id', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    const { id } = request.params;
    
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

    // 일용직 계약서 확인
    let contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        hospitalContract: {
          select: {
            hospitalName: true,
            directorName: true,
            hospitalAddress: true,
            hospitalPhone: true
          }
        }
      }
    });

    if (contract) {
      // 권한 확인
      if (contract.creatorType !== session.userType || contract.creatorId !== session.userId) {
        return reply.status(403).send({
          success: false,
          message: '접근 권한이 없습니다.'
        });
      }

      // 병원 정보를 최상위로 병합
      const { hospitalContract, ...contractData } = contract;
      const responseData = {
        ...contractData,
        type: 'daily',
        hospitalName: hospitalContract?.hospitalName,
        directorName: hospitalContract?.directorName,
        hospitalAddress: hospitalContract?.hospitalAddress,
        hospitalPhone: hospitalContract?.hospitalPhone
      };

      return {
        success: true,
        data: responseData
      };
    }

    // 근로계약서 확인
    let laborContract = await prisma.laborContract.findUnique({
      where: { id }
    });

    if (laborContract) {
      // 권한 확인
      if (laborContract.creatorType !== session.userType || laborContract.creatorId !== session.userId) {
        return reply.status(403).send({
          success: false,
          message: '접근 권한이 없습니다.'
        });
      }

      return {
        success: true,
        data: { ...laborContract, type: 'regular' }
      };
    }

    return reply.status(404).send({
      success: false,
      message: '계약서를 찾을 수 없습니다.'
    });
  });

  /**
   * 계약서 발송
   * POST /api/contracts/:id/send
   */
  fastify.post('/:id/send', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    const { id } = request.params;
    
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

    // 일용직 계약서 확인
    let contract = await prisma.contract.findUnique({
      where: { id }
    });

    if (contract) {
      // 권한 확인
      if (contract.creatorType !== session.userType || contract.creatorId !== session.userId) {
        return reply.status(403).send({
          success: false,
          message: '접근 권한이 없습니다.'
        });
      }

      // 이미 발송된 계약서는 재발송 불가
      if (contract.status !== 'draft') {
        return reply.status(400).send({
          success: false,
          message: '초안 상태의 계약서만 발송할 수 있습니다.'
        });
      }

      // 초대 토큰 생성
      const invitationToken = generateUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일 후

      // 초대 생성
      await prisma.contractInvitation.create({
        data: {
          contractId: id,
          invitationToken,
          expiresAt
        }
      });

      // 계약서 상태 업데이트
      await prisma.contract.update({
        where: { id },
        data: {
          status: 'sent',
          sentAt: new Date()
        }
      });

      // 이메일 발송
      const { sendContractInvitationEmail } = await import('../utils/email.js');
      await sendContractInvitationEmail(contract.doctorEmail, invitationToken, 'contract');

      return {
        success: true,
        message: '계약서가 발송되었습니다.',
        data: { invitationToken }
      };
    }

    // 근로계약서 확인
    let laborContract = await prisma.laborContract.findUnique({
      where: { id }
    });

    if (laborContract) {
      // 권한 확인
      if (laborContract.creatorType !== session.userType || laborContract.creatorId !== session.userId) {
        return reply.status(403).send({
          success: false,
          message: '접근 권한이 없습니다.'
        });
      }

      // 이미 발송된 계약서는 재발송 불가
      if (laborContract.status !== 'draft') {
        return reply.status(400).send({
          success: false,
          message: '초안 상태의 계약서만 발송할 수 있습니다.'
        });
      }

      // 초대 토큰 생성
      const invitationToken = generateUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일 후

      // 초대 생성
      await prisma.laborContractInvitation.create({
        data: {
          laborContractId: id,
          invitationToken,
          expiresAt
        }
      });

      // 계약서 상태 업데이트
      await prisma.laborContract.update({
        where: { id },
        data: {
          status: 'sent',
          sentAt: new Date()
        }
      });

      // 이메일 발송
      const { sendContractInvitationEmail } = await import('../utils/email.js');
      await sendContractInvitationEmail(laborContract.employeeEmail, invitationToken, 'labor');

      return {
        success: true,
        message: '계약서가 발송되었습니다.',
        data: { invitationToken }
      };
    }

    return reply.status(404).send({
      success: false,
      message: '계약서를 찾을 수 없습니다.'
    });
  });

  /**
   * 초대 토큰으로 계약서 조회
   * GET /api/contracts/invitation/:token
   */
  fastify.get('/invitation/:token', async (request, reply) => {
    const { token } = request.params;

    // 일용직 계약서 초대 확인
    const contractInvitation = await prisma.contractInvitation.findUnique({
      where: { invitationToken: token },
      include: {
        contract: {
          include: {
            hospitalContract: {
              select: {
                hospitalName: true,
                directorName: true,
                hospitalAddress: true,
                hospitalPhone: true
              }
            }
          }
        }
      }
    });

    if (contractInvitation) {
      // 초대 만료 확인
      if (contractInvitation.expiresAt < new Date()) {
        return reply.status(400).send({
          success: false,
          message: '초대 링크가 만료되었습니다.'
        });
      }

      // 클릭 기록
      await prisma.contractInvitation.update({
        where: { invitationToken: token },
        data: { clickedAt: new Date() }
      });

      // 병원 정보를 최상위로 병합
      const { hospitalContract, ...contractData } = contractInvitation.contract;
      const responseData = {
        ...contractData,
        type: 'daily',
        hospitalName: hospitalContract?.hospitalName,
        directorName: hospitalContract?.directorName,
        hospitalAddress: hospitalContract?.hospitalAddress,
        hospitalPhone: hospitalContract?.hospitalPhone
      };

      return {
        success: true,
        data: responseData
      };
    }

    // 근로계약서 초대 확인
    const laborInvitation = await prisma.laborContractInvitation.findUnique({
      where: { invitationToken: token },
      include: {
        laborContract: true
      }
    });

    if (laborInvitation) {
      // 초대 만료 확인
      if (laborInvitation.expiresAt < new Date()) {
        return reply.status(400).send({
          success: false,
          message: '초대 링크가 만료되었습니다.'
        });
      }

      // 클릭 기록
      await prisma.laborContractInvitation.update({
        where: { invitationToken: token },
        data: { clickedAt: new Date() }
      });

      return {
        success: true,
        data: {
          ...laborInvitation.laborContract,
          type: 'regular'
        }
      };
    }

    return reply.status(404).send({
      success: false,
      message: '유효하지 않은 초대 링크입니다.'
    });
  });

  /**
   * 계약서 서명
   * POST /api/contracts/invitation/:token/sign
   */
  fastify.post('/invitation/:token/sign', async (request, reply) => {
    const { token } = request.params;
    const { signature_image_url } = request.body;

    // 일용직 계약서 초대 확인
    const contractInvitation = await prisma.contractInvitation.findUnique({
      where: { invitationToken: token },
      include: {
        contract: true
      }
    });

    if (contractInvitation) {
      // 초대 만료 확인
      if (contractInvitation.expiresAt < new Date()) {
        return reply.status(400).send({
          success: false,
          message: '초대 링크가 만료되었습니다.'
        });
      }

      // 이미 서명된 계약서
      if (contractInvitation.contract.status === 'signed') {
        return reply.status(400).send({
          success: false,
          message: '이미 서명된 계약서입니다.'
        });
      }

      // 계약서 서명 처리
      await prisma.contract.update({
        where: { id: contractInvitation.contractId },
        data: {
          status: 'signed',
          signedAt: new Date(),
          signatureImageUrl: signature_image_url
        }
      });

      return {
        success: true,
        message: '계약서에 서명되었습니다.'
      };
    }

    // 근로계약서 초대 확인
    const laborInvitation = await prisma.laborContractInvitation.findUnique({
      where: { invitationToken: token },
      include: {
        laborContract: true
      }
    });

    if (laborInvitation) {
      // 초대 만료 확인
      if (laborInvitation.expiresAt < new Date()) {
        return reply.status(400).send({
          success: false,
          message: '초대 링크가 만료되었습니다.'
        });
      }

      // 이미 서명된 계약서
      if (laborInvitation.laborContract.status === 'signed') {
        return reply.status(400).send({
          success: false,
          message: '이미 서명된 계약서입니다.'
        });
      }

      // 계약서 서명 처리
      await prisma.laborContract.update({
        where: { id: laborInvitation.laborContractId },
        data: {
          status: 'signed',
          signedAt: new Date(),
          signatureImageUrl: signature_image_url
        }
      });

      return {
        success: true,
        message: '계약서에 서명되었습니다.'
      };
    }

    return reply.status(404).send({
      success: false,
      message: '유효하지 않은 초대 링크입니다.'
    });
  });

  /**
   * 계약서 거부
   * POST /api/contracts/invitation/:token/reject
   */
  fastify.post('/invitation/:token/reject', async (request, reply) => {
    const { token } = request.params;
    const { rejection_reason } = request.body;

    // 일용직 계약서 초대 확인
    const contractInvitation = await prisma.contractInvitation.findUnique({
      where: { invitationToken: token },
      include: {
        contract: true
      }
    });

    if (contractInvitation) {
      // 초대 만료 확인
      if (contractInvitation.expiresAt < new Date()) {
        return reply.status(400).send({
          success: false,
          message: '초대 링크가 만료되었습니다.'
        });
      }

      // 계약서 거부 처리
      await prisma.contract.update({
        where: { id: contractInvitation.contractId },
        data: {
          status: 'rejected',
          rejectionReason: rejection_reason
        }
      });

      return {
        success: true,
        message: '계약서가 거부되었습니다.'
      };
    }

    // 근로계약서 초대 확인
    const laborInvitation = await prisma.laborContractInvitation.findUnique({
      where: { invitationToken: token },
      include: {
        laborContract: true
      }
    });

    if (laborInvitation) {
      // 초대 만료 확인
      if (laborInvitation.expiresAt < new Date()) {
        return reply.status(400).send({
          success: false,
          message: '초대 링크가 만료되었습니다.'
        });
      }

      // 계약서 거부 처리
      await prisma.laborContract.update({
        where: { id: laborInvitation.laborContractId },
        data: {
          status: 'rejected',
          rejectionReason: rejection_reason
        }
      });

      return {
        success: true,
        message: '계약서가 거부되었습니다.'
      };
    }

    return reply.status(404).send({
      success: false,
      message: '유효하지 않은 초대 링크입니다.'
    });
  });

  /**
   * 계약서 삭제
   * DELETE /api/contracts/:id
   */
  fastify.delete('/:id', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    const { id } = request.params;
    
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

    // 일용직 계약서 확인
    let contract = await prisma.contract.findUnique({
      where: { id }
    });

    if (contract) {
      // 권한 확인
      if (contract.creatorType !== session.userType || contract.creatorId !== session.userId) {
        return reply.status(403).send({
          success: false,
          message: '접근 권한이 없습니다.'
        });
      }

      await prisma.contract.delete({
        where: { id }
      });

      return {
        success: true,
        message: '계약서가 삭제되었습니다.'
      };
    }

    // 근로계약서 확인
    let laborContract = await prisma.laborContract.findUnique({
      where: { id }
    });

    if (laborContract) {
      // 권한 확인
      if (laborContract.creatorType !== session.userType || laborContract.creatorId !== session.userId) {
        return reply.status(403).send({
          success: false,
          message: '접근 권한이 없습니다.'
        });
      }

      await prisma.laborContract.delete({
        where: { id }
      });

      return {
        success: true,
        message: '계약서가 삭제되었습니다.'
      };
    }

    return reply.status(404).send({
      success: false,
      message: '계약서를 찾을 수 없습니다.'
    });
  });
}

export default contractRoutes;
