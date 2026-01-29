import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 로그인 확인
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse user data:', err);
        localStorage.removeItem('user');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      // 로그아웃 에러는 무시
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* 헤더 */}
      <header className="glass-effect shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="container-center py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  THERANOVA
                </h1>
                <p className="text-xs text-gray-600 font-medium">계약서 관리 시스템</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-800">
                  {user.hospital_name || user.hospitalName || user.name || user.email}
                </p>
                <p className="text-xs text-gray-500">
                  {user.type === 'hospital' ? '🏥 병원' : user.type === 'doctor' ? '👨‍⚕️ 의사' : '👤 직원'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container-center py-8">
        {/* 사용자 역할 안내 */}
        <div className="mb-6 card bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-2xl">{user.type === 'hospital' ? '🏥' : user.type === 'doctor' ? '👨‍⚕️' : '👤'}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                {user.type === 'hospital' ? '병원' : user.type === 'doctor' ? '의사' : '직원'} 계정으로 로그인 중
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                {user.type === 'hospital' 
                  ? '병원으로서 의사 및 직원과 계약서를 작성하고 발송할 수 있습니다.'
                  : user.type === 'doctor'
                  ? '병원으로부터 받은 일용직 계약서를 확인하고 전자서명할 수 있습니다.'
                  : '병원으로부터 받은 근로계약서를 확인하고 전자서명할 수 있습니다.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* 계약서 작성 섹션 - 병원만 */}
        {user.type === 'hospital' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-3xl">📝</span> 계약서 작성
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card border-l-4 border-indigo-500 hover:scale-105 transition-transform duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    일용직 계약서
                  </h3>
                </div>
                <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-semibold">작성</span>
              </div>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                {user.type === 'hospital' 
                  ? '의사 대진 계약서를 작성하여 의사에게 발송합니다.'
                  : '다른 의사나 직원에게 일용직 계약서를 작성하여 발송합니다.'
                }
              </p>
              <button
                type="button"
                className="btn-primary w-full"
                onClick={() => handleNavigate('/contracts/daily')}
              >
                작성하기 →
              </button>
            </div>

            <div className="card border-l-4 border-gray-300 hover:scale-105 transition-transform duration-300 opacity-60">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    일반 근로계약서
                  </h3>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-semibold">준비중</span>
              </div>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                일반 직원 고용 계약서 기능을 준비 중입니다.
              </p>
              <button
                type="button"
                className="btn-secondary w-full cursor-not-allowed"
                disabled
              >
                🚧 준비 중
              </button>
            </div>

            <div className="card border-l-4 border-purple-500 hover:scale-105 transition-transform duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    계약서 목록
                  </h3>
                </div>
                <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-semibold">관리</span>
              </div>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                내가 작성하고 발송한 모든 계약서를 확인하고 관리합니다.
              </p>
              <button
                type="button"
                className="btn-outline w-full"
                onClick={() => handleNavigate('/contracts')}
              >
                목록 보기 →
              </button>
            </div>
          </div>
          </div>
        )}

        {/* 받은 계약서 섹션 (의사/직원만) */}
        {user.type !== 'hospital' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-3xl">✍️</span> 받은 계약서
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="card border-l-4 border-orange-500 hover:scale-105 transition-transform duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      서명 대기 중
                    </h3>
                  </div>
                  <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-semibold">대기</span>
                </div>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  이메일로 받은 계약서에 전자서명하거나 거부할 수 있습니다.
                </p>
                <button
                  type="button"
                  className="btn-outline w-full text-orange-600 border-orange-600 hover:bg-orange-50"
                  onClick={() => alert('📧 이메일로 받은 링크를 통해 계약서에 접근할 수 있습니다.\n\n1. 이메일 확인\n2. 초대 링크 클릭\n3. 계약서 확인 및 서명')}
                >
                  안내 보기
                </button>
              </div>

              <div className="card border-l-4 border-green-500 hover:scale-105 transition-transform duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      서명 완료
                    </h3>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">완료</span>
                </div>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  서명이 완료된 계약서를 확인하고 PDF로 다운로드할 수 있습니다.
                </p>
                <button
                  type="button"
                  className="btn-outline w-full"
                  onClick={() => navigate('/contracts?filter=signed')}
                >
                  목록 보기 →
                </button>
              </div>

              <div className="card border-l-4 border-gray-500 hover:scale-105 transition-transform duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      모든 계약서
                    </h3>
                  </div>
                  <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-semibold">전체</span>
                </div>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  서명 대기 및 완료된 모든 계약서를 확인할 수 있습니다.
                </p>
                <button
                  type="button"
                  className="btn-outline w-full"
                  onClick={() => navigate('/contracts')}
                >
                  전체 보기 →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 기타 기능 섹션 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⚙️ 기타 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📊 통계
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                계약서 작성 및 서명 통계를 확인합니다.
              </p>
              <button
                type="button"
                className="btn-outline w-full"
                onClick={() => handleNavigate('/statistics')}
              >
                통계 보기
              </button>
            </div>

            <div className="card hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ⚙️ 설정
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                계정 정보 및 비밀번호를 관리합니다.
              </p>
              <button
                type="button"
                className="btn-outline w-full"
                onClick={() => handleNavigate('/settings')}
              >
                설정하기
              </button>
            </div>
          </div>
        </div>

        {/* 환영 메시지 */}
        <div className="card bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-3xl">🎉</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                환영합니다!
              </h2>
              <p className="text-gray-700 mb-3 leading-relaxed">
                <strong className="text-indigo-600">THERANOVA</strong> 계약서 관리 시스템에 로그인하셨습니다.
              </p>
              <div className="bg-white/70 rounded-xl p-3 border border-indigo-100">
                <p className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-xl flex-shrink-0">💡</span>
                  <span>
                    <strong className="text-indigo-600">팁:</strong> {user.type === 'hospital' 
                      ? '병원 정보는 회원가입 시 입력한 정보가 자동으로 채워집니다. 계약서를 작성하여 의사와 직원에게 발송할 수 있습니다.'
                      : user.type === 'doctor'
                      ? '병원으로부터 이메일로 받은 계약서 초대 링크를 통해 계약서를 확인하고 전자서명할 수 있습니다.'
                      : '병원으로부터 이메일로 받은 계약서 초대 링크를 통해 계약서를 확인하고 전자서명할 수 있습니다.'
                    }
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
