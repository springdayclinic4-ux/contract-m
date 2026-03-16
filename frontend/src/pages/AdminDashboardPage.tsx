import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  draft: '#94a3b8',
  sent: '#60a5fa',
  signed: '#34d399',
  rejected: '#f87171',
};

const STATUS_LABELS: Record<string, string> = {
  draft: '초안',
  sent: '발송',
  signed: '서명완료',
  rejected: '거부',
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const adminToken = localStorage.getItem('adminToken');
      const { data } = await api.get('/statistics', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (data.success) {
        setStats(data.data);
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
        return;
      }
      setError(err.response?.data?.message || '통계를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">관리자 대시보드 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <p className="text-red-600 mb-6">{error}</p>
          <button onClick={() => navigate('/admin/login')} className="btn-outline">
            관리자 로그인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const { activeUsers, userCounts, contractSummary, dailyContracts, dailyNewUsers, recentContracts } = stats || {};

  const pieData = contractSummary?.byStatus
    ? Object.entries(contractSummary.byStatus).map(([key, value]) => ({
        name: STATUS_LABELS[key] || key,
        value: value as number,
        color: STATUS_COLORS[key] || '#a78bfa',
      }))
    : [];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">THERANOVA Admin</h1>
                <p className="text-indigo-200 text-xs">관리자 대시보드</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <SummaryCard label="DAU (일)" value={activeUsers?.dau ?? 0} color="from-blue-500 to-blue-600" />
          <SummaryCard label="WAU (주)" value={activeUsers?.wau ?? 0} color="from-cyan-500 to-cyan-600" />
          <SummaryCard label="MAU (월)" value={activeUsers?.mau ?? 0} color="from-teal-500 to-teal-600" />
          <SummaryCard label="병원" value={userCounts?.hospitals ?? 0} color="from-indigo-500 to-indigo-600" />
          <SummaryCard label="의사 / 직원" value={`${userCounts?.doctors ?? 0} / ${userCounts?.employees ?? 0}`} color="from-purple-500 to-purple-600" />
          <SummaryCard label="전체 계약서" value={contractSummary?.total ?? 0} color="from-pink-500 to-pink-600" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Contracts Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">일일 계약서 생성 수 (최근 30일)</h3>
            <div className="h-64">
              {dailyContracts && dailyContracts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyContracts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v: any) => String(v).slice(5)}
                    />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      labelFormatter={(v: any) => String(v)}
                      formatter={(value: any) => [`${value}건`, '계약서']}
                    />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">데이터 없음</div>
              )}
            </div>
          </div>

          {/* Daily New Users Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">일일 신규 가입자 수 (최근 30일)</h3>
            <div className="h-64">
              {dailyNewUsers && dailyNewUsers.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyNewUsers}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v: any) => String(v).slice(5)}
                    />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      labelFormatter={(v: any) => String(v)}
                      formatter={(value: any) => [`${value}명`, '신규 가입']}
                    />
                    <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">데이터 없음</div>
              )}
            </div>
          </div>
        </div>

        {/* Contract Status + Total Users */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Contract Status Pie */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">계약서 상태별 현황</h3>
            {pieData.length > 0 ? (
              <div className="flex flex-col items-center">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {pieData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any, name: any) => [`${value}건`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {pieData.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-sm">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-gray-600">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">데이터 없음</div>
            )}
          </div>

          {/* Status Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">상태별 계약서 수</h3>
            <div className="h-64">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pieData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip formatter={(value: any) => [`${value}건`]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {pieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">데이터 없음</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Contracts Table */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">최근 계약서 (최근 10건)</h3>
          {recentContracts && recentContracts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">계약번호</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">의사명</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">병원명</th>
                    <th className="text-right py-3 px-3 font-semibold text-gray-600">급여(세전)</th>
                    <th className="text-center py-3 px-3 font-semibold text-gray-600">상태</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-600">생성일</th>
                  </tr>
                </thead>
                <tbody>
                  {recentContracts.map((c: any) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3 font-mono text-xs text-gray-500">{c.contractNumber}</td>
                      <td className="py-3 px-3 text-gray-900">{c.doctorName || '-'}</td>
                      <td className="py-3 px-3 text-gray-700">{c.hospitalName || '-'}</td>
                      <td className="py-3 px-3 text-right text-gray-900">
                        {c.wageGross ? Number(c.wageGross).toLocaleString() + '원' : '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3 px-3 text-gray-500">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString('ko-KR') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">최근 계약서가 없습니다.</div>
          )}
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color}`} />
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    signed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
