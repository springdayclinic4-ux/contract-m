import bcrypt from 'bcrypt';
import prisma from '../config/database.js';
import { generateUUID, generateRandomString } from '../utils/crypto.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendAdminLoginCode } from '../utils/email.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';
import { zodValidation } from '../middleware/zodValidation.js';
import {
  sendVerificationSchema,
  verifyEmailSchema,
  registerHospitalSchema,
  registerDoctorSchema,
  registerEmployeeSchema,
  loginSchema
} from '../schemas/auth.schema.js';

const ADMIN_EMAIL = 'springdayclinic4@gmail.com';

async function authRoutes(fastify, options) {
  // 인증 엔드포인트 Rate Limiting 설정
  const authRateLimit = {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute'
      }
    }
  };

  const emailRateLimit = {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '1 minute'
      }
    }
  };

  const allowUnverifiedSignup =
    process.env.NODE_ENV === 'development' &&
    process.env.ALLOW_UNVERIFIED_SIGNUP !== 'false';
  /**
   * 이메일 인증 코드 발송
   * POST /api/auth/send-verification
   */
  fastify.post('/send-verification', {
    ...emailRateLimit,
    preValidation: zodValidation(sendVerificationSchema)
  }, async (request, reply) => {
    const { email } = request.body;

    // 이미 가입된 이메일인지 확인 (병원, 의사, 직원 모두 검색)
    const existingHospital = await prisma.hospital.findUnique({ where: { email } });
    const existingDoctor = await prisma.doctor.findUnique({ where: { email } });
    const existingEmployee = await prisma.employee.findUnique({ where: { email } });

    if (existingHospital || existingDoctor || existingEmployee) {
      return reply.status(400).send({
        success: false,
        message: '이미 가입된 이메일입니다. 로그인해주세요.'
      });
    }

    // 인증 코드 생성
    const verificationCode = generateRandomString(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후

    // 기존 인증 코드 삭제 (같은 이메일)
    await prisma.emailVerification.deleteMany({
      where: { email }
    });

    // 새 인증 코드 저장
    await prisma.emailVerification.create({
      data: {
        email,
        verificationCode,
        expiresAt
      }
    });

    // 이메일 발송
    await sendVerificationEmail(email, verificationCode);

    return {
      success: true,
      message: '인증 코드가 발송되었습니다.'
    };
  });

  /**
   * 이메일 인증 코드 확인
   * POST /api/auth/verify-email
   */
  fastify.post('/verify-email', {
    ...authRateLimit,
    preValidation: zodValidation(verifyEmailSchema)
  }, async (request, reply) => {
    const { email, verification_code } = request.body;

    // 인증 코드 확인
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email,
        verificationCode: verification_code,
        expiresAt: { gt: new Date() },
        verified: false
      }
    });

    if (!verification) {
      return reply.status(400).send({
        success: false,
        message: '유효하지 않거나 만료된 인증 코드입니다.'
      });
    }

    // 인증 완료 처리
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { verified: true }
    });

    return {
      success: true,
      message: '이메일 인증이 완료되었습니다.'
    };
  });

  /**
   * 병원 회원가입
   * POST /api/auth/register/hospital
   */
  fastify.post('/register/hospital', {
    preValidation: zodValidation(registerHospitalSchema)
  }, async (request, reply) => {
    const {
      email,
      password,
      business_registration_number,
      hospital_name,
      director_name,
      hospital_address,
      hospital_phone,
      manager_name,
      manager_phone,
      terms_service_agreed,
      terms_privacy_agreed,
      terms_third_party_agreed,
      marketing_agreed
    } = request.body;

    // 이메일 인증 확인
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email,
        verified: true
      }
    });

    if (!verification && !allowUnverifiedSignup) {
      return reply.status(400).send({
        success: false,
        message: '이메일 인증이 완료되지 않았습니다.'
      });
    }
    if (!verification && allowUnverifiedSignup) {
      fastify.log.warn(`DEV: 이메일 인증 없이 회원가입 허용 - ${email}`);
    }

    // 중복 확인
    const existingEmail = await prisma.hospital.findUnique({
      where: { email }
    });

    if (existingEmail) {
      return reply.status(400).send({
        success: false,
        message: '이미 사용 중인 이메일입니다.'
      });
    }

    const existingBusiness = await prisma.hospital.findUnique({
      where: { businessRegistrationNumber: business_registration_number }
    });

    if (existingBusiness) {
      return reply.status(400).send({
        success: false,
        message: '이미 등록된 사업자등록번호입니다.'
      });
    }

    // 비밀번호 해시
    const passwordHash = await bcrypt.hash(password, 10);

    // 병원 등록
    const hospital = await prisma.hospital.create({
      data: {
        email,
        passwordHash,
        businessRegistrationNumber: business_registration_number,
        hospitalName: hospital_name,
        directorName: director_name,
        hospitalAddress: hospital_address,
        hospitalPhone: hospital_phone,
        managerName: manager_name,
        managerPhone: manager_phone,
        emailVerified: true,
        termsServiceAgreed: terms_service_agreed || false,
        termsPrivacyAgreed: terms_privacy_agreed || false,
        termsThirdPartyAgreed: terms_third_party_agreed || false,
        marketingAgreed: marketing_agreed || false
      }
    });

    return reply.status(201).send({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        id: hospital.id,
        email: hospital.email,
        hospital_name: hospital.hospitalName
      }
    });
  });

  /**
   * 의사 회원가입
   * POST /api/auth/register/doctor
   */
  fastify.post('/register/doctor', {
    preValidation: zodValidation(registerDoctorSchema)
  }, async (request, reply) => {
    const {
      email,
      password,
      name,
      license_number,
      address,
      phone,
      bank_name,
      account_number,
      terms_service_agreed,
      terms_privacy_agreed,
      terms_third_party_agreed,
      marketing_agreed
    } = request.body;

    // 이메일 인증 확인
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email,
        verified: true
      }
    });

    if (!verification && !allowUnverifiedSignup) {
      return reply.status(400).send({
        success: false,
        message: '이메일 인증이 완료되지 않았습니다.'
      });
    }
    if (!verification && allowUnverifiedSignup) {
      fastify.log.warn(`DEV: 이메일 인증 없이 회원가입 허용 - ${email}`);
    }

    // 중복 확인
    const existing = await prisma.doctor.findUnique({
      where: { email }
    });

    if (existing) {
      return reply.status(400).send({
        success: false,
        message: '이미 사용 중인 이메일입니다.'
      });
    }

    // 비밀번호 해시
    const passwordHash = await bcrypt.hash(password, 10);

    // 의사 등록
    const doctor = await prisma.doctor.create({
      data: {
        email,
        passwordHash,
        name,
        licenseNumber: license_number,
        address,
        phone,
        bankName: bank_name,
        accountNumber: account_number,
        emailVerified: true,
        termsServiceAgreed: terms_service_agreed || false,
        termsPrivacyAgreed: terms_privacy_agreed || false,
        termsThirdPartyAgreed: terms_third_party_agreed || false,
        marketingAgreed: marketing_agreed || false
      }
    });

    return reply.status(201).send({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        id: doctor.id,
        email: doctor.email,
        name: doctor.name
      }
    });
  });

  /**
   * 일반직원 회원가입
   * POST /api/auth/register/employee
   */
  fastify.post('/register/employee', {
    preValidation: zodValidation(registerEmployeeSchema)
  }, async (request, reply) => {
    const {
      email,
      password,
      name,
      birth_date,
      address,
      phone,
      bank_name,
      account_number,
      terms_service_agreed,
      terms_privacy_agreed,
      marketing_agreed
    } = request.body;

    // 이메일 인증 확인
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email,
        verified: true
      }
    });

    if (!verification && !allowUnverifiedSignup) {
      return reply.status(400).send({
        success: false,
        message: '이메일 인증이 완료되지 않았습니다.'
      });
    }
    if (!verification && allowUnverifiedSignup) {
      fastify.log.warn(`DEV: 이메일 인증 없이 회원가입 허용 - ${email}`);
    }

    // 중복 확인
    const existing = await prisma.employee.findUnique({
      where: { email }
    });

    if (existing) {
      return reply.status(400).send({
        success: false,
        message: '이미 사용 중인 이메일입니다.'
      });
    }

    // 비밀번호 해시
    const passwordHash = await bcrypt.hash(password, 10);

    // 일반직원 등록
    const employee = await prisma.employee.create({
      data: {
        email,
        passwordHash,
        name,
        birthDate: birth_date ? new Date(birth_date) : null,
        address,
        phone,
        bankName: bank_name,
        accountNumber: account_number,
        emailVerified: true,
        termsServiceAgreed: terms_service_agreed || false,
        termsPrivacyAgreed: terms_privacy_agreed || false,
        marketingAgreed: marketing_agreed || false
      }
    });

    return reply.status(201).send({
      success: true,
      message: '회원가입이 완료되었습니다.',
      data: {
        id: employee.id,
        email: employee.email,
        name: employee.name
      }
    });
  });

  /**
   * 로그인
   * POST /api/auth/login
   */
  fastify.post('/login', {
    ...authRateLimit,
    preValidation: zodValidation(loginSchema)
  }, async (request, reply) => {
    const { email, password, user_type } = request.body;

    // 사용자 정보 조회
    let user;
    
    switch (user_type) {
      case 'hospital':
        user = await prisma.hospital.findUnique({
          where: { email }
        });
        break;
      case 'doctor':
        user = await prisma.doctor.findUnique({
          where: { email }
        });
        break;
      case 'employee':
        user = await prisma.employee.findUnique({
          where: { email }
        });
        break;
    }

    if (!user) {
      return reply.status(401).send({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // 이메일 인증 확인 (프로덕션에서만)
    if (process.env.NODE_ENV === 'production' && !user.emailVerified) {
      return reply.status(401).send({
        success: false,
        message: '이메일 인증이 완료되지 않았습니다.'
      });
    }

    // 비밀번호 확인
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return reply.status(401).send({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // JWT 토큰 생성
    const jwtSecret = fastify.jwtSecret;
    const jwtRefreshSecret = fastify.jwtRefreshSecret;
    
    const accessToken = signAccessToken(
      {
        userId: user.id,
        userType: user_type,
        email: user.email
      },
      jwtSecret,
      process.env.JWT_EXPIRES_IN || '24h'
    );

    const refreshToken = signRefreshToken(
      {
        userId: user.id,
        userType: user_type
      },
      jwtRefreshSecret,
      process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    );

    // 세션 저장
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일 후

    await prisma.session.create({
      data: {
        userType: user_type,
        userId: user.id,
        accessToken,
        refreshToken,
        expiresAt
      }
    });

    // 사용자 정보 반환 (비밀번호 제외)
    const userInfo = {
      id: user.id,
      email: user.email,
      type: user_type
    };

    if (user_type === 'hospital') {
      userInfo.hospital_name = user.hospitalName;
      userInfo.business_registration_number = user.businessRegistrationNumber;
    } else if (user_type === 'doctor') {
      userInfo.name = user.name;
      userInfo.license_number = user.licenseNumber;
    } else if (user_type === 'employee') {
      userInfo.name = user.name;
    }

    return {
      success: true,
      message: '로그인 성공',
      data: {
        user: userInfo,
        accessToken,
        refreshToken
      }
    };
  });

  /**
   * 관리자 로그인 (마스터 계정 전용)
   * POST /api/auth/admin-login
   */
  fastify.post('/admin-login', { ...authRateLimit }, async (request, reply) => {
    const { email, password } = request.body || {};

    if (!email || !password) {
      return reply.status(400).send({ success: false, message: '이메일과 비밀번호를 입력해주세요.' });
    }

    // 마스터 이메일 확인
    const MASTER_EMAILS = (process.env.MASTER_EMAILS || 'admin@theranova.co.kr').split(',').map(e => e.trim().toLowerCase());
    if (!MASTER_EMAILS.includes(email.toLowerCase())) {
      return reply.status(403).send({ success: false, message: '관리자 권한이 없습니다.' });
    }

    // 병원 계정에서 찾기
    const user = await prisma.hospital.findUnique({ where: { email } });
    if (!user) {
      return reply.status(401).send({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return reply.status(401).send({ success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const jwtSecret = fastify.jwtSecret;
    const jwtRefreshSecret = fastify.jwtRefreshSecret;

    const accessToken = signAccessToken(
      { userId: user.id, userType: 'hospital', email: user.email, isAdmin: true },
      jwtSecret,
      '24h'
    );

    const refreshToken = signRefreshToken(
      { userId: user.id, userType: 'hospital' },
      jwtRefreshSecret,
      '7d'
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.session.create({
      data: { userType: 'hospital', userId: user.id, accessToken, refreshToken, expiresAt }
    });

    return {
      success: true,
      message: '관리자 로그인 성공',
      data: {
        user: { id: user.id, email: user.email, type: 'admin', hospital_name: user.hospitalName },
        accessToken,
        refreshToken
      }
    };
  });

  /**
   * 관리자 인증코드 발송
   * POST /api/auth/admin-send-code
   */
  fastify.post('/admin-send-code', {
    config: { rateLimit: { max: 3, timeWindow: '1 minute' } }
  }, async (request, reply) => {
    const { email } = request.body || {};

    if (!email) {
      return reply.status(400).send({ success: false, message: '이메일을 입력해주세요.' });
    }

    // 관리자 이메일만 허용
    if (email.toLowerCase().trim() !== ADMIN_EMAIL) {
      // 보안: 어떤 이메일이든 동일한 응답 (이메일 존재 여부 노출 방지)
      return { success: true, message: '인증 코드가 발송되었습니다.' };
    }

    // 6자리 인증코드 생성
    const adminCode = generateRandomString(6);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5분

    // 기존 코드 삭제
    await prisma.emailVerification.deleteMany({
      where: { email: ADMIN_EMAIL }
    });

    // 새 코드 저장
    await prisma.emailVerification.create({
      data: {
        email: ADMIN_EMAIL,
        verificationCode: adminCode,
        expiresAt
      }
    });

    // 이메일 발송
    await sendAdminLoginCode(ADMIN_EMAIL, adminCode);

    return { success: true, message: '인증 코드가 발송되었습니다.' };
  });

  /**
   * 관리자 인증코드 확인 및 로그인
   * POST /api/auth/admin-verify-code
   */
  fastify.post('/admin-verify-code', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } }
  }, async (request, reply) => {
    const { email, code } = request.body || {};

    if (!email || !code) {
      return reply.status(400).send({ success: false, message: '이메일과 인증 코드를 입력해주세요.' });
    }

    // 관리자 이메일 확인
    if (email.toLowerCase().trim() !== ADMIN_EMAIL) {
      return reply.status(403).send({ success: false, message: '관리자 권한이 없습니다.' });
    }

    // 인증코드 확인
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email: ADMIN_EMAIL,
        verificationCode: code,
        expiresAt: { gt: new Date() },
        verified: false
      }
    });

    if (!verification) {
      return reply.status(400).send({ success: false, message: '유효하지 않거나 만료된 인증 코드입니다.' });
    }

    // 코드 사용 처리
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { verified: true }
    });

    // 관리자 JWT 생성
    const jwtSecret = fastify.jwtSecret;
    const jwtRefreshSecret = fastify.jwtRefreshSecret;

    const adminId = `admin_${ADMIN_EMAIL}`;
    const accessToken = signAccessToken(
      { userId: adminId, userType: 'admin', email: ADMIN_EMAIL, isAdmin: true },
      jwtSecret,
      '12h'
    );

    const refreshToken = signRefreshToken(
      { userId: adminId, userType: 'admin' },
      jwtRefreshSecret,
      '7d'
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.session.create({
      data: { userType: 'admin', userId: adminId, accessToken, refreshToken, expiresAt }
    });

    return {
      success: true,
      message: '관리자 로그인 성공',
      data: {
        user: {
          id: adminId,
          email: ADMIN_EMAIL,
          type: 'admin'
        },
        accessToken,
        refreshToken
      }
    };
  });

  /**
   * 비밀번호 찾기 - 인증 코드 발송
   * POST /api/auth/forgot-password
   */
  fastify.post('/forgot-password', { ...emailRateLimit }, async (request, reply) => {
    const { email, user_type } = request.body;

    if (!email || !user_type) {
      return reply.status(400).send({
        success: false,
        message: '이메일과 사용자 유형을 입력해주세요.'
      });
    }

    // 사용자 존재 확인
    let user;
    switch (user_type) {
      case 'hospital':
        user = await prisma.hospital.findUnique({ where: { email } });
        break;
      case 'doctor':
        user = await prisma.doctor.findUnique({ where: { email } });
        break;
      case 'employee':
        user = await prisma.employee.findUnique({ where: { email } });
        break;
    }

    if (!user) {
      // 보안상 사용자가 없어도 성공 응답
      return { success: true, message: '인증 코드가 발송되었습니다.' };
    }

    // 인증 코드 생성
    const resetCode = generateRandomString(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 기존 코드 삭제
    await prisma.emailVerification.deleteMany({
      where: { email }
    });

    // 새 코드 저장
    await prisma.emailVerification.create({
      data: {
        email,
        verificationCode: resetCode,
        expiresAt
      }
    });

    // 이메일 발송
    await sendPasswordResetEmail(email, resetCode);

    return { success: true, message: '인증 코드가 발송되었습니다.' };
  });

  /**
   * 비밀번호 재설정
   * POST /api/auth/reset-password
   */
  fastify.post('/reset-password', async (request, reply) => {
    const { email, user_type, verification_code, new_password } = request.body;

    if (!email || !user_type || !verification_code || !new_password) {
      return reply.status(400).send({
        success: false,
        message: '모든 필드를 입력해주세요.'
      });
    }

    if (new_password.length < 8) {
      return reply.status(400).send({
        success: false,
        message: '비밀번호는 최소 8자 이상이어야 합니다.'
      });
    }

    // 인증 코드 확인
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email,
        verificationCode: verification_code,
        expiresAt: { gt: new Date() },
        verified: false
      }
    });

    if (!verification) {
      return reply.status(400).send({
        success: false,
        message: '유효하지 않거나 만료된 인증 코드입니다.'
      });
    }

    // 비밀번호 해시
    const passwordHash = await bcrypt.hash(new_password, 10);

    // 비밀번호 업데이트
    switch (user_type) {
      case 'hospital':
        await prisma.hospital.update({
          where: { email },
          data: { passwordHash }
        });
        break;
      case 'doctor':
        await prisma.doctor.update({
          where: { email },
          data: { passwordHash }
        });
        break;
      case 'employee':
        await prisma.employee.update({
          where: { email },
          data: { passwordHash }
        });
        break;
    }

    // 인증 코드 사용 완료 처리
    await prisma.emailVerification.update({
      where: { id: verification.id },
      data: { verified: true }
    });

    // 비밀번호 변경 시 모든 기존 세션 무효화 (보안)
    const userModel = user_type === 'hospital' ? prisma.hospital
      : user_type === 'doctor' ? prisma.doctor
      : prisma.employee;
    const user = await userModel.findUnique({ where: { email } });
    if (user) {
      await prisma.session.deleteMany({
        where: { userId: user.id, userType: user_type }
      });
    }

    return { success: true, message: '비밀번호가 변경되었습니다.' };
  });

  /**
   * 로그아웃
   * POST /api/auth/logout
   */
  fastify.post('/logout', async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (token) {
      // 세션 삭제
      await prisma.session.deleteMany({
        where: { accessToken: token }
      });
    }

    return {
      success: true,
      message: '로그아웃되었습니다.'
    };
  });
}

export default authRoutes;
