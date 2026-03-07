import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../lib/api';
import type { UserType } from '../types';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email');
  const [userType, setUserType] = useState<UserType>('hospital');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.forgotPassword(email, userType);
      setStep('verify');
      alert('인증 코드가 이메일로 발송되었습니다.');
    } catch (err: any) {
      setError(err.response?.data?.message || '인증 코드 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(email, userType, verificationCode, newPassword);
      alert('비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="max-w-md w-full mx-4">
        <div className="card glass-effect">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">비밀번호 찾기</h1>
            <p className="text-gray-600 text-sm">
              {step === 'email' && '가입한 이메일로 인증 코드를 발송합니다.'}
              {step === 'verify' && '이메일로 받은 인증 코드를 입력하고 새 비밀번호를 설정하세요.'}
            </p>
          </div>

          {/* 사용자 유형 선택 */}
          <div className="mb-6">
            <label className="label text-gray-700">사용자 유형</label>
            <div className="grid grid-cols-3 gap-3">
              {(['hospital', 'doctor', 'employee'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`py-2 px-3 rounded-xl border-2 transition-all duration-300 font-semibold text-sm ${
                    userType === type
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-400'
                  }`}
                  onClick={() => setUserType(type)}
                  disabled={step !== 'email'}
                >
                  {type === 'hospital' ? '병원' : type === 'doctor' ? '의사' : '직원'}
                </button>
              ))}
            </div>
          </div>

          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div>
                <label className="label text-gray-700">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="가입한 이메일 주소"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                {loading ? '발송 중...' : '인증 코드 발송'}
              </button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="label text-gray-700">이메일</label>
                <input type="email" value={email} className="input-field bg-gray-100" disabled />
              </div>

              <div>
                <label className="label text-gray-700">인증 코드 (6자리)</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="input-field"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>

              <div>
                <label className="label text-gray-700">새 비밀번호</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="최소 8자 이상"
                  minLength={8}
                  required
                />
              </div>

              <div>
                <label className="label text-gray-700">새 비밀번호 확인</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="비밀번호 재입력"
                  minLength={8}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                {loading ? '변경 중...' : '비밀번호 변경'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); }}
                className="w-full text-center text-sm text-gray-600 hover:text-indigo-600"
              >
                인증 코드 다시 받기
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-indigo-600 hover:text-purple-600 font-semibold transition-colors">
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
