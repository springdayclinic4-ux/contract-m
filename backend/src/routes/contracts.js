import prisma from '../config/database.js';
import { generateUUID } from '../utils/crypto.js';

// 민감정보 필터링 제거 - 의사가 직접 삭제 버튼으로만 삭제

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
      doctor_registration_number,
      doctor_license_number,
      doctor_address,
      doctor_phone,
      bank_name,
      account_number,
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
      include_crime_check,
      tax_method,
      payment_date
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
        doctorEmail: doctor_email?.toLowerCase().trim(),
        doctorName: doctor_name,
        doctorRegistrationNumber: doctor_registration_number || null,
        doctorLicenseNumber: doctor_license_number,
        doctorAddress: doctor_address,
        doctorPhone: doctor_phone || null,
        doctorBankName: bank_name || null,
        doctorAccountNumber: account_number || null,
        workDates: work_dates,
        startTime: start_time || null,
        endTime: end_time || null,
        breakTime: break_time || null,
        wageGross: wage_gross ? parseFloat(wage_gross) : null,
        wageNet: wage_net ? parseFloat(wage_net) : null,
        wageType: wage_type || null,
        taxMethod: tax_method || 'business',
        paymentDate: payment_date || 'same_day',
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
      data: (contract)
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
      employee_resident_number,
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
        employeeRegistrationNumber: employee_resident_number || null,
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
        monthlyBaseHours: monthly_base_hours ? parseInt(monthly_base_hours) : null,
        monthlyOvertimeHours: monthly_overtime_hours || null,
        payDate: pay_date ? parseInt(pay_date) : null,
        workContent: work_content || null,
        workLocation: work_location || null,
        workStartTime: work_start_time || null,
        workEndTime: work_end_time || null,
        breakTime: break_time || null,
        workDaysPerWeek: work_days_per_week ? parseInt(work_days_per_week) : null,
        includeSecurityPledge: include_security_pledge !== false,
        includePrivacyConsent: include_privacy_consent !== false,
        status: 'draft'
      }
    });

    return reply.status(201).send({
      success: true,
      message: '일반 근로계약서가 생성되었습니다.',
      data: (laborContract)
    });
  });

  /**
   * 의사의 대기중 계약서 목록
   * GET /api/contracts/my-pending
   */
  fastify.get('/my-pending', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return reply.status(401).send({ success: false, message: '인증이 필요합니다.' });
    }

    const session = await prisma.session.findFirst({ where: { accessToken: token } });
    if (!session) {
      return reply.status(401).send({ success: false, message: '유효하지 않은 토큰입니다.' });
    }

    // 의사 정보 가져오기
    let doctorEmail = null;
    if (session.userType === 'doctor') {
      const doctor = await prisma.doctor.findUnique({ where: { id: session.userId } });
      if (doctor) doctorEmail = doctor.email;
    }

    if (!doctorEmail) {
      return { success: true, data: [] };
    }

    // 해당 의사 이메일로 발송된 계약서 중 서명 대기중인 것 (대소문자 무시)
    const normalizedEmail = doctorEmail.toLowerCase().trim();
    const contracts = await prisma.contract.findMany({
      where: {
        doctorEmail: { equals: normalizedEmail, mode: 'insensitive' },
        status: { in: ['sent', 'pending'] }
      },
      include: {
        hospitalContract: {
          select: {
            hospitalName: true,
            directorName: true
          }
        },
        contractInvitations: {
          select: {
            invitationToken: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = contracts.map(({ hospitalContract, contractInvitations, ...c }) => ({
      ...c,
      type: 'daily',
      hospitalName: hospitalContract?.hospitalName,
      directorName: hospitalContract?.directorName,
      invitationToken: contractInvitations?.[0]?.invitationToken || null
    }));

    return { success: true, data: formatted };
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

    // 병원 정보를 최상위로 병합 + 민감정보 필터링
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

      // 병원 정보를 최상위로 병합 + 민감정보 필터링
      const { hospitalContract, ...contractData } = contract;
      const responseData = ({
        ...contractData,
        type: 'daily',
        hospitalName: hospitalContract?.hospitalName,
        directorName: hospitalContract?.directorName,
        hospitalAddress: hospitalContract?.hospitalAddress,
        hospitalPhone: hospitalContract?.hospitalPhone
      });

      return {
        success: true,
        data: responseData
      };
    }

    // 근로계약서 확인
    let laborContract = await prisma.laborContract.findUnique({
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

    if (laborContract) {
      // 권한 확인
      if (laborContract.creatorType !== session.userType || laborContract.creatorId !== session.userId) {
        return reply.status(403).send({
          success: false,
          message: '접근 권한이 없습니다.'
        });
      }

      const { hospitalContract: hospData, ...laborData } = laborContract;
      return {
        success: true,
        data: ({
          ...laborData,
          type: 'regular',
          hospitalName: hospData?.hospitalName,
          directorName: hospData?.directorName,
          hospitalAddress: hospData?.hospitalAddress,
          hospitalPhone: hospData?.hospitalPhone
        })
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

      // 서명/거부된 계약서는 재발송 불가
      if (contract.status !== 'draft' && contract.status !== 'sent') {
        return reply.status(400).send({
          success: false,
          message: '초안 또는 발송 상태의 계약서만 발송할 수 있습니다.'
        });
      }

      // 기존 초대가 있으면 삭제 (재발송 시)
      if (contract.status === 'sent') {
        await prisma.contractInvitation.deleteMany({
          where: { contractId: id }
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

      // 이메일 발송 (병원명, 의사명 포함)
      const { sendContractInvitationEmail } = await import('../utils/email.js');
      const hospitalInfo = await prisma.hospital.findUnique({ where: { id: contract.hospitalId } });
      await sendContractInvitationEmail(
        contract.doctorEmail,
        invitationToken,
        'contract',
        {
          hospitalName: hospitalInfo?.hospitalName || '',
          doctorName: contract.doctorName,
          contractNumber: contract.contractNumber
        }
      );

      return {
        success: true,
        message: contract.status === 'sent' ? '계약서가 재발송되었습니다.' : '계약서가 발송되었습니다.',
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

      // 서명/거부된 계약서는 재발송 불가
      if (laborContract.status !== 'draft' && laborContract.status !== 'sent') {
        return reply.status(400).send({
          success: false,
          message: '초안 또는 발송 상태의 계약서만 발송할 수 있습니다.'
        });
      }

      // 기존 초대가 있으면 삭제 (재발송 시)
      if (laborContract.status === 'sent') {
        await prisma.laborContractInvitation.deleteMany({
          where: { laborContractId: id }
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
        message: laborContract.status === 'sent' ? '계약서가 재발송되었습니다.' : '계약서가 발송되었습니다.',
        data: { invitationToken }
      };
    }

    return reply.status(404).send({
      success: false,
      message: '계약서를 찾을 수 없습니다.'
    });
  });

  /**
   * 병원(갑) 서명
   * POST /api/contracts/:id/hospital-sign
   */
  fastify.post('/:id/hospital-sign', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    const { id } = request.params;
    const { hospital_signature_url } = request.body;

    if (!token) {
      return reply.status(401).send({ success: false, message: '인증이 필요합니다.' });
    }

    const session = await prisma.session.findFirst({ where: { accessToken: token } });
    if (!session) {
      return reply.status(401).send({ success: false, message: '유효하지 않은 토큰입니다.' });
    }

    // 일용직 계약서 확인
    let contract = await prisma.contract.findUnique({ where: { id } });
    if (contract) {
      if (contract.creatorType !== session.userType || contract.creatorId !== session.userId) {
        return reply.status(403).send({ success: false, message: '접근 권한이 없습니다.' });
      }

      await prisma.contract.update({
        where: { id },
        data: { hospitalSignatureUrl: hospital_signature_url }
      });

      return { success: true, message: '병원 서명이 완료되었습니다.' };
    }

    // 근로계약서 확인
    let laborContract = await prisma.laborContract.findUnique({ where: { id } });
    if (laborContract) {
      if (laborContract.creatorType !== session.userType || laborContract.creatorId !== session.userId) {
        return reply.status(403).send({ success: false, message: '접근 권한이 없습니다.' });
      }

      // LaborContract에는 hospitalSignatureUrl 필드 추가 필요시 별도 처리
      return { success: true, message: '병원 서명이 완료되었습니다.' };
    }

    return reply.status(404).send({ success: false, message: '계약서를 찾을 수 없습니다.' });
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
      const responseData = ({
        ...contractData,
        type: 'daily',
        hospitalName: hospitalContract?.hospitalName,
        directorName: hospitalContract?.directorName,
        hospitalAddress: hospitalContract?.hospitalAddress,
        hospitalPhone: hospitalContract?.hospitalPhone
      });

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
        data: ({
          ...laborInvitation.laborContract,
          type: 'regular'
        })
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

    // 로그인한 의사 이메일 확인
    const authToken = request.headers.authorization?.replace('Bearer ', '');
    if (!authToken) {
      return reply.status(401).send({ success: false, message: '로그인이 필요합니다.' });
    }
    const session = await prisma.session.findFirst({ where: { accessToken: authToken } });
    if (!session || session.userType !== 'doctor') {
      return reply.status(401).send({ success: false, message: '의사 계정으로 로그인해야 합니다.' });
    }
    const doctor = await prisma.doctor.findUnique({ where: { id: session.userId } });
    if (!doctor) {
      return reply.status(401).send({ success: false, message: '의사 정보를 찾을 수 없습니다.' });
    }

    // 일용직 계약서 초대 확인
    const contractInvitation = await prisma.contractInvitation.findUnique({
      where: { invitationToken: token },
      include: {
        contract: true
      }
    });

    if (contractInvitation) {
      // 초대 이메일과 로그인 이메일 일치 확인
      if (contractInvitation.contract.doctorEmail !== doctor.email) {
        return reply.status(403).send({
          success: false,
          message: '이 계약서의 초대 대상 의사가 아닙니다. 초대받은 이메일 계정으로 로그인해주세요.'
        });
      }

      // 계약서에 기재된 이름과 가입된 이름 일치 확인
      if (contractInvitation.contract.doctorName && doctor.name &&
          contractInvitation.contract.doctorName.trim() !== doctor.name.trim()) {
        return reply.status(400).send({
          success: false,
          message: `계약서에 기재된 이름(${contractInvitation.contract.doctorName})과 회원가입 시 등록된 이름(${doctor.name})이 일치하지 않습니다. 병원에 문의하거나 설정에서 이름을 확인해주세요.`
        });
      }

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

      // 계약서 서명 처리 + 주민번호 즉시 삭제 (개인정보 보호)
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
      // 초대 이메일과 로그인 이메일 일치 확인
      const laborEmail = laborInvitation.laborContract.employeeEmail || laborInvitation.laborContract.doctorEmail;
      if (laborEmail && laborEmail !== doctor.email) {
        return reply.status(403).send({
          success: false,
          message: '이 계약서의 초대 대상이 아닙니다. 초대받은 이메일 계정으로 로그인해주세요.'
        });
      }

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

      // 계약서 서명 처리 + 주민번호 즉시 삭제 (개인정보 보호)
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

      // 서명이 하나라도 있는 계약서는 삭제 불가
      if (contract.hospitalSignatureUrl || contract.signatureImageUrl) {
        return reply.status(400).send({
          success: false,
          message: '서명이 진행된 계약서는 삭제할 수 없습니다.'
        });
      }

      // 발송 후 서명 대기중인 계약서도 삭제 불가
      if (contract.status === 'signed') {
        return reply.status(400).send({
          success: false,
          message: '서명 완료된 계약서는 삭제할 수 없습니다.'
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
  /**
   * 계약서 개인정보 삭제 (의사 요청)
   * POST /api/contracts/invitation/:token/delete-personal-info
   */
  fastify.post('/invitation/:token/delete-personal-info', async (request, reply) => {
    const { token } = request.params;

    // 로그인 확인
    const authToken = request.headers.authorization?.replace('Bearer ', '');
    if (!authToken) {
      return reply.status(401).send({ success: false, message: '로그인이 필요합니다.' });
    }
    const session = await prisma.session.findFirst({ where: { accessToken: authToken } });
    if (!session || session.userType !== 'doctor') {
      return reply.status(401).send({ success: false, message: '의사 계정으로 로그인해야 합니다.' });
    }
    const doctor = await prisma.doctor.findUnique({ where: { id: session.userId } });
    if (!doctor) {
      return reply.status(401).send({ success: false, message: '의사 정보를 찾을 수 없습니다.' });
    }

    // 일용직 계약서 초대 확인
    const contractInvitation = await prisma.contractInvitation.findUnique({
      where: { invitationToken: token },
      include: { contract: true }
    });

    if (contractInvitation) {
      const contract = contractInvitation.contract;

      // 본인 계약서인지 확인
      if (contract.doctorEmail !== doctor.email) {
        return reply.status(403).send({ success: false, message: '본인의 계약서만 개인정보를 삭제할 수 있습니다.' });
      }

      // 서명 완료 또는 거부된 계약서만 삭제 가능
      if (contract.status !== 'signed' && contract.status !== 'rejected') {
        return reply.status(400).send({ success: false, message: '서명 완료 또는 거부된 계약서만 개인정보를 삭제할 수 있습니다.' });
      }

      // 개인정보 삭제
      await prisma.contract.update({
        where: { id: contract.id },
        data: {
          doctorRegistrationNumber: null,
          doctorAccountNumber: null,
          doctorBankName: null,
          doctorPhone: null,
        }
      });

      return { success: true, message: '개인정보가 완전히 삭제되었습니다.' };
    }

    // 근로계약서 초대 확인
    const laborInvitation = await prisma.laborContractInvitation.findUnique({
      where: { invitationToken: token },
      include: { laborContract: true }
    });

    if (laborInvitation) {
      const lc = laborInvitation.laborContract;
      const lcEmail = lc.employeeEmail;

      if (lcEmail !== doctor.email) {
        return reply.status(403).send({ success: false, message: '본인의 계약서만 개인정보를 삭제할 수 있습니다.' });
      }

      if (lc.status !== 'signed' && lc.status !== 'rejected') {
        return reply.status(400).send({ success: false, message: '서명 완료 또는 거부된 계약서만 개인정보를 삭제할 수 있습니다.' });
      }

      await prisma.laborContract.update({
        where: { id: lc.id },
        data: {
          employeeRegistrationNumber: null,
          employeePhone: null,
        }
      });

      return { success: true, message: '개인정보가 완전히 삭제되었습니다.' };
    }

    return reply.status(404).send({ success: false, message: '유효하지 않은 초대 링크입니다.' });
  });
}

export default contractRoutes;
