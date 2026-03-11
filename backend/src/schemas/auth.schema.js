import { z } from 'zod';

// 이메일 인증 코드 발송
export const sendVerificationSchema = {
  body: z.object({
    email: z.string().email('유효한 이메일 주소를 입력하세요.')
  })
};

// 이메일 인증 코드 확인
export const verifyEmailSchema = {
  body: z.object({
    email: z.string().email('유효한 이메일 주소를 입력하세요.'),
    verification_code: z.string().length(6, '인증 코드는 6자리입니다.')
  })
};

// 병원 회원가입
export const registerHospitalSchema = {
  body: z.object({
    email: z.string().email('유효한 이메일 주소를 입력하세요.'),
    password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
    business_registration_number: z.string().min(1, '사업자등록번호를 입력하세요.'),
    hospital_name: z.string().min(1, '병원명을 입력하세요.'),
    director_name: z.string().min(1, '대표자 성명을 입력하세요.'),
    hospital_address: z.string().min(1, '병원 주소를 입력하세요.'),
    hospital_phone: z.string().min(1, '병원 연락처를 입력하세요.'),
    manager_name: z.string().optional(),
    manager_phone: z.string().optional(),
    terms_service_agreed: z.boolean().optional().default(false),
    terms_privacy_agreed: z.boolean().optional().default(false),
    terms_third_party_agreed: z.boolean().optional().default(false),
    marketing_agreed: z.boolean().optional().default(false)
  })
};

// 의사 회원가입
export const registerDoctorSchema = {
  body: z.object({
    email: z.string().email('유효한 이메일 주소를 입력하세요.'),
    password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
    name: z.string().min(1, '성명을 입력하세요.'),
    license_number: z.string().min(1, '면허번호를 입력하세요.'),
    address: z.string().min(1, '주소를 입력하세요.'),
    phone: z.string().optional(),
    bank_name: z.string().optional(),
    account_number: z.string().optional(),
    terms_service_agreed: z.boolean().optional().default(false),
    terms_privacy_agreed: z.boolean().optional().default(false),
    terms_third_party_agreed: z.boolean().optional().default(false),
    marketing_agreed: z.boolean().optional().default(false)
  })
};

// 일반직원 회원가입
export const registerEmployeeSchema = {
  body: z.object({
    email: z.string().email('유효한 이메일 주소를 입력하세요.'),
    password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
    name: z.string().min(1, '성명을 입력하세요.'),
    birth_date: z.string().optional(),
    address: z.string().min(1, '주소를 입력하세요.'),
    phone: z.string().optional(),
    bank_name: z.string().optional(),
    account_number: z.string().optional(),
    terms_service_agreed: z.boolean().optional().default(false),
    terms_privacy_agreed: z.boolean().optional().default(false),
    marketing_agreed: z.boolean().optional().default(false)
  })
};

// 로그인
export const loginSchema = {
  body: z.object({
    email: z.string().email('유효한 이메일 주소를 입력하세요.'),
    password: z.string().min(1, '비밀번호를 입력하세요.'),
    user_type: z.enum(['hospital', 'doctor', 'employee'], {
      errorMap: () => ({ message: '사용자 유형을 선택하세요. (hospital, doctor, employee)' })
    })
  })
};
