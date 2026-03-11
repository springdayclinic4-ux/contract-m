import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { statisticsAPI } from '../lib/api';

const STATUS_LABELS: Record<string, string> = {
  draft: '초안',
  sent: '발송',
  pending: '대기',
  signed: '서명완료',
  rejected: '거부',
  cancelled: '취소',
};

export default function StatisticsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statistics, setStatistics] = useState<any>(null);
  const [userType, setUserType] = useState<string>('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setUserType(parsed.type);
      } catch {}
    }
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await statisticsAPI.getMy();
      if (data.success) {
        const raw = data.data;
        // snake_case → camelCase 변환 + 프론트엔드 구조에 맞게 통합
        const allContracts = [
          ...(raw.daily_contracts || []).map((c: any) => ({
            id: c.id,
            contractNumber: c.contract_number,
            doctorName: c.doctor_name,
            doctorEmail: c.doctor_email,
            hospitalName: c.hospital_name,
            wageGross: c.wage_gross,
            wageNet: c.wage_net,
            workDates: c.work_dates,
            status: c.status,
            createdAt: c.created_at,
            signedAt: c.signed_at,
          })),
          ...(raw.labor_contracts || []).map((c: any) => ({
            id: c.id,
            contractNumber: c.contract_number,
            hospitalName: c.hospital_name,
            wageGross: c.annual_salary_total || c.monthly_total,
            wageNet: c.monthly_total,
            workDates: c.work_contract_start_date ? [c.work_contract_start_date] : [],
            status: c.status,
            createdAt: c.created_at,
            signedAt: c.signed_at,
          })),
        ];

        const summary: any = {
          totalContracts: raw.summary?.total_contracts ?? 0,
        };

        if (raw.user_type === 'hospital') {
          summary.totalGross = raw.summary?.daily_contracts?.total_wage_gross ?? 0;
          summary.totalNet = raw.summary?.daily_contracts?.total_wage_net ?? 0;
          summary.byStatus = raw.summary?.daily_contracts?.by_status ?? {};
        } else {
          summary.totalGross = raw.summary?.daily_contracts?.total_earnings_gross ?? 0;
          summary.totalNet = raw.summary?.daily_contracts?.total_earnings_net ?? 0;
          summary.byStatus = raw.summary?.daily_contracts?.by_status ?? {};
        }

        setStatistics({ summary, contracts: allContracts });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '통계를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!statistics?.contracts?.length) return;

    const BOM = '\uFEFF';
    let headers: string[];
    let rows: string[][];

    if (userType === 'hospital') {
      headers = ['의사명', '이메일', '일급(세전)', '일급(세후)', '근무일', '상태', '생성일', '서명일'];
      rows = statistics.contracts.map((c: any) => [
        c.doctorName || '',
        c.doctorEmail || '',
        c.wageGross ? String(c.wageGross) : '',
        c.wageNet ? String(c.wageNet) : '',
        Array.isArray(c.workDates) ? c.workDates.join(', ') : (c.workDates || ''),
        STATUS_LABELS[c.status] || c.status || '',
        c.createdAt ? new Date(c.createdAt).toLocaleDateString('ko-KR') : '',
        c.signedAt ? new Date(c.signedAt).toLocaleDateString('ko-KR') : '',
      ]);
    } else {
      headers = ['병원명', '일급(세전)', '일급(세후)', '근무일', '상태', '서명일'];
      rows = statistics.contracts.map((c: any) => [
        c.hospitalName || '',
        c.wageGross ? String(c.wageGross) : '',
        c.wageNet ? String(c.wageNet) : '',
        Array.isArray(c.workDates) ? c.workDates.join(', ') : (c.workDates || ''),
        STATUS_LABELS[c.status] || c.status || '',
        c.signedAt ? new Date(c.signedAt).toLocaleDateString('ko-KR') : '',
      ]);
    }

    const escapeCSV = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    };

    const csv = BOM + [headers.join(','), ...rows.map(r => r.map(escapeCSV).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `계약서_통계_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600">통계 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
          <button onClick={() => navigate('/dashboard')} className="btn-outline">대시보드로 돌아가기</button>
        </div>
      </div>
    );
  }

  const summary = statistics?.summary;
  const contracts = statistics?.contracts || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {userType === 'hospital' ? '병원 계약 통계' : '내 계약 통계'}
          </h1>
          <div className="flex items-center gap-3">
            {contracts.length > 0 && (
              <button
                onClick={downloadCSV}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                엑셀 내보내기
              </button>
            )}
            <button onClick={() => navigate('/dashboard')} className="btn-outline">대시보드</button>
          </div>
        </div>

        {/* Summary Cards */}
        {userType === 'hospital' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="전체 계약서" value={`${summary?.totalContracts ?? 0}건`} />
            <StatCard label="총 급여 지급액 (세전)" value={`${(summary?.totalGross ?? 0).toLocaleString()}원`} />
            <StatCard label="서명 완료" value={`${summary?.byStatus?.signed ?? 0}건`} accent="text-green-600" />
            <StatCard label="대기 / 발송" value={`${(summary?.byStatus?.pending ?? 0) + (summary?.byStatus?.sent ?? 0)}건`} accent="text-orange-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard label="총 계약 건수" value={`${summary?.totalContracts ?? 0}건`} />
            <StatCard label="총 수입 (세전)" value={`${(summary?.totalGross ?? 0).toLocaleString()}원`} />
            <StatCard label="총 수입 (세후)" value={`${(summary?.totalNet ?? 0).toLocaleString()}원`} accent="text-indigo-600" />
          </div>
        )}

        {/* Contracts Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">계약서 목록 ({contracts.length}건)</h2>
          </div>

          {contracts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">계약서가 없습니다.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {userType === 'hospital' ? (
                      <>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">의사명</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">이메일</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">일급(세전)</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">일급(세후)</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">근무일</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-600">상태</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">생성일</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">서명일</th>
                      </>
                    ) : (
                      <>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">병원명</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">일급(세전)</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600">일급(세후)</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">근무일</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-600">상태</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600">서명일</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c: any) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      {userType === 'hospital' ? (
                        <>
                          <td className="py-3 px-4 text-gray-900 font-medium">{c.doctorName || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{c.doctorEmail || '-'}</td>
                          <td className="py-3 px-4 text-right text-gray-900">
                            {c.wageGross ? Number(c.wageGross).toLocaleString() + '원' : '-'}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900">
                            {c.wageNet ? Number(c.wageNet).toLocaleString() + '원' : '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs">
                            {formatWorkDates(c.workDates)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString('ko-KR') : '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {c.signedAt ? new Date(c.signedAt).toLocaleDateString('ko-KR') : '-'}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4 text-gray-900 font-medium">{c.hospitalName || '-'}</td>
                          <td className="py-3 px-4 text-right text-gray-900">
                            {c.wageGross ? Number(c.wageGross).toLocaleString() + '원' : '-'}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900">
                            {c.wageNet ? Number(c.wageNet).toLocaleString() + '원' : '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs">
                            {formatWorkDates(c.workDates)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {c.signedAt ? new Date(c.signedAt).toLocaleDateString('ko-KR') : '-'}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${accent || 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    pending: 'bg-orange-100 text-orange-700',
    signed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function formatWorkDates(workDates: any): string {
  if (!workDates) return '-';
  if (Array.isArray(workDates)) {
    if (workDates.length === 0) return '-';
    if (workDates.length <= 3) return workDates.join(', ');
    return `${workDates[0]} 외 ${workDates.length - 1}일`;
  }
  return String(workDates);
}
