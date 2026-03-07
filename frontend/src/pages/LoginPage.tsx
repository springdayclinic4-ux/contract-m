import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../lib/api';
import type { UserType } from '../types';

export default function LoginPage() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType>('hospital');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await authAPI.login(email, password, userType);
      const payload = data?.data;

      if (data?.success && payload?.accessToken && payload?.user) {
        // 토큰 저장
        localStorage.setItem('accessToken', payload.accessToken);
        localStorage.setItem('user', JSON.stringify(payload.user));

        // 대시보드로 이동
        navigate('/dashboard');
      } else {
        setError(data?.message || '로그인 응답이 올바르지 않습니다.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="max-w-md w-full mx-4">
        <div className="card glass-effect">
          {/* 로고 및 제목 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              THERANOVA
            </h1>
            <p className="text-gray-600 font-medium">계약서 관리 시스템</p>
          </div>

          {/* 사용자 유형 선택 */}
          <div className="mb-6">
            <label className="label text-gray-700">사용자 유형</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                className={`py-3 px-4 rounded-xl border-2 transition-all duration-300 font-semibold ${
                  userType === 'hospital'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-400 hover:shadow-md'
                }`}
                onClick={() => setUserType('hospital')}
              >
                🏥 병원
              </button>
              <button
                type="button"
                className={`py-3 px-4 rounded-xl border-2 transition-all duration-300 font-semibold ${
                  userType === 'doctor'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-400 hover:shadow-md'
                }`}
                onClick={() => setUserType('doctor')}
              >
                👨‍⚕️ 의사
              </button>
              <button
                type="button"
                className={`py-3 px-4 rounded-xl border-2 transition-all duration-300 font-semibold ${
                  userType === 'employee'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-400 hover:shadow-md'
                }`}
                onClick={() => setUserType('employee')}
              >
                👤 직원
              </button>
            </div>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label text-gray-700">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="example@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="label text-gray-700">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-3.5 text-lg"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  로그인 중...
                </span>
              ) : '로그인'}
            </button>
          </form>

          {/* 비밀번호 찾기 & 회원가입 링크 */}
          <div className="mt-6 text-center space-y-2">
            <p>
              <Link
                to="/forgot-password"
                className="text-gray-500 hover:text-indigo-600 text-sm transition-colors"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </p>
            <p className="text-gray-600">
              계정이 없으신가요?{' '}
              <Link
                to="/register"
                className="text-indigo-600 hover:text-purple-600 font-semibold transition-colors"
              >
                회원가입
              </Link>
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="font-medium">© 2026 THERANOVA Contract Management System</p>
          <p className="text-xs mt-1 text-gray-500">Powered by THERANOVA Healthcare Solutions</p>
        </div>
      </div>
    </div>
  );
}
