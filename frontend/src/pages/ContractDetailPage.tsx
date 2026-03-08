import { useEffect, useState, useRef, useCallback } from 'react';
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
  const [showSignPad, setShowSignPad] = useState(false);
  const [signing, setSigning] = useState(false);

  // 서명 캔버스
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (id) {
      loadContract();
    }
  }, [id]);

  // 캔버스 크기를 컨테이너에 맞춤
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = 200 * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = '200px';

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000';
    }
  }, []);

  useEffect(() => {
    if (showSignPad) {
      setTimeout(resizeCanvas, 50);
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [showSignPad, resizeCanvas]);

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
    if (!confirm('이 계약서를 발송하시겠습니까?')) return;

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
    if (!confirm('정말 삭제하시겠습니까?')) return;

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

  // 병원 서명 저장
  const handleHospitalSign = async () => {
    if (!canvasRef.current) return;
    setSigning(true);
    try {
      const signatureDataUrl = canvasRef.current.toDataURL('image/png');
      const { data } = await contractAPI.hospitalSign(id!, signatureDataUrl);
      if (data.success) {
        alert('병원 서명이 완료되었습니다.');
        setShowSignPad(false);
        loadContract();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || '서명에 실패했습니다.');
    } finally {
      setSigning(false);
    }
  };

  const handlePrint = () => window.print();

  // 좌표 계산
  const getPos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e.clientX, e.clientY);
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e.clientX, e.clientY);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const touch = e.touches[0];
    const { x, y } = getPos(touch.clientX, touch.clientY);
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const touch = e.touches[0];
    const { x, y } = getPos(touch.clientX, touch.clientY);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
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
        <div className="max-w-5xl mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error || '계약서를 찾을 수 없습니다.'}
          </div>
          <button onClick={() => navigate('/contracts')} className="btn-outline">
            목록으로
          </button>
        </div>
      </div>
    );
  }

  const isDaily = contract.type === 'daily';
  const statusText = getStatusText(contract.status);
  const statusColor = getStatusColor(contract.status);

  const dailyContractData = isDaily ? {
    contractNumber: contract.contractNumber,
    hospitalName: contract.hospitalName || '',
    hospitalAddress: contract.hospitalAddress || '',
    directorName: contract.directorName || '',
    doctorName: contract.doctorName,
    doctorLicenseNumber: contract.doctorLicenseNumber,
    doctorAddress: contract.doctorAddress,
    doctorPhone: contract.doctorPhone,
    doctorRegistrationNumber: contract.doctorRegistrationNumber,
    workDates: contract.workDates,
    startTime: contract.startTime,
    endTime: contract.endTime,
    breakTime: contract.breakTime,
    wageGross: contract.wageGross,
    wageNet: contract.wageNet,
    wageType: contract.wageType,
    bankName: contract.doctorBankName,
    accountNumber: contract.doctorAccountNumber,
    specialConditions: contract.specialConditions,
    createdAt: contract.createdAt,
    signatureImageUrl: contract.signatureImageUrl,
    hospitalSignatureUrl: contract.hospitalSignatureUrl,
    taxMethod: contract.taxMethod || 'business',
    includeSecurityPledge: contract.includeSecurityPledge !== false,
    includePayStub: contract.includePayStub !== false,
    includeCrimeCheck: contract.includeCrimeCheck !== false,
  } : null;

  const regularContractData = !isDaily ? {
    contractNumber: contract.contractNumber,
    hospitalName: contract.hospitalName || '',
    directorName: contract.directorName || '',
    hospitalAddress: contract.hospitalAddress || '',
    employeeName: contract.employeeName,
    employeeBirthDate: contract.employeeBirthDate,
    employeeAddress: contract.employeeAddress,
    employeePhone: contract.employeePhone,
    employeeResidentNumber: contract.employeeResidentNumber,
    contractType: contract.contractType,
    workContractStartDate: contract.workContractStartDate ? new Date(contract.workContractStartDate).toLocaleDateString('ko-KR') : '',
    workContractEndDate: contract.workContractEndDate ? new Date(contract.workContractEndDate).toLocaleDateString('ko-KR') : '',
    salaryContractStartDate: contract.salaryContractStartDate ? new Date(contract.salaryContractStartDate).toLocaleDateString('ko-KR') : '',
    salaryContractEndDate: contract.salaryContractEndDate ? new Date(contract.salaryContractEndDate).toLocaleDateString('ko-KR') : '',
    probationPeriod: contract.probationPeriod,
    probationSalaryRate: contract.probationSalaryRate,
    annualSalaryTotal: contract.annualSalaryTotal?.toString(),
    baseSalary: contract.baseSalary?.toString(),
    mealAllowance: contract.mealAllowance?.toString(),
    monthlyBaseSalary: contract.monthlyBaseSalary?.toString(),
    monthlyMealAllowance: contract.monthlyMealAllowance?.toString(),
    hourlyWage: contract.regularHourlyWage?.toString(),
    monthlyWorkHours: contract.monthlyBaseHours?.toString(),
    workDetails: contract.workContent,
    workHoursPerDay: contract.workHoursPerDay,
    workHoursPerWeek: contract.workHoursPerWeek,
    workStartTime: contract.workStartTime,
    workEndTime: contract.workEndTime,
    breakTime: contract.breakTime,
    weeklyHolidays: contract.workDaysPerWeek,
    salaryPaymentDay: contract.payDate,
    specialConditions: contract.specialConditions,
    createdAt: contract.createdAt,
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isDaily ? (contract.taxMethod === 'business' ? '프리랜서 계약서' : '일용직 근로계약서') : '일반 근로계약서'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                계약서 번호: {contract.contractNumber}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColor}`}>
                {statusText}
              </span>
              {contract.hospitalSignatureUrl ? (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  병원 서명 완료
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">
                  병원 미서명
                </span>
              )}
              {contract.signatureImageUrl ? (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  의사 서명 완료
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">
                  의사 미서명
                </span>
              )}
              <button onClick={() => navigate('/contracts')} className="btn-outline">
                목록으로
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 계약서 본문 */}
      <div className="max-w-5xl mx-auto py-8 px-4 print:p-0 flex flex-col items-center">
        <div id="print-area" className="print-area bg-white shadow-lg mb-6 print:shadow-none" style={{ width: '210mm', maxWidth: '100%' }}>
          {isDaily && dailyContractData ? (
            <DailyContractTemplate data={dailyContractData} />
          ) : regularContractData ? (
            <RegularContractTemplate data={regularContractData} />
          ) : null}
        </div>

        {/* 병원 서명 패드 */}
        {showSignPad && (
          <div className="bg-white rounded-lg shadow-lg mb-6 p-6 print:hidden">
            <h3 className="text-lg font-bold mb-4">병원(갑) 서명</h3>
            <div ref={containerRef}>
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  className="w-full cursor-crosshair touch-none"
                  style={{ height: '200px' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawingTouch}
                  onTouchMove={drawTouch}
                  onTouchEnd={stopDrawingTouch}
                />
              </div>
              <button
                type="button"
                onClick={clearCanvas}
                className="mt-2 text-sm text-gray-600 hover:text-gray-900"
              >
                다시 그리기
              </button>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleHospitalSign}
                className="btn-primary flex-1"
                disabled={signing}
              >
                {signing ? '처리 중...' : '서명 완료'}
              </button>
              <button
                onClick={() => setShowSignPad(false)}
                className="btn-outline flex-1"
                disabled={signing}
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-3 justify-center print:hidden flex-wrap">
          {/* 병원 서명 버튼 */}
          {!contract.hospitalSignatureUrl && (
            <button
              onClick={() => setShowSignPad(true)}
              className="btn-primary px-6 bg-indigo-600 hover:bg-indigo-700"
            >
              병원(갑) 서명하기
            </button>
          )}
          {contract.hospitalSignatureUrl && (
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              병원(갑) 서명 완료
            </span>
          )}
          {contract.signatureImageUrl ? (
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              의사(을) 서명 완료
            </span>
          ) : (
            <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
              의사 서명 대기중
            </span>
          )}
          {contract.status === 'draft' && (
            <>
              <button onClick={handleSend} className="btn-primary px-6">
                발송하기
              </button>
            </>
          )}
          <button onClick={handlePrint} className="btn-primary px-6">
            인쇄 / PDF 저장
          </button>
          {!contract.hospitalSignatureUrl && !contract.signatureImageUrl && contract.status !== 'signed' && (
            <button
              onClick={handleDelete}
              className="btn-outline text-red-600 border-red-600 hover:bg-red-50 px-6"
            >
              삭제
            </button>
          )}
          {(contract.hospitalSignatureUrl || contract.signatureImageUrl || contract.status === 'signed') && (
            <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-full text-sm font-semibold">
              서명 진행됨 (삭제 불가)
            </span>
          )}
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
