import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../lib/api';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // 프로필 폼
  const [profileData, setProfileData] = useState<any>({});

  // 비밀번호 폼
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data } = await userAPI.getMe();
      
      if (data.success) {
        setUser(data.data);
        setProfileData(data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await userAPI.updateMe(profileData);
      
      if (data.success) {
        setSuccess('프로필이 수정되었습니다.');
        loadUser();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '프로필 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError('새 비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await userAPI.changePassword(
        passwordData.current_password,
        passwordData.new_password
      );
      
      if (data.success) {
        setSuccess('비밀번호가 변경되었습니다.');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md">
          <p className="text-red-700 mb-4">사용자 정보를 불러올 수 없습니다.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">
            대시보드로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-center py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">설정</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-outline"
          >
            대시보드
          </button>
        </div>

        <div className="card">
          {/* 탭 */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-3 px-2 border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-primary-600 text-primary-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                프로필
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`pb-3 px-2 border-b-2 transition-colors ${
                  activeTab === 'password'
                    ? 'border-primary-600 text-primary-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                비밀번호 변경
              </button>
            </div>
          </div>

          {/* 알림 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* 프로필 탭 */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* 병원 */}
              {user.type === 'hospital' && (
                <>
                  <div>
                    <label className="label">이메일</label>
                    <input
                      type="email"
                      value={user.email}
                      className="input-field bg-gray-100"
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">병원명 *</label>
                      <input
                        type="text"
                        value={profileData.hospitalName || ''}
                        onChange={(e) => setProfileData({ ...profileData, hospitalName: e.target.value, hospital_name: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">대표자 성명 *</label>
                      <input
                        type="text"
                        value={profileData.directorName || ''}
                        onChange={(e) => setProfileData({ ...profileData, directorName: e.target.value, director_name: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">병원 주소 *</label>
                    <input
                      type="text"
                      value={profileData.hospitalAddress || ''}
                      onChange={(e) => setProfileData({ ...profileData, hospitalAddress: e.target.value, hospital_address: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">병원 연락처 *</label>
                    <input
                      type="tel"
                      value={profileData.hospitalPhone || ''}
                      onChange={(e) => setProfileData({ ...profileData, hospitalPhone: e.target.value, hospital_phone: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">담당자 성명</label>
                      <input
                        type="text"
                        value={profileData.managerName || ''}
                        onChange={(e) => setProfileData({ ...profileData, managerName: e.target.value, manager_name: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label">담당자 연락처</label>
                      <input
                        type="tel"
                        value={profileData.managerPhone || ''}
                        onChange={(e) => setProfileData({ ...profileData, managerPhone: e.target.value, manager_phone: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 의사 */}
              {user.type === 'doctor' && (
                <>
                  <div>
                    <label className="label">이메일</label>
                    <input
                      type="email"
                      value={user.email}
                      className="input-field bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="label">면허번호</label>
                    <input
                      type="text"
                      value={user.licenseNumber}
                      className="input-field bg-gray-100"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="label">성명 *</label>
                    <input
                      type="text"
                      value={profileData.name || ''}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">주소 *</label>
                    <input
                      type="text"
                      value={profileData.address || ''}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">연락처</label>
                    <input
                      type="tel"
                      value={profileData.phone || ''}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">은행명</label>
                      <input
                        type="text"
                        value={profileData.bankName || ''}
                        onChange={(e) => setProfileData({ ...profileData, bank_name: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label">계좌번호</label>
                      <input
                        type="text"
                        value={profileData.accountNumber || ''}
                        onChange={(e) => setProfileData({ ...profileData, account_number: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* 일반직원 */}
              {user.type === 'employee' && (
                <>
                  <div>
                    <label className="label">이메일</label>
                    <input
                      type="email"
                      value={user.email}
                      className="input-field bg-gray-100"
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">성명 *</label>
                      <input
                        type="text"
                        value={profileData.name || ''}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">생년월일</label>
                      <input
                        type="date"
                        value={profileData.birthDate ? new Date(profileData.birthDate).toISOString().slice(0, 10) : ''}
                        onChange={(e) => setProfileData({ ...profileData, birth_date: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">주소 *</label>
                    <input
                      type="text"
                      value={profileData.address || ''}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">연락처</label>
                    <input
                      type="tel"
                      value={profileData.phone || ''}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">은행명</label>
                      <input
                        type="text"
                        value={profileData.bankName || ''}
                        onChange={(e) => setProfileData({ ...profileData, bank_name: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label">계좌번호</label>
                      <input
                        type="text"
                        value={profileData.accountNumber || ''}
                        onChange={(e) => setProfileData({ ...profileData, account_number: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="btn-primary px-8"
                disabled={saving}
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </form>
          )}

          {/* 비밀번호 변경 탭 */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
              <div>
                <label className="label">현재 비밀번호 *</label>
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">새 비밀번호 *</label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="input-field"
                  placeholder="최소 8자 이상"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="label">새 비밀번호 확인 *</label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="input-field"
                  placeholder="새 비밀번호 다시 입력"
                  minLength={8}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary px-8"
                disabled={saving}
              >
                {saving ? '변경 중...' : '비밀번호 변경'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
