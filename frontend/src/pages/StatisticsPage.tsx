import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { statisticsAPI } from '../lib/api';

export default function StatisticsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statistics, setStatistics] = useState<any>(null);
  const [userType, setUserType] = useState<string>('');

  useEffect(() => {
    // 사용자 타입 확인
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserType(parsedUser.type);
      } catch (err) {
        console.error('Failed to parse user:', err);
      }
    }

    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 병원 계정(마스터)이면 전체 통계, 아니면 내 통계
      const user = localStorage.getItem('user');
      let userType = '';
      
      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          userType = parsedUser.type;
        } catch (err) {
          console.error('Failed to parse user:', err);
        }
      }

      if (userType === 'hospital') {
        const { data } = await statisticsAPI.getAll();
        if (data.success) {
          setStatistics(data.data);
        }
      } else {
        const { data } = await statisticsAPI.getMy();
        if (data.success) {
          setStatistics(data.data);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '통계를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-center py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-outline"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-center py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {userType === 'hospital' ? '전체 통계 (마스터)' : '내 통계'}
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-outline"
          >
            대시보드
          </button>
        </div>

        {/* 마스터 전체 통계 */}
        {userType === 'hospital' && statistics?.summary && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="card">
                <div className="text-sm text-gray-600 mb-1">전체 계약서</div>
                <div className="text-3xl font-bold text-gray-900">
                  {statistics.summary.total_contracts}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  일용직: {statistics.summary.total_daily_contracts} / 일반: {statistics.summary.total_regular_contracts}
                </div>
              </div>
              
              <div className="card">
                <div className="text-sm text-gray-600 mb-1">등록된 의사</div>
                <div className="text-3xl font-bold text-primary-600">
                  {statistics.summary.total_doctors}
                </div>
              </div>
              
              <div className="card">
                <div className="text-sm text-gray-600 mb-1">등록된 직원</div>
                <div className="text-3xl font-bold text-primary-600">
                  {statistics.summary.total_employees}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">일용직 계약서 현황</h3>
                <div className="space-y-2">
                  {statistics.daily_contracts?.by_status && Object.entries(statistics.daily_contracts.by_status).map(([status, count]: [string, any]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-gray-600">{getStatusText(status)}</span>
                      <span className="font-semibold text-gray-900">{count}건</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between items-center font-semibold">
                    <span>전체</span>
                    <span>{statistics.daily_contracts?.total || 0}건</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">일반 근로계약서 현황</h3>
                <div className="space-y-2">
                  {statistics.regular_contracts?.by_status && Object.entries(statistics.regular_contracts.by_status).map(([status, count]: [string, any]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-gray-600">{getStatusText(status)}</span>
                      <span className="font-semibold text-gray-900">{count}건</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between items-center font-semibold">
                    <span>전체</span>
                    <span>{statistics.regular_contracts?.total || 0}건</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 최근 활동 */}
            {statistics.recent_activity && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 작성된 계약서</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">일용직</h4>
                    {statistics.recent_activity.daily_contracts?.length > 0 ? (
                      <ul className="space-y-2">
                        {statistics.recent_activity.daily_contracts.map((contract: any) => (
                          <li key={contract.id} className="text-sm text-gray-600">
                            {contract.contractNumber} - {contract.doctorName}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">최근 계약서가 없습니다.</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">일반</h4>
                    {statistics.recent_activity.regular_contracts?.length > 0 ? (
                      <ul className="space-y-2">
                        {statistics.recent_activity.regular_contracts.map((contract: any) => (
                          <li key={contract.id} className="text-sm text-gray-600">
                            {contract.contractNumber} - {contract.employeeName}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">최근 계약서가 없습니다.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* 일반 사용자 내 통계 */}
        {userType !== 'hospital' && statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">내 일용직 계약서</div>
              <div className="text-3xl font-bold text-gray-900">
                {statistics.my_daily_contracts || 0}
              </div>
            </div>
            
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">내 일반 계약서</div>
              <div className="text-3xl font-bold text-gray-900">
                {statistics.my_regular_contracts || 0}
              </div>
            </div>
            
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">전체</div>
              <div className="text-3xl font-bold text-primary-600">
                {statistics.my_total_contracts || 0}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'draft': '초안',
    'sent': '발송',
    'pending': '대기',
    'signed': '서명완료',
    'rejected': '거부',
    'cancelled': '취소'
  };
  return statusMap[status] || status;
}
