// 사용자 타입
export type UserType = 'hospital' | 'doctor' | 'employee';

// 사용자 인터페이스
export interface User {
  id: string;
  email: string;
  type: UserType;
  name?: string;
  hospital_name?: string;
  business_registration_number?: string;
  license_number?: string;
}

// 로그인 요청
export interface LoginRequest {
  email: string;
  password: string;
  user_type: UserType;
}

// 로그인 응답
export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

// 병원 회원가입 요청
export interface RegisterHospitalRequest {
  email: string;
  password: string;
  business_registration_number: string;
  hospital_name: string;
  director_name: string;
  hospital_address: string;
  hospital_phone: string;
  manager_name?: string;
  manager_phone?: string;
  terms_service_agreed: boolean;
  terms_privacy_agreed: boolean;
  terms_third_party_agreed: boolean;
  marketing_agreed: boolean;
}

// 의사 회원가입 요청
export interface RegisterDoctorRequest {
  email: string;
  password: string;
  name: string;
  license_number: string;
  address: string;
  phone?: string;
  bank_name?: string;
  account_number?: string;
  terms_service_agreed: boolean;
  terms_privacy_agreed: boolean;
  terms_third_party_agreed: boolean;
  marketing_agreed: boolean;
}

// 일반직원 회원가입 요청
export interface RegisterEmployeeRequest {
  email: string;
  password: string;
  name: string;
  birth_date?: string;
  address: string;
  phone?: string;
  bank_name?: string;
  account_number?: string;
  terms_service_agreed: boolean;
  terms_privacy_agreed: boolean;
  marketing_agreed: boolean;
}

// API 응답
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}
