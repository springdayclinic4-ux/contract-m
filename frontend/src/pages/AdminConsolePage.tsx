import { useEffect, useState, useCallback } from 'react';
import api from '../lib/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const ADMIN_STORAGE_KEY = '_thn_ops_token';
const ADMIN_USER_KEY = '_thn_ops_user';

const STATUS_COLORS: Record<string, string> = {
  draft: '#94a3b8', sent: '#60a5fa', signed: '#34d399', rejected: '#f87171', cancelled: '#a78bfa'
};
const STATUS_LABELS: Record<string, string> = {
  draft: '초안', sent: '발송', signed: '서명완료', rejected: '거부', cancelled: '취소'
};

type Tab = 'dashboard' | 'users' | 'contracts';

function getAdminToken() { return localStorage.getItem(ADMIN_STORAGE_KEY); }
function getAdminUser() {
  try { return JSON.parse(localStorage.getItem(ADMIN_USER_KEY) || 'null'); } catch { return null; }
}

function adminApi() {
  const token = getAdminToken();
  return {
    get: (url: string, params?: any) => api.get(url, { headers: { Authorization: `Bearer ${token}` }, params }),
    delete: (url: string) => api.delete(url, { headers: { Authorization: `Bearer ${token}` } }),
  };
}

export default function AdminConsolePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  useEffect(() => {
    const token = getAdminToken();
    const user = getAdminUser();
    if (token && user) {
      setAuthenticated(true);
      setAdminUser(user);
    }
  }, []);

  const handleLoginSuccess = (accessToken: string, user: any) => {
    localStorage.setItem(ADMIN_STORAGE_KEY, accessToken);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    setAuthenticated(true);
    setAdminUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    setAuthenticated(false);
    setAdminUser(null);
  };

  return !authenticated ? (
    <AdminLoginScreen onSuccess={handleLoginSuccess} />
  ) : (
    <AdminPanel
      user={adminUser}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
    />
  );
}

// ========================================
// Login Screen (Email OTP)
// ========================================
function AdminLoginScreen({ onSuccess }: { onSuccess: (token: string, user: any) => void }) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin-send-code', { email: email.trim() });
      if (data?.success) {
        setStep('code');
        setCountdown(300); // 5분
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '코드 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin-verify-code', { email: email.trim(), code: code.trim() });
      if (data?.success && data?.data?.accessToken) {
        onSuccess(data.data.accessToken, data.data.user);
      } else {
        setError(data?.message || '인증에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '인증 코드가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/admin-send-code', { email: email.trim() });
      setCountdown(300);
      setCode('');
    } catch {}
    setLoading(false);
  };

  const formatCountdown = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900">
      <div className="max-w-sm w-full mx-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Operations Console</h1>
            <p className="text-gray-500 text-sm">Authorized Personnel Only</p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">관리자 이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="이메일 주소 입력"
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 text-sm"
              >
                {loading ? '발송 중...' : '인증 코드 받기'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="text-center mb-2">
                <p className="text-gray-400 text-sm">
                  <span className="text-emerald-400 font-medium">{email}</span>
                  <span className="text-gray-600"> 으로 인증 코드를 발송했습니다</span>
                </p>
                {countdown > 0 && (
                  <p className="text-gray-500 text-xs mt-1">
                    남은 시간: <span className="text-emerald-400 font-mono">{formatCountdown(countdown)}</span>
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6))}
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-center text-2xl font-mono tracking-[0.5em] placeholder-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="------"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 text-sm"
              >
                {loading ? '확인 중...' : '로그인'}
              </button>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setStep('email'); setCode(''); setError(''); }}
                  className="text-gray-500 hover:text-gray-300 text-xs"
                >
                  이메일 변경
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading || countdown > 270}
                  className="text-emerald-400 hover:text-emerald-300 text-xs disabled:opacity-40"
                >
                  코드 재발송
                </button>
              </div>
            </form>
          )}

          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========================================
