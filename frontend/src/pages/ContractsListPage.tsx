import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractAPI } from '../lib/api';

interface Contract {
  id: string;
  contractNumber: string;
  doctorName?: string;
  employeeName?: string;
  status: string;
  createdAt: string;
}

export default function ContractsListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dailyContracts, setDailyContracts] = useState<Contract[]>([]);
  const [regularContracts, setRegularContracts] = useState<Contract[]>([]);
  const [error, setError] = useState('');

  // 로그인한 사용자 정보 가져오기
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isHospital = user.type === 'hospital';

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data } = await contractAPI.getList();
      
      if (data.success) {
        setDailyContracts(data.data.daily_contracts || []);
        setRegularContracts(data.data.regular_contracts || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { data } = await contractAPI.delete(id);
      
      if (data.success) {
        alert('계약서가 삭제되었습니다.');
        loadContracts();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': '초안',
      'sent': '발송됨',
      'pending': '서명 대기',
      'signed': '서명 완료',
      'rejected': '거부됨',
      'cancelled': '취소됨'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800 border border-gray-300',
      'sent': 'bg-blue-100 text-blue-800 border border-blue-300',
      'pending': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      'signed': 'bg-green-100 text-green-800 border border-green-300',
      'rejected': 'bg-red-100 text-red-800 border border-red-300',
      'cancelled': 'bg-gray-100 text-gray-600 border border-gray-300'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 border border-gray-300';
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'draft':
        return '📝';
      case 'sent':
        return '📤';
      case 'pending':
        return '⏳';
      case 'signed':
        return '✅';
      case 'rejected':
        return '❌';
      case 'cancelled':
        return '🚫';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg animate-pulse">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div className="text-lg font-semibold text-gray-700">계약서 목록을 불러오는 중...</div>
        </div>
      </div>
    );
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
                  계약서 목록
                </h1>
                <p className="text-xs text-gray-600 font-medium">전체 계약서 관리</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              ← 대시보드
            </button>
          </div>
        </div>
      </header>

      <div className="container-center py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* 일용직 계약서 */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">일용직 근로계약서</h2>
                <p className="text-sm text-gray-600">{dailyContracts.length}개의 계약서</p>
              </div>
            </div>
            {isHospital && (
              <button
                onClick={() => navigate('/contracts/daily')}
                className="btn-primary"
              >
                + 새로 작성
              </button>
            )}
          </div>

          {dailyContracts.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-600 font-medium">작성된 일용직 계약서가 없습니다.</p>
              {isHospital && (
                <button
                  onClick={() => navigate('/contracts/daily')}
                  className="btn-outline mt-4"
                >
                  첫 계약서 작성하기
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {dailyContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="bg-gradient-to-r from-white to-gray-50 rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl">{getStatusIcon(contract.status)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{contract.contractNumber}</h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                            {getStatusText(contract.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="whitespace-nowrap">{contract.doctorName || '의사 정보 없음'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(contract.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/contracts/${contract.id}`)}
                        className="btn-outline text-indigo-600 border-indigo-600 hover:bg-indigo-50"
                      >
                        상세보기
                      </button>
                      {isHospital && contract.status === 'draft' && (
                        <button
                          onClick={() => handleDelete(contract.id)}
                          className="btn-secondary text-red-600 hover:bg-red-50 border-red-300"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 일반 근로계약서 */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">일반 근로계약서</h2>
                <p className="text-sm text-gray-600">{regularContracts.length}개의 계약서</p>
              </div>
            </div>
            {isHospital && (
              <button
                onClick={() => navigate('/contracts/regular')}
                className="btn-primary"
              >
                + 새로 작성
              </button>
            )}
          </div>

          {regularContracts.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-600 font-medium">작성된 일반 근로계약서가 없습니다.</p>
              {isHospital && (
                <button
                  onClick={() => navigate('/contracts/regular')}
                  className="btn-outline mt-4"
                >
                  첫 계약서 작성하기
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {regularContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="bg-gradient-to-r from-white to-gray-50 rounded-xl border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl">{getStatusIcon(contract.status)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{contract.contractNumber}</h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                            {getStatusText(contract.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {contract.employeeName || '직원 정보 없음'}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(contract.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/contracts/${contract.id}`)}
                        className="btn-outline text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                      >
                        상세보기
                      </button>
                      {isHospital && contract.status === 'draft' && (
                        <button
                          onClick={() => handleDelete(contract.id)}
                          className="btn-secondary text-red-600 hover:bg-red-50 border-red-300"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
