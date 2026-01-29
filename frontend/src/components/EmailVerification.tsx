import { useState } from 'react';
import { authAPI } from '../lib/api';

interface EmailVerificationProps {
  onVerified: (email: string) => void;
}

export default function EmailVerification({ onVerified }: EmailVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = async () => {
    setError('');
    setLoading(true);
    try {
      await authAPI.sendVerification(email);
      setCodeSent(true);
      alert('인증 코드가 이메일로 발송되었습니다.');
    } catch (err: any) {
      setError(err.response?.data?.message || '인증 코드 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    setLoading(true);
    try {
      await authAPI.verifyEmail(email, verificationCode);
      alert('이메일 인증이 완료되었습니다.');
      onVerified(email);
    } catch (err: any) {
      setError(err.response?.data?.message || '인증 코드가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label">이메일</label>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="example@email.com"
            disabled={codeSent}
            required
          />
          <button
            type="button"
            onClick={handleSendCode}
            className="btn-primary whitespace-nowrap px-6"
            disabled={loading || codeSent || !email}
          >
            {codeSent ? '발송됨' : '인증코드'}
          </button>
        </div>
      </div>

      {codeSent && (
        <div>
          <label className="label">인증 코드 (6자리)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="input-field"
              placeholder="123456"
              maxLength={6}
              required
            />
            <button
              type="button"
              onClick={handleVerifyCode}
              className="btn-primary whitespace-nowrap px-6"
              disabled={loading || !verificationCode}
            >
              {loading ? '확인 중...' : '확인'}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            이메일로 발송된 6자리 인증 코드를 입력하세요.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
