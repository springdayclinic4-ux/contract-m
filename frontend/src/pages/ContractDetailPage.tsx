import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contractAPI } from '../lib/api';
import DailyContractTemplate from '../components/DailyContractTemplate';
import RegularContractTemplate from '../components/RegularContractTemplate';

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadContract();
    }
  }, [id]);

  const loadContract = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await contractAPI.getDetail(id!);
      
      if (data.success) {
        setContract(data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '계약서를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!confirm('이 계약서를 발송하시겠습니까?')) {
      return;
    }

    try {
      const { data } = await contractAPI.send(id!);
      
      if (data.success) {
        alert('계약서가 발송되었습니다.');
        loadContract();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || '발송에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { data } = await contractAPI.delete(id!);
      
      if (data.success) {
        alert('계약서가 삭제되었습니다.');
        navigate('/contracts');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-center py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error || '계약서를 찾을 수 없습니다.'}
          </div>
          <button
            onClick={() => navigate('/contracts')}
            className="btn-outline"
          >
            목록으로
          </button>
        </div>
      </div>
    );
  }

  const isDaily = contract.type === 'daily';
  const statusText = getStatusText(contract.status);
  const statusColor = getStatusColor(contract.status);

  // 계약서 템플릿에 전달할 데이터 변환
  const contractData = isDaily ? {
    contractNumber: contract.contractNumber,
    hospitalName: '병원명', // TODO: 실제 병원명 가져오기
    doctorName: contract.doctorName,
    doctorLicenseNumber: contract.doctorLicenseNumber,
    doctorAddress: contract.doctorAddress,
    doctorPhone: contract.doctorPhone,
    workDates: contract.workDates?.map((d: string) => new Date(d).toLocaleDateString('ko-KR')),
    startTime: contract.startTime,
    endTime: contract.endTime,
    breakTime: contract.breakTime,
    wageGross: contract.wageGross,
    wageNet: contract.wageNet,
    wageType: contract.wageType,
    specialConditions: contract.specialConditions,
    createdAt: contract.createdAt,
  } : {
    contractNumber: contract.contractNumber,
    hospitalName: '병원명', // TODO: 실제 병원명 가져오기
    employeeName: contract.employeeName,
    employeeBirthDate: contract.employeeBirthDate,
    employeeAddress: contract.employeeAddress,
    employeePhone: contract.employeePhone,
    employeeBankName: contract.employeeBankName,
    employeeAccountNumber: contract.employeeAccountNumber,
    startDate: contract.startDate ? new Date(contract.startDate).toLocaleDateString('ko-KR') : '',
    endDate: contract.endDate ? new Date(contract.endDate).toLocaleDateString('ko-KR') : '',
    workLocation: contract.workLocation,
    workDetails: contract.workDetails,
    workHoursStart: contract.workHoursStart,
    workHoursEnd: contract.workHoursEnd,
    breakHoursStart: contract.breakHoursStart,
    breakHoursEnd: contract.breakHoursEnd,
    weeklyHolidays: contract.weeklyHolidays,
    salary: contract.salary,
    salaryType: contract.salaryType,
    paymentDate: contract.paymentDate,
    paymentMethod: contract.paymentMethod,
    specialConditions: contract.specialConditions,
    createdAt: contract.createdAt,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 - 출력 시 숨김 */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isDaily ? '일용직 근로계약서' : '일반 근로계약서'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                계약서 번호: {contract.contractNumber}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColor}`}>
                {statusText}
              </span>
              <button
                onClick={() => navigate('/contracts')}
                className="btn-outline"
              >
                목록으로
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 계약서 본문 */}
      <div className="max-w-5xl mx-auto py-8 px-4 print:p-0">
        <div className="bg-white rounded-lg shadow-lg mb-6 print:shadow-none print:rounded-none">
          {/* 실제 계약서 양식 */}
          {isDaily ? (
            <DailyContractTemplate data={contractData} />
          ) : (
            <RegularContractTemplate data={contractData} />
          )}
        </div>

        {/* 액션 버튼 - 출력 시 숨김 */}
        <div className="flex gap-3 justify-center print:hidden">
          {contract.status === 'draft' && (
            <>
              <button
                onClick={handleSend}
                className="btn-primary px-6"
              >
                발송하기
              </button>
              <button
                onClick={() => navigate(`/contracts/${isDaily ? 'daily' : 'regular'}/edit/${id}`)}
                className="btn-outline px-6"
              >
                수정하기
              </button>
            </>
          )}
          <button
            onClick={handlePrint}
            className="btn-primary px-6"
          >
            인쇄 / PDF 저장
          </button>
          <button
            onClick={handleDelete}
            className="btn-outline text-red-600 border-red-600 hover:bg-red-50 px-6"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'draft': '초안',
    'sent': '발송됨',
    'pending': '대기중',
    'signed': '서명완료',
    'rejected': '거부됨',
    'cancelled': '취소됨'
  };
  return statusMap[status] || status;
}

function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'draft': 'bg-gray-100 text-gray-800',
    'sent': 'bg-blue-100 text-blue-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'signed': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'cancelled': 'bg-gray-100 text-gray-600'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}
