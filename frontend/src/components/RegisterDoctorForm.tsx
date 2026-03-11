import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import EmailVerification from './EmailVerification';
import type { RegisterDoctorRequest } from '../types';
import TermsModal, { TermsViewButton } from './TermsModal';

// Validation helpers
const validators = {
  password: (v: string) => v.length >= 8 ? '' : '비밀번호는 8자 이상이어야 합니다.',
  name: (v: string) => /^[가-힣a-zA-Z\s]+$/.test(v) ? '' : '이름은 한글 또는 영어만 입력 가능합니다.',
  licenseNumber: (v: string) => /^\d{4,6}$/.test(v.replace(/[^0-9]/g, '')) ? '' : '면허번호는 숫자 4~6자리입니다.',
  phone: (v: string) => {
    const nums = v.replace(/[^0-9]/g, '');
    return nums.length >= 10 && nums.length <= 11 ? '' : '연락처 형식이 올바르지 않습니다. (010-0000-0000)';
  },
};

export default function RegisterDoctorForm({ redirectAfter, verifiedEmail, onEmailVerified }: { redirectAfter?: string | null; verifiedEmail?: string | null; onEmailVerified?: (email: string) => void }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState(verifiedEmail || '');
  const [verified, setVerified] = useState(!!verifiedEmail);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [termsModal, setTermsModal] = useState<'service' | 'privacy' | 'thirdParty' | 'marketing' | null>(null);

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

  const [formData, setFormData] = useState<RegisterDoctorRequest>({
    email: verifiedEmail || '',
    password: '',
    name: '',
    license_number: '',
    address: '',
    phone: '',
    bank_name: '',
    account_number: '',
    terms_service_agreed: false,
    terms_privacy_agreed: false,
    terms_third_party_agreed: false,
    marketing_agreed: false,
  });

  const validateField = (field: string, value: string) => {
    if (!value.trim()) return '';
    switch (field) {
      case 'password': return validators.password(value);
      case 'name': return validators.name(value);
      case 'license_number': return validators.licenseNumber(value);
      case 'phone': return value.trim() ? validators.phone(value) : '';
    }
    return '';
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    const err = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [field]: err }));
  };

  const validateAll = (): boolean => {
    const errors: Record<string, string> = {};
    errors.password = validators.password(formData.password);
    if (formData.name) errors.name = validators.name(formData.name);
    if (formData.license_number) errors.license_number = validators.licenseNumber(formData.license_number);
    if (formData.phone) errors.phone = validators.phone(formData.phone);

    const filtered = Object.fromEntries(Object.entries(errors).filter(([, v]) => v));
    setFieldErrors(filtered);
    return Object.keys(filtered).length === 0;
  };

  const handleEmailVerified = (vEmail: string) => {
    setEmail(vEmail);
    setVerified(true);
    setFormData({ ...formData, email: vEmail });
    onEmailVerified?.(vEmail);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll()) {
      setError('입력 양식을 확인해주세요.');
      return;
    }

    if (!formData.terms_service_agreed || !formData.terms_privacy_agreed || !formData.terms_third_party_agreed) {
      setError('필수 약관에 동의해주세요.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authAPI.registerDoctor(formData);
      if (redirectAfter) {
        alert('회원가입이 완료되었습니다. 로그인 후 계약서에 서명할 수 있습니다.');
        navigate(redirectAfter);
      } else {
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const FieldError = ({ field }: { field: string }) => {
    if (!fieldErrors[field]) return null;
    return <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>;
  };

  if (!verified) {
    return <EmailVerification onVerified={handleEmailVerified} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">이메일 (인증완료)</label>
        <input
          type="email"
          value={formData.email}
          className="input-field bg-gray-100"
          disabled
        />
      </div>

      <div>
        <label className="label">비밀번호 *</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => handleFieldChange('password', e.target.value)}
          className={`input-field ${fieldErrors.password ? 'border-red-400' : ''}`}
          placeholder="최소 8자 이상"
          required
        />
        <FieldError field="password" />
      </div>

      <div>
        <label className="label">성명 *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          className={`input-field ${fieldErrors.name ? 'border-red-400' : ''}`}
          placeholder="홍길동"
          required
        />
        <FieldError field="name" />
      </div>

      <div>
        <label className="label">의사 면허번호 *</label>
        <input
          type="text"
          value={formData.license_number}
          onChange={(e) => handleFieldChange('license_number', e.target.value)}
          className={`input-field ${fieldErrors.license_number ? 'border-red-400' : ''}`}
          placeholder="면허번호"
          required
        />
        <FieldError field="license_number" />
      </div>

      <div>
        <label className="label">주소 *</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="input-field"
          placeholder="서울특별시 강남구..."
          required
        />
      </div>

      <div>
        <label className="label">연락처</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleFieldChange('phone', formatPhone(e.target.value))}
          className={`input-field ${fieldErrors.phone ? 'border-red-400' : ''}`}
          placeholder="010-1234-5678"
        />
        <FieldError field="phone" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">은행명</label>
          <input
            type="text"
            value={formData.bank_name}
            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
            className="input-field"
            placeholder="국민은행"
          />
        </div>
        <div>
          <label className="label">계좌번호</label>
          <input
            type="text"
            value={formData.account_number}
            onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
            className="input-field"
            placeholder="000-00-000000"
          />
        </div>
      </div>

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
            <TermsViewButton onClick={() => setTermsModal('service')} />
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
            <TermsViewButton onClick={() => setTermsModal('privacy')} />
          </span>
        </label>

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={formData.terms_third_party_agreed}
            onChange={(e) => setFormData({ ...formData, terms_third_party_agreed: e.target.checked })}
            className="mt-1"
            required
          />
          <span className="text-sm">
            <span className="text-red-600">*</span> 개인정보 제3자 제공에 동의합니다
            <TermsViewButton onClick={() => setTermsModal('thirdParty')} />
          </span>
        </label>

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={formData.marketing_agreed}
            onChange={(e) => setFormData({ ...formData, marketing_agreed: e.target.checked })}
            className="mt-1"
          />
          <span className="text-sm">
            마케팅 정보 수신에 동의합니다 (선택)
            <TermsViewButton onClick={() => setTermsModal('marketing')} />
          </span>
        </label>
      </div>

      <TermsModal
        isOpen={!!termsModal}
        onClose={() => setTermsModal(null)}
        type={termsModal || 'service'}
      />

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