// Admin Panel (authenticated)
// ========================================
function AdminPanel({ user, activeTab, setActiveTab, onLogout }: {
  user: any; activeTab: Tab; setActiveTab: (t: Tab) => void; onLogout: () => void;
}) {
  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'dashboard', label: '대시보드', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { key: 'users', label: '회원관리', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { key: 'contracts', label: '계약서관리', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-gray-900 to-zinc-900 text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">THERANOVA Ops</h1>
              </div>
            </div>

            {/* Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-white/15 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                    </svg>
                    {tab.label}
                  </div>
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {user?.picture && (
                <img src={user.picture} alt="" className="w-8 h-8 rounded-full" />
              )}
              <span className="text-sm text-gray-300 hidden sm:inline">{user?.email}</span>
              <button onClick={onLogout} className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                로그아웃
              </button>
            </div>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden border-t border-white/10">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 text-xs font-medium text-center transition-all ${
                  activeTab === tab.key ? 'text-white bg-white/10' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'contracts' && <ContractsTab />}
      </main>
    </div>
  );
}

// ========================================
// Dashboard Tab
// ========================================
function DashboardTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await adminApi().get('/admin/stats');
        if (data.success) setStats(data.data);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <ErrorMessage message="통계를 불러올 수 없습니다." />;

  const { active_users, users, contracts, contracts_per_day, new_users_per_day, recent_daily_contracts, recent_labor_contracts } = stats;

  const pieData = contracts?.daily?.by_status
    ? Object.entries(contracts.daily.by_status).map(([key, value]) => ({
        name: STATUS_LABELS[key] || key, value: value as number, color: STATUS_COLORS[key] || '#a78bfa'
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="DAU" value={active_users?.dau ?? 0} color="from-blue-500 to-blue-600" />
        <StatCard label="WAU" value={active_users?.wau ?? 0} color="from-cyan-500 to-cyan-600" />
        <StatCard label="MAU" value={active_users?.mau ?? 0} color="from-teal-500 to-teal-600" />
        <StatCard label="병원" value={users?.hospitals ?? 0} color="from-indigo-500 to-indigo-600" />
        <StatCard label="의사/직원" value={`${users?.doctors ?? 0}/${users?.employees ?? 0}`} color="from-purple-500 to-purple-600" />
        <StatCard label="전체 계약서" value={contracts?.total ?? 0} color="from-pink-500 to-pink-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="일일 계약서 생성 (30일)" data={contracts_per_day} color="#6366f1" />
        <ChartCard title="일일 신규 가입자 (30일)" data={new_users_per_day} color="#8b5cf6" />
      </div>

      {/* Pie + Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">계약서 상태 현황</h3>
          {pieData.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" paddingAngle={2}>
                      {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any, n: any) => [`${v}건`, n]} />
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
          ) : <Empty />}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">상태별 계약서 수</h3>
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pieData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip formatter={(v: any) => [`${v}건`]} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </div>
        </div>
      </div>

      {/* Recent Contracts */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">최근 일용직 계약서</h3>
        <ContractTable contracts={recent_daily_contracts || []} type="daily" />
      </div>

      {recent_labor_contracts?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">최근 근로계약서</h3>
          <ContractTable contracts={recent_labor_contracts} type="labor" />
        </div>
      )}
    </div>
  );
}

// ========================================
// Users Tab
// ========================================
function UsersTab() {
  const [userType, setUserType] = useState<'hospital' | 'doctor' | 'employee'>('hospital');
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi().get('/admin/users', { type: userType, page, limit: 20, search });
      const section = data.data?.[userType === 'hospital' ? 'hospitals' : userType === 'doctor' ? 'doctors' : 'employees'];
      setUsers(section?.data || []);
      setTotal(section?.total || 0);
    } catch {}
    setLoading(false);
  }, [userType, page, search]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi().delete(`/admin/users/${userType}/${id}`);
      setDeleteConfirm(null);
      loadUsers();
    } catch {}
  };

  const viewDetail = async (id: string) => {
    try {
      const { data } = await adminApi().get(`/admin/users/${userType}/${id}`);
      if (data.success) setSelectedUser(data.data);
    } catch {}
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      {/* Type Selector + Search */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex gap-2">
            {(['hospital', 'doctor', 'employee'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setUserType(t); setPage(1); setSearch(''); setSearchInput(''); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  userType === t
                    ? 'bg-slate-900 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t === 'hospital' ? '병원' : t === 'doctor' ? '의사' : '직원'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="이름, 이메일 검색..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            />
            <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700">
              검색
            </button>
          </form>

          <span className="text-sm text-gray-500">총 {total}명</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">이메일</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">
                    {userType === 'hospital' ? '병원명' : '이름'}
                  </th>
                  {userType === 'hospital' && <th className="text-left py-3 px-4 font-semibold text-gray-600">사업자번호</th>}
                  {userType === 'doctor' && <th className="text-left py-3 px-4 font-semibold text-gray-600">면허번호</th>}
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">계약서</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">가입일</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">관리</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">데이터가 없습니다</td></tr>
                ) : users.map((u: any) => (
                  <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">{u.email}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {userType === 'hospital' ? u.hospitalName : u.name}
                    </td>
                    {userType === 'hospital' && <td className="py-3 px-4 text-gray-500 font-mono text-xs">{u.businessRegistrationNumber}</td>}
                    {userType === 'doctor' && <td className="py-3 px-4 text-gray-500 font-mono text-xs">{u.licenseNumber}</td>}
                    <td className="py-3 px-4 text-center text-gray-600">
                      {userType === 'hospital'
                        ? (u._count?.contractsAsHospital || 0) + (u._count?.laborContractsAsHospital || 0)
                        : userType === 'doctor'
                        ? (u._count?.contractsAsDoctor || 0) + (u._count?.laborContractsAsDoctor || 0)
                        : (u._count?.laborContractsAsEmployee || 0)
                      }
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(u.createdAt)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => viewDetail(u.id)} className="text-slate-600 hover:text-slate-900 text-xs font-medium">
                          상세
                        </button>
                        {deleteConfirm === u.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800 text-xs font-bold">확인</button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-gray-400 hover:text-gray-600 text-xs">취소</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(u.id)} className="text-red-400 hover:text-red-600 text-xs">
                            삭제
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 disabled:opacity-40"
            >
              이전
            </button>
            <span className="text-sm text-gray-600">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 disabled:opacity-40"
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal user={selectedUser} userType={userType} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}

// ========================================
// Contracts Tab
// ========================================
function ContractsTab() {
  const [contractType, setContractType] = useState<'daily' | 'labor'>('daily');
  const [contracts, setContracts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadContracts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { type: contractType, page, limit: 20, search };
      if (statusFilter) params.status = statusFilter;
      const { data } = await adminApi().get('/admin/contracts', params);
      const section = data.data?.[contractType === 'daily' ? 'daily_contracts' : 'labor_contracts'];
      setContracts(section?.data || []);
      setTotal(section?.total || 0);
    } catch {}
    setLoading(false);
  }, [contractType, page, search, statusFilter]);

  useEffect(() => { loadContracts(); }, [loadContracts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi().delete(`/admin/contracts/${contractType}/${id}`);
      setDeleteConfirm(null);
      loadContracts();
    } catch {}
  };

  const viewDetail = async (id: string) => {
    try {
      const { data } = await adminApi().get(`/admin/contracts/${contractType}/${id}`);
      if (data.success) setSelectedContract(data.data);
    } catch {}
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex gap-2">
            {(['daily', 'labor'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setContractType(t); setPage(1); setSearch(''); setSearchInput(''); setStatusFilter(''); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  contractType === t ? 'bg-slate-900 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t === 'daily' ? '일용직' : '근로계약서'}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
          >
            <option value="">전체 상태</option>
            <option value="draft">초안</option>
            <option value="sent">발송</option>
            <option value="signed">서명완료</option>
            <option value="rejected">거부</option>
          </select>

          <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="이름, 이메일, 계약번호..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            />
            <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700">
              검색
            </button>
          </form>

          <span className="text-sm text-gray-500">총 {total}건</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">계약번호</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">
                    {contractType === 'daily' ? '의사명' : '직원명'}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">병원명</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">금액</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">상태</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">생성일</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">관리</th>
                </tr>
              </thead>
              <tbody>
                {contracts.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">데이터가 없습니다</td></tr>
                ) : contracts.map((c: any) => (
                  <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{c.contractNumber}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {contractType === 'daily' ? c.doctorName : c.employeeName}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{c.hospitalName || '-'}</td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      {contractType === 'daily'
                        ? (c.wageGross ? Number(c.wageGross).toLocaleString() + '원' : '-')
                        : (c.monthlyTotal ? Number(c.monthlyTotal).toLocaleString() + '원/월' : '-')
                      }
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(c.createdAt)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => viewDetail(c.id)} className="text-slate-600 hover:text-slate-900 text-xs font-medium">
                          상세
                        </button>
                        {deleteConfirm === c.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800 text-xs font-bold">확인</button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-gray-400 hover:text-gray-600 text-xs">취소</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(c.id)} className="text-red-400 hover:text-red-600 text-xs">
                            삭제
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 disabled:opacity-40">이전</button>
            <span className="text-sm text-gray-600">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 disabled:opacity-40">다음</button>
          </div>
        )}
      </div>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <ContractDetailModal contract={selectedContract} onClose={() => setSelectedContract(null)} />
      )}
    </div>
  );
}

// ========================================
// Shared Components
// ========================================
function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color}`} />
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  );
}

function ChartCard({ title, data, color }: { title: string; data: any[]; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: any) => String(v).slice(5)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip labelFormatter={(v: any) => String(v)} formatter={(v: any) => [`${v}건`]} />
              <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : <Empty />}
      </div>
    </div>
  );
}

function ContractTable({ contracts, type }: { contracts: any[]; type: 'daily' | 'labor' }) {
  if (!contracts.length) return <Empty />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-3 font-semibold text-gray-600">계약번호</th>
            <th className="text-left py-3 px-3 font-semibold text-gray-600">{type === 'daily' ? '의사명' : '직원명'}</th>
            <th className="text-left py-3 px-3 font-semibold text-gray-600">병원명</th>
            <th className="text-right py-3 px-3 font-semibold text-gray-600">금액</th>
            <th className="text-center py-3 px-3 font-semibold text-gray-600">상태</th>
            <th className="text-left py-3 px-3 font-semibold text-gray-600">생성일</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((c: any) => (
            <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-3 px-3 font-mono text-xs text-gray-500">{c.contractNumber}</td>
              <td className="py-3 px-3 text-gray-900">{type === 'daily' ? c.doctorName : c.employeeName}</td>
              <td className="py-3 px-3 text-gray-700">{c.hospitalName || '-'}</td>
              <td className="py-3 px-3 text-right text-gray-900">
                {type === 'daily'
                  ? (c.wageGross ? Number(c.wageGross).toLocaleString() + '원' : '-')
                  : (c.monthlyTotal ? Number(c.monthlyTotal).toLocaleString() + '원/월' : '-')
                }
              </td>
              <td className="py-3 px-3 text-center"><StatusBadge status={c.status} /></td>
              <td className="py-3 px-3 text-gray-500 text-xs">{formatDate(c.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700', sent: 'bg-blue-100 text-blue-700',
    signed: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-purple-100 text-purple-700'
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function UserDetailModal({ user, userType, onClose }: { user: any; userType: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">회원 상세 정보</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InfoItem label="이메일" value={user.email} />
          {userType === 'hospital' ? (
            <>
              <InfoItem label="병원명" value={user.hospitalName} />
              <InfoItem label="대표자명" value={user.directorName} />
              <InfoItem label="사업자번호" value={user.businessRegistrationNumber} />
              <InfoItem label="주소" value={user.hospitalAddress} />
              <InfoItem label="전화번호" value={user.hospitalPhone} />
              <InfoItem label="담당자명" value={user.managerName} />
              <InfoItem label="담당자 연락처" value={user.managerPhone} />
            </>
          ) : userType === 'doctor' ? (
            <>
              <InfoItem label="이름" value={user.name} />
              <InfoItem label="면허번호" value={user.licenseNumber} />
              <InfoItem label="주소" value={user.address} />
              <InfoItem label="전화번호" value={user.phone} />
              <InfoItem label="은행" value={user.bankName} />
            </>
          ) : (
            <>
              <InfoItem label="이름" value={user.name} />
              <InfoItem label="생년월일" value={user.birthDate ? new Date(user.birthDate).toLocaleDateString('ko-KR') : '-'} />
              <InfoItem label="주소" value={user.address} />
              <InfoItem label="전화번호" value={user.phone} />
              <InfoItem label="은행" value={user.bankName} />
            </>
          )}
          <InfoItem label="이메일 인증" value={user.emailVerified ? 'O' : 'X'} />
          <InfoItem label="가입일" value={formatDate(user.createdAt)} />
        </div>
      </div>
    </div>
  );
}

function ContractDetailModal({ contract, onClose }: { contract: any; onClose: () => void }) {
  const type = contract.contractType;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">계약서 상세</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InfoItem label="계약번호" value={contract.contractNumber} />
          <InfoItem label="상태" value={STATUS_LABELS[contract.status] || contract.status} />
          {type === 'daily' ? (
            <>
              <InfoItem label="의사명" value={contract.doctorName} />
              <InfoItem label="의사 이메일" value={contract.doctorEmail} />
              <InfoItem label="병원명" value={contract.hospitalContract?.hospitalName} />
              <InfoItem label="세전 급여" value={contract.wageGross ? Number(contract.wageGross).toLocaleString() + '원' : '-'} />
              <InfoItem label="세후 급여" value={contract.wageNet ? Number(contract.wageNet).toLocaleString() + '원' : '-'} />
              <InfoItem label="근무시간" value={`${contract.startTime || ''} ~ ${contract.endTime || ''}`} />
            </>
          ) : (
            <>
              <InfoItem label="직원명" value={contract.employeeName} />
              <InfoItem label="직원 이메일" value={contract.employeeEmail} />
              <InfoItem label="병원명" value={contract.hospitalContract?.hospitalName} />
              <InfoItem label="연봉" value={contract.annualSalaryTotal ? Number(contract.annualSalaryTotal).toLocaleString() + '원' : '-'} />
              <InfoItem label="월급" value={contract.monthlyTotal ? Number(contract.monthlyTotal).toLocaleString() + '원' : '-'} />
              <InfoItem label="계약기간" value={`${contract.workContractStartDate ? new Date(contract.workContractStartDate).toLocaleDateString('ko-KR') : ''} ~ ${contract.workContractEndDate ? new Date(contract.workContractEndDate).toLocaleDateString('ko-KR') : ''}`} />
            </>
          )}
          <InfoItem label="생성일" value={formatDate(contract.createdAt)} />
          <InfoItem label="발송일" value={contract.sentAt ? formatDate(contract.sentAt) : '-'} />
          <InfoItem label="서명일" value={contract.signedAt ? formatDate(contract.signedAt) : '-'} />
          {contract.rejectionReason && <InfoItem label="거부사유" value={contract.rejectionReason} span2 />}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, span2 }: { label: string; value: any; span2?: boolean }) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm text-gray-900">{value || '-'}</p>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-3 border-slate-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Empty() {
  return <div className="h-full flex items-center justify-center text-gray-400 py-8">데이터 없음</div>;
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-red-500">{message}</p>
    </div>
  );
}

function formatDate(d: string) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}
