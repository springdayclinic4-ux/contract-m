import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contractAPI } from '../lib/api';
import DailyContractTemplate from '../components/DailyContractTemplate';

export default function ContractInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contract, setContract] = useState<any>(null);
  const [mode, setMode] = useState<'view' | 'sign' | 'reject'>('view');
  const [rejectionReason, setRejectionReason] = useState('');
  const [signing, setSigning] = useState(false);

  // 서명 캔버스
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (token) {
      loadContract();
    }
  }, [token]);

  // 캔버스 크기를 컨테이너에 맞춤 (좌표 불일치 해결)
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
    if (mode === 'sign') {
      setTimeout(resizeCanvas, 50);
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [mode, resizeCanvas]);

  const loadContract = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await contractAPI.getByInvitation(token!);

      if (data.success) {
        setContract(data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '계약서를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!canvasRef.current) return;

    setSigning(true);
    try {
      const signatureDataUrl = canvasRef.current.toDataURL('image/png');

      const { data } = await contractAPI.sign(token!, signatureDataUrl);

      if (data.success) {
        alert('계약서에 서명되었습니다.');
        loadContract();
        setMode('view');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || '서명에 실패했습니다.');
    } finally {
      setSigning(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('거부 사유를 입력해주세요.');
      return;
    }

    setSigning(true);
    try {
      const { data } = await contractAPI.reject(token!, rejectionReason);

      if (data.success) {
        alert('계약서가 거부되었습니다.');
        loadContract();
        setMode('view');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || '거부 처리에 실패했습니다.');
    } finally {
      setSigning(false);
    }
  };

  // 좌표 계산 (DPR 보정)
  const getPos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // 마우스 이벤트
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

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // 터치 이벤트
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md">
          <h2 className="text-xl font-bold text-red-700 mb-4">오류</h2>
          <p className="text-gray-700 mb-6">{error || '계약서를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary w-full"
          >
            로그인 페이지로
          </button>
        </div>
      </div>
    );
  }

  const isDaily = contract.type === 'daily';
  const canSign = contract.status === 'sent' || contract.status === 'pending';

  // 계약서 템플릿 데이터 구성
  const templateData = isDaily ? {
    contractNumber: contract.contractNumber,
    hospitalName: contract.hospitalName,
    hospitalAddress: contract.hospitalAddress,
    directorName: contract.directorName,
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
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isDaily ? '일용직 근로계약서' : '일반 근로계약서'}
            </h1>
            <p className="text-gray-600">계약서 번호: {contract.contractNumber}</p>
            {contract.status === 'signed' && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg inline-block">
                서명 완료
              </div>
            )}
            {contract.status === 'rejected' && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg inline-block">
                거부됨: {contract.rejectionReason}
              </div>
            )}
          </div>

          {/* 계약서 본문 */}
          {isDaily && templateData && (
            <div className="border rounded-lg mb-8">
              <DailyContractTemplate data={templateData} />
            </div>
          )}

          {!isDaily && (
            <div className="space-y-6 mb-8 p-6 bg-gray-50 rounded-lg">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">직원 정보</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">성명</label>
                    <p className="text-gray-900 font-medium">{contract.employeeName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">이메일</label>
                    <p className="text-gray-900">{contract.employeeEmail}</p>
                  </div>
                </div>
              </div>
              {contract.monthlyTotal && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">급여 정보</h2>
                  <p className="text-gray-900 font-semibold text-xl">
                    {Number(contract.monthlyTotal).toLocaleString()}원
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 서명 이미지 표시 (이미 서명된 경우) */}
          {contract.signatureImageUrl && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-3">서명 이미지</h3>
              <div className="bg-white border rounded p-4 inline-block">
                <img src={contract.signatureImageUrl} alt="서명" className="max-h-24" />
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          {mode === 'view' && canSign && (
            <div className="flex gap-3">
              <button
                onClick={() => setMode('sign')}
                className="btn-primary flex-1"
              >
                서명하기
              </button>
              <button
                onClick={() => setMode('reject')}
                className="btn-outline flex-1 text-red-600 border-red-600 hover:bg-red-50"
              >
                거부하기
              </button>
            </div>
          )}

          {/* 서명 모드 */}
          {mode === 'sign' && (
            <div className="space-y-4">
              <div ref={containerRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">서명을 그려주세요</label>
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
              <div className="flex gap-3">
                <button
                  onClick={handleSign}
                  className="btn-primary flex-1"
                  disabled={signing}
                >
                  {signing ? '처리 중...' : '서명 완료'}
                </button>
                <button
                  onClick={() => setMode('view')}
                  className="btn-outline flex-1"
                  disabled={signing}
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* 거부 모드 */}
          {mode === 'reject' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">거부 사유 *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="계약서를 거부하는 사유를 입력해주세요."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
                  disabled={signing}
                >
                  {signing ? '처리 중...' : '거부하기'}
                </button>
                <button
                  onClick={() => {
                    setMode('view');
                    setRejectionReason('');
                  }}
                  className="btn-outline flex-1"
                  disabled={signing}
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {!canSign && contract.status !== 'signed' && contract.status !== 'rejected' && (
            <div className="text-center text-gray-600">
              이 계약서는 현재 서명할 수 없는 상태입니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
