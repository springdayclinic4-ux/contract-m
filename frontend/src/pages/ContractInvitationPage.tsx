import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { contractAPI, authAPI } from '../lib/api';
import CompleteDailyContractTemplate from '../components/CompleteDailyContractTemplate';

export default function ContractInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const fromDashboard = searchParams.get('from') === 'dashboard';
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contract, setContract] = useState<any>(null);
  const [mode, setMode] = useState<'view' | 'sign' | 'reject'>('view');
  const [rejectionReason, setRejectionReason] = useState('');
  const [signing, setSigning] = useState(false);

  // 로그인 상태 확인
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginMode, setLoginMode] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // 개인정보 삭제
  const [deletingInfo, setDeletingInfo] = useState(false);
  const [showDeletedModal, setShowDeletedModal] = useState(false);

  // 서명 캔버스
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // 로그인한 의사 이메일
  const [loggedInEmail, setLoggedInEmail] = useState('');
  const [emailMismatch, setEmailMismatch] = useState(false);

  // 로그인 상태 체크 - 이미 로그인 상태 + 대시보드에서 온 게 아니면 대시보드로 이동
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (accessToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.type === 'doctor') {
          if (!fromDashboard) {
            // 이메일 링크로 직접 접근한 경우 → 대시보드에서 계약서 확인 후 서명하도록 유도
            navigate('/dashboard');
            return;
          }
          setIsLoggedIn(true);
          setLoggedInEmail(user.email || '');
        }
      } catch {}
    }
  }, [fromDashboard, navigate]);

  useEffect(() => {
    if (token) {
      loadContract();
    }
  }, [token]);

  // 로그인 이메일과 계약서 이메일 불일치 체크
  useEffect(() => {
    if (isLoggedIn && loggedInEmail && contract?.doctorEmail) {
      setEmailMismatch(loggedInEmail !== contract.doctorEmail);
    }
  }, [isLoggedIn, loggedInEmail, contract]);

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

  // 의사 로그인 처리
  const handleDoctorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const { data } = await authAPI.login(loginEmail, loginPassword, 'doctor');
      const payload = data?.data;

      if (data?.success && payload?.accessToken && payload?.user) {
        localStorage.setItem('accessToken', payload.accessToken);
        localStorage.setItem('user', JSON.stringify(payload.user));
        // 로그인 성공 → 대시보드로 이동하여 계약서 확인 후 서명하도록 유도
        navigate('/dashboard');
      } else {
        setLoginError(data?.message || '로그인에 실패했습니다.');
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.message || '로그인에 실패했습니다. 의사 계정으로 가입되어 있는지 확인해주세요.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSign = async () => {
    if (!canvasRef.current) return;

    // 로그인 확인
    if (!isLoggedIn) {
      setLoginMode(true);
      setMode('view');
      return;
    }

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

  // 계약서 템플릿 데이터 구성 (CompleteDailyContractTemplate은 snake_case props 사용)
  const templateData = isDaily ? {
    hospital_name: contract.hospitalName,
    director_name: contract.directorName,
    hospital_address: contract.hospitalAddress,
    doctor_name: contract.doctorName,
    doctor_registration_number: contract.doctorRegistrationNumber,
    doctor_phone: contract.doctorPhone,
    doctor_license_number: contract.doctorLicenseNumber,
    doctor_address: contract.doctorAddress,
    bank_name: contract.doctorBankName,
    account_number: contract.doctorAccountNumber,
    workDates: contract.workDates,
    start_time: contract.startTime,
    end_time: contract.endTime,
    break_time: contract.breakTime,
    wage_gross: contract.wageGross,
    wage_net: contract.wageNet,
    wage_type: contract.wageType,
    tax_method: contract.taxMethod || 'business',
    payment_date: contract.paymentDate || 'same_day',
    special_conditions: contract.specialConditions,
    include_security_pledge: contract.includeSecurityPledge !== false,
    include_pay_stub: contract.includePayStub !== false,
    include_crime_check: contract.includeCrimeCheck !== false,
    signature_image_url: contract.signatureImageUrl,
    hospital_signature_url: contract.hospitalSignatureUrl,
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isDaily ? (contract.taxMethod === 'business' ? '프리랜서 계약서' : '일용직 근로계약서') : '일반 근로계약서'}
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

          {/* 로그인 필요 안내 */}
          {!isLoggedIn && canSign && (
            <div className="mb-6 p-5 bg-amber-50 border-2 border-amber-300 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="font-bold text-amber-800 mb-1">의사 계정 로그인이 필요합니다</h3>
                  <p className="text-sm text-amber-700 mb-3">
                    계약서 확인 및 서명을 위해서는 의사 계정으로 로그인해야 합니다.
                    로그인하시면 대시보드에서 계약서를 확인하고 서명할 수 있습니다.
                    계정이 없으시면 먼저 회원가입을 해주세요.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLoginMode(true)}
                      className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors"
                    >
                      의사 로그인
                    </button>
                    <Link
                      to="/register?type=doctor"
                      className="bg-white text-amber-700 border border-amber-400 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-50 transition-colors"
                    >
                      회원가입
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 의사 로그인 폼 (인라인) */}
          {loginMode && !isLoggedIn && (
            <div className="mb-6 p-6 bg-white border-2 border-indigo-200 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">의사 계정 로그인</h3>
              <form onSubmit={handleDoctorLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="input-field"
                    placeholder="doctor@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="input-field"
                    placeholder="비밀번호"
                    required
                  />
                </div>
                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {loginError}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={loginLoading}
                  >
                    {loginLoading ? '로그인 중...' : '로그인'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginMode(false); setLoginError(''); }}
                    className="btn-outline flex-1"
                  >
                    취소
                  </button>
                </div>
                <p className="text-center text-sm text-gray-600">
                  계정이 없으신가요?{' '}
                  <Link
                    to="/register?type=doctor"
                    className="text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    회원가입
                  </Link>
                </p>
              </form>
            </div>
          )}

          {/* 로그인 완료 표시 */}
          {isLoggedIn && canSign && !emailMismatch && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-green-800 font-medium">의사 계정으로 로그인되었습니다. ({loggedInEmail}) 서명이 가능합니다.</span>
            </div>
          )}

          {/* 이메일 불일치 경고 */}
          {isLoggedIn && canSign && emailMismatch && (
            <div className="mb-6 p-5 bg-red-50 border-2 border-red-300 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h3 className="font-bold text-red-800 mb-1">이메일이 일치하지 않습니다</h3>
                  <p className="text-sm text-red-700 mb-2">
                    현재 로그인된 계정: <strong>{loggedInEmail}</strong>
                  </p>
                  <p className="text-sm text-red-700 mb-3">
                    계약서 초대 이메일: <strong>{contract.doctorEmail}</strong>
                  </p>
                  <p className="text-sm text-red-700 mb-3">
                    초대받은 이메일 계정으로 다시 로그인해주세요.
                  </p>
                  <button
                    onClick={() => {
                      localStorage.removeItem('accessToken');
                      localStorage.removeItem('user');
                      setIsLoggedIn(false);
                      setLoggedInEmail('');
                      setEmailMismatch(false);
                      setLoginMode(true);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    다른 계정으로 로그인
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 계약서 본문 */}
          {isDaily && templateData && (
            <div className="border rounded-lg mb-8">
              <CompleteDailyContractTemplate data={templateData} />
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

          {/* 인쇄 버튼 */}
          {isLoggedIn && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors print:hidden"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                인쇄하기
              </button>
            </div>
          )}

          {/* 액션 버튼 - 대시보드에서 진입 + 로그인 + 이메일 일치 시 서명/거부 가능 */}
          {mode === 'view' && canSign && isLoggedIn && !emailMismatch && (
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
          {mode === 'sign' && isLoggedIn && !emailMismatch && (
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
          {mode === 'reject' && isLoggedIn && !emailMismatch && (
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

          {/* 개인정보 삭제 버튼 - 서명/거부 완료 후 의사만 */}
          {isLoggedIn && (contract.status === 'signed' || contract.status === 'rejected') && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-orange-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-bold text-orange-800 mb-1">개인정보 삭제</h3>
                    <p className="text-sm text-orange-700 mb-3">
                      계약서에 포함된 주민등록번호, 계좌번호, 연락처 등 민감한 개인정보를 서버에서 완전히 삭제합니다.
                      삭제된 정보는 복구할 수 없습니다.
                    </p>
                    <button
                      onClick={async () => {
                        if (!confirm('정말로 개인정보를 삭제하시겠습니까?\n삭제된 정보는 복구할 수 없습니다.')) return;
                        setDeletingInfo(true);
                        try {
                          const { data } = await contractAPI.deletePersonalInfo(token!);
                          if (data.success) {
                            setShowDeletedModal(true);
                            loadContract();
                          }
                        } catch (err: any) {
                          alert(err.response?.data?.message || '개인정보 삭제에 실패했습니다.');
                        } finally {
                          setDeletingInfo(false);
                        }
                      }}
                      disabled={deletingInfo}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingInfo ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          삭제 중...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          개인정보 삭제하기
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 개인정보 삭제 완료 모달 */}
      {showDeletedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">삭제 완료</h2>
            <p className="text-gray-600 mb-2">
              계약서에 포함된 개인정보가 서버에서 완전히 삭제되었습니다.
            </p>
            <ul className="text-sm text-gray-500 mb-6 space-y-1">
              <li>- 주민등록번호</li>
              <li>- 계좌번호 / 은행명</li>
              <li>- 연락처</li>
            </ul>
            <p className="text-xs text-gray-400 mb-6">삭제된 정보는 복구할 수 없으며, 어디에도 보관되지 않습니다.</p>
            <button
              onClick={() => setShowDeletedModal(false)}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
