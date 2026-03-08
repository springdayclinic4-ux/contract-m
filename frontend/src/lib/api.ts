import axios from 'axios';

// API 클라이언트 생성
const api = axios.create({
  baseURL: '/api', // Vite proxy를 통해 http://localhost:3000/api로 전달됨
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 전송
});

// 요청 인터셉터: 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 토큰 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 재시도하지 않은 경우 (로그인 요청은 제외)
    const isLoginRequest = originalRequest.url?.includes('/auth/login');
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
      originalRequest._retry = true;

      try {
        // 리프레시 토큰으로 새 액세스 토큰 발급 (추후 구현)
        // const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        // localStorage.setItem('accessToken', data.accessToken);
        // originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        // return api(originalRequest);
        
        // 임시: 로그인 페이지로 리다이렉트
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API 함수들
export const authAPI = {
  // 이메일 인증 코드 발송
  sendVerification: (email: string) =>
    api.post('/auth/send-verification', { email }),

  // 이메일 인증 코드 확인
  verifyEmail: (email: string, verification_code: string) =>
    api.post('/auth/verify-email', { email, verification_code }),

  // 병원 회원가입
  registerHospital: (data: any) =>
    api.post('/auth/register/hospital', data),

  // 의사 회원가입
  registerDoctor: (data: any) =>
    api.post('/auth/register/doctor', data),

  // 일반직원 회원가입
  registerEmployee: (data: any) =>
    api.post('/auth/register/employee', data),

  // 로그인
  login: (email: string, password: string, user_type: 'hospital' | 'doctor' | 'employee') =>
    api.post('/auth/login', { email, password, user_type }),

  // 로그아웃
  logout: () =>
    api.post('/auth/logout'),

  // 비밀번호 찾기 - 인증 코드 발송
  forgotPassword: (email: string, user_type: string) =>
    api.post('/auth/forgot-password', { email, user_type }),

  // 비밀번호 재설정
  resetPassword: (email: string, user_type: string, verification_code: string, new_password: string) =>
    api.post('/auth/reset-password', { email, user_type, verification_code, new_password }),
};

// 계약서 API
export const contractAPI = {
  // 일용직 계약서 생성
  createDaily: (data: any) =>
    api.post('/contracts/daily', data),

  // 일반 근로계약서 생성
  createRegular: (data: any) =>
    api.post('/contracts/regular', data),

  // 계약서 목록 조회
  getList: () =>
    api.get('/contracts'),

  // 계약서 상세 조회
  getDetail: (id: string) =>
    api.get(`/contracts/${id}`),

  // 계약서 발송
  send: (id: string) =>
    api.post(`/contracts/${id}/send`),

  // 초대 토큰으로 계약서 조회
  getByInvitation: (token: string) =>
    api.get(`/contracts/invitation/${token}`),

  // 계약서 서명
  sign: (token: string, signature_image_url: string) =>
    api.post(`/contracts/invitation/${token}/sign`, { signature_image_url }),

  // 계약서 거부
  reject: (token: string, rejection_reason: string) =>
    api.post(`/contracts/invitation/${token}/reject`, { rejection_reason }),

  // 병원(갑) 서명
  hospitalSign: (id: string, hospital_signature_url: string) =>
    api.post(`/contracts/${id}/hospital-sign`, { hospital_signature_url }),

  // 계약서 삭제
  delete: (id: string) =>
    api.delete(`/contracts/${id}`),

  // 의사 대기중 계약서 조회
  getMyPending: () =>
    api.get('/contracts/my-pending'),
};

// 통계 API
export const statisticsAPI = {
  // 전체 통계 조회 (마스터 전용)
  getAll: () =>
    api.get('/statistics'),

  // 내 통계 조회
  getMy: () =>
    api.get('/statistics/my'),
};

// 사용자 API
export const userAPI = {
  // 내 정보 조회
  getMe: () =>
    api.get('/users/me'),

  // 내 정보 조회 (alias)
  getUserProfile: () =>
    api.get('/users/me'),

  // 내 정보 수정
  updateMe: (data: any) =>
    api.put('/users/me', data),

  // 비밀번호 변경
  changePassword: (current_password: string, new_password: string) =>
    api.put('/users/me/password', { current_password, new_password }),
};
