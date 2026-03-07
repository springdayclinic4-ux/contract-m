import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import type { RegisterHospitalRequest } from '../types';

export default function RegisterHospitalForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'form'>('email');
  
  // 이메일 인증
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);

  // 회원가입 폼
  // 자동 하이픈 포맷 함수
  const formatBusinessNumber = (value: string) => {
    const nums = value.replace(/[^0-9]/g, '').slice(0, 10);
    if (nums.length <= 3) return nums;
    if (nums.length <= 5) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
    return `${nums.slice(0, 3)}-${nums.slice(3, 5)}-${nums.slice(5)}`;
  };

  const formatPhone = (value: string) => {
    const nums = value.replace(/[^0-9]/g, '').slice(0, 11);
    if (nums.startsWith('02')) {
      if (nums.length <= 2) return nums;
      if (nums.length <= 5) return `${nums.slice(0, 2)}-${nums.slice(2)}`;
      if (nums.length <= 9) return `${nums.slice(0, 2)}-${nums.slice(2, 5)}-${nums.slice(5)}`;
      return `${nums.slice(0, 2)}-${nums.slice(2, 6)}-${nums.slice(6)}`;
    }
    if (nums.length <= 3) return nums;
    if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
    return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7)}`;
  };

  const [formData, setFormData] = useState<RegisterHospitalRequest>({
    email: '',
    password: '',
    business_registration_number: '',
    hospital_name: '',
    director_name: '',
    hospital_address: '',
    hospital_phone: '',
    manager_name: '',
    manager_phone: '',
    terms_service_agreed: false,
    terms_privacy_agreed: false,
    terms_third_party_agreed: false,
    marketing_agreed: false,
  });

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
      setVerified(true);
      setFormData({ ...formData, email });
      setStep('form');
    } catch (err: any) {
      setError(err.response?.data?.message || '인증 코드가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.terms_service_agreed || !formData.terms_privacy_agreed) {
      setError('필수 약관에 동의해주세요.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authAPI.registerHospital(formData);
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'email') {
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
              placeholder="hospital@example.com"
              disabled={codeSent}
              required
            />
            <button
              type="button"
              onClick={handleSendCode}
              className="btn-primary whitespace-nowrap"
              disabled={loading || codeSent || !email}
            >
              {codeSent ? '발송됨' : '인증코드 발송'}
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
                className="btn-primary whitespace-nowrap"
                disabled={loading || verified}
              >
                {loading ? '확인 중...' : verified ? '인증완료' : '확인'}
              </button>
            </div>
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 인증된 이메일 */}
      <div>
        <label className="label">이메일 (인증완료)</label>
        <input
          type="email"
          value={formData.email}
          className="input-field bg-gray-100"
          disabled
        />
      </div>

      {/* 비밀번호 */}
      <div>
        <label className="label">비밀번호 *</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="input-field"
          placeholder="최소 8자 이상"
          minLength={8}
          required
        />
      </div>

      {/* 사업자등록번호 */}
      <div>
        <label className="label">사업자등록번호 *</label>
        <input
          type="text"
          value={formData.business_registration_number}
          onChange={(e) => setFormData({ ...formData, business_registration_number: formatBusinessNumber(e.target.value) })}
          className="input-field"
          placeholder="000-00-00000"
          required
        />
      </div>

      {/* 병원명 */}
      <div>
        <label className="label">병원명 *</label>
        <input
          type="text"
          value={formData.hospital_name}
          onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
          className="input-field"
          placeholder="OO병원"
          required
        />
      </div>

      {/* 대표자 성명 */}
      <div>
        <label className="label">대표자 성명 *</label>
        <input
          type="text"
          value={formData.director_name}
          onChange={(e) => setFormData({ ...formData, director_name: e.target.value })}
          className="input-field"
          placeholder="홍길동"
          required
        />
      </div>

      {/* 병원 주소 */}
      <div>
        <label className="label">병원 주소 *</label>
        <input
          type="text"
          value={formData.hospital_address}
          onChange={(e) => setFormData({ ...formData, hospital_address: e.target.value })}
          className="input-field"
          placeholder="서울특별시 강남구..."
          required
        />
      </div>

      {/* 병원 연락처 */}
      <div>
        <label className="label">병원 연락처 *</label>
        <input
          type="tel"
          value={formData.hospital_phone}
          onChange={(e) => setFormData({ ...formData, hospital_phone: formatPhone(e.target.value) })}
          className="input-field"
          placeholder="02-1234-5678"
          required
        />
      </div>

      {/* 담당자 정보 (선택) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">담당자 성명</label>
          <input
            type="text"
            value={formData.manager_name}
            onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
            className="input-field"
            placeholder="김담당"
          />
        </div>
        <div>
          <label className="label">담당자 연락처</label>
          <input
            type="tel"
            value={formData.manager_phone}
            onChange={(e) => setFormData({ ...formData, manager_phone: formatPhone(e.target.value) })}
            className="input-field"
            placeholder="010-1234-5678"
          />
        </div>
      </div>

      {/* 약관 동의 */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={formData.terms_service_agreed}
            onChange={(e) => setFormData({ ...formData, terms_service_agreed: e.target.checked })}
            className="mt-1"
            required
          />
          <span className="text-sm">
            <span className="text-red-600">*</span> 서비스 이용약관에 동의합니다
          </span>
        </label>

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={formData.terms_privacy_agreed}
            onChange={(e) => setFormData({ ...formData, terms_privacy_agreed: e.target.checked })}
            className="mt-1"
            required
          />
          <span className="text-sm">
            <span className="text-red-600">*</span> 개인정보 처리방침에 동의합니다
          </span>
        </label>

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={formData.terms_third_party_agreed}
            onChange={(e) => setFormData({ ...formData, terms_third_party_agreed: e.target.checked })}
            className="mt-1"
          />
          <span className="text-sm">개인정보 제3자 제공에 동의합니다 (선택)</span>
        </label>

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={formData.marketing_agreed}
            onChange={(e) => setFormData({ ...formData, marketing_agreed: e.target.checked })}
            className="mt-1"
          />
          <span className="text-sm">마케팅 정보 수신에 동의합니다 (선택)</span>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="btn-primary w-full py-3"
        disabled={loading}
      >
        {loading ? '가입 중...' : '회원가입'}
      </button>
    </form>
  );
}
