import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractAPI, userAPI } from '../lib/api';
import CompleteDailyContractTemplate from '../components/CompleteDailyContractTemplate';

export default function DailyContractPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [workDates, setWorkDates] = useState<string[]>([]);
  const [dateInput, setDateInput] = useState('');

  const [manualWage, setManualWage] = useState(false);

  const [formData, setFormData] = useState({
    // 병원 정보
    hospital_name: '',
    director_name: '',
    hospital_address: '',

    // 의사 정보
    doctor_name: '',
    doctor_email: '',
    doctor_registration_number: '',
    doctor_phone: '',
    doctor_license_number: '',
    doctor_address: '',
    bank_name: '',
    account_number: '',

    // 근무 조건
    start_time: '09:00',
    end_time: '18:00',
    break_time: '13:00 ~ 14:00 (1시간)',

    // 급여
    wage_gross: '',
    wage_net: '',
    wage_type: 'net' as 'gross' | 'net',
    tax_method: 'daily' as 'business' | 'daily',
    special_conditions: '',

    // 부가 서류
    include_security_pledge: true,
    include_pay_stub: false,
    include_crime_check: false,
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await userAPI.getUserProfile();
        console.log('🔍 User API Response:', response.data);
        const user = response.data.data;
        console.log('👤 User Data:', user);
        
        // 병원이 아니면 접근 불가
        if (user.type !== 'hospital') {
          alert('❌ 계약서 작성은 병원 계정만 가능합니다.');
          navigate('/dashboard');
          return;
        }
        
        if (user.type === 'hospital') {
          // 병원 정보 자동 채우기
          console.log('🏥 Hospital Info:', {
            hospitalName: user.hospitalName,
            directorName: user.directorName,
            hospitalAddress: user.hospitalAddress
          });
          
          setFormData(prev => ({
            ...prev,
            hospital_name: user.hospitalName || '',
            director_name: user.directorName || '',
            hospital_address: user.hospitalAddress || '',
          }));
          setHospitalName(user.hospitalName || '');
          
          // 정보가 비어있으면 경고
          if (!user.directorName || !user.hospitalAddress) {
            alert('⚠️ 회원 정보가 완전하지 않습니다.\n설정 페이지에서 대표자명과 병원 주소를 입력해주세요.');
          }
        }
      } catch (err) {
        console.error('❌ Failed to fetch user info:', err);
        // localStorage fallback
        const savedUser = localStorage.getItem('user');
        if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
          try {
            const user = JSON.parse(savedUser);
            if (user.type === 'hospital') {
              setFormData(prev => ({
                ...prev,
                hospital_name: user.hospital_name || '',
              }));
              setHospitalName(user.hospital_name || '');
            }
          } catch (err) {
            console.error('Failed to parse user data:', err);
          }
        }
      }
    };
    
    fetchUserInfo();
    
    // 오늘 날짜를 기본으로 추가
    const today = new Date().toISOString().split('T')[0];
    setDateInput(today);
    setWorkDates([today]);
  }, []);

  const addWorkDate = () => {
    if (dateInput && !workDates.includes(dateInput)) {
      setWorkDates([...workDates, dateInput].sort());
    }
  };

  const removeWorkDate = (date: string) => {
    setWorkDates(workDates.filter(d => d !== date));
  };

  // 세금 계산 로직
  const calculateTax = (gross: number) => {
    let incomeTax = 0;
    let localTax = 0;

    if (formData.tax_method === 'business') {
      incomeTax = Math.floor(gross * 0.03);
      localTax = Math.floor(gross * 0.003);
    } else {
      const DAILY_DEDUCTION = 150000;
      if (gross > DAILY_DEDUCTION) {
        const taxableIncome = gross - DAILY_DEDUCTION;
        incomeTax = Math.floor(taxableIncome * 0.027 / 10) * 10;
        localTax = Math.floor(incomeTax * 0.1 / 10) * 10;
      }
    }
    return { incomeTax, localTax };
  };

  const onGrossInput = (value: string) => {
    const gross = parseFloat(value);
    if (!isNaN(gross)) {
      const { incomeTax, localTax } = calculateTax(gross);
      const net = gross - incomeTax - localTax;
      setFormData(prev => ({ ...prev, wage_gross: value, wage_net: net.toString() }));
    } else {
      setFormData(prev => ({ ...prev, wage_gross: value, wage_net: '' }));
    }
  };

  const onNetInput = (value: string) => {
    const targetNet = parseFloat(value);
    if (!isNaN(targetNet)) {
      let gross = 0;
      if (formData.tax_method === 'business') {
        gross = Math.round(targetNet / (1 - 0.033));
      } else {
        const DAILY_DEDUCTION = 150000;
        if (targetNet <= DAILY_DEDUCTION) {
          gross = targetNet;
        } else {
          const totalRate = 0.0297;
          const deductionTerm = DAILY_DEDUCTION * totalRate;
          gross = Math.round((targetNet - deductionTerm) / (1 - totalRate));
        }
      }
      
      // 미세 조정
      const calcNet = (g: number) => {
        const { incomeTax, localTax } = calculateTax(g);
        return g - incomeTax - localTax;
      };
      
      let currentNet = calcNet(gross);
      let attempts = 0;
      while (currentNet !== targetNet && attempts < 1000) {
        if (currentNet > targetNet) gross--;
        else gross++;
        currentNet = calcNet(gross);
        attempts++;
      }
      
      setFormData(prev => ({ ...prev, wage_net: value, wage_gross: gross.toString() }));
    } else {
      setFormData(prev => ({ ...prev, wage_net: value, wage_gross: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        work_dates: workDates,
      };

      const response = await contractAPI.createDaily(payload);
      alert('일용직 계약서가 저장되었습니다.');
      
      // 계약서 상세 페이지로 이동 (전자서명 가능)
      if (response.data.data && response.data.data.id) {
        navigate(`/contracts/${response.data.data.id}`);
      } else {
        navigate('/contracts');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // 미리보기 데이터
  const previewData = {
    ...formData,
    workDates,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-blue-900 text-white p-4 shadow-md print:hidden sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h1 className="text-xl font-bold">{formData.tax_method === 'business' ? '프리랜서 의사 용역계약서 생성기' : '의사 일용직(대진) 근로계약서 생성기'}</h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>저장 중...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>저장 및 전자서명 준비</span>
                </>
              )}
            </button>
            <button onClick={handlePrint} className="flex items-center space-x-2 bg-white text-blue-900 px-4 py-2 rounded hover:bg-blue-50 transition-colors font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
              </svg>
              <span>PDF 저장 / 인쇄</span>
            </button>
            <button onClick={() => navigate('/dashboard')} className="bg-white text-blue-900 px-4 py-2 rounded hover:bg-blue-50 transition-colors font-semibold">
              대시보드
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8 items-start">
        {/* 왼쪽: 입력 폼 */}
        <div className="w-full md:w-1/3 space-y-6 print:hidden pb-10">
          {/* 병원 정보 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              병원(갑) 정보 <span className="text-xs text-gray-500 ml-2 font-normal">(회원정보 자동 반영)</span>
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">병원명 (상호)</label>
                <input 
                  type="text" 
                  value={formData.hospital_name}
                  disabled
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">대표자 성명</label>
                <input 
                  type="text"
                  value={formData.director_name}
                  disabled
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">병원 주소</label>
                <input 
                  type="text"
                  value={formData.hospital_address}
                  disabled
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                💡 병원 정보는 회원가입 시 입력한 정보로 자동 채워집니다. 수정이 필요한 경우 설정 페이지에서 회원정보를 변경해주세요.
              </p>
            </div>
          </div>

          {/* 의사 정보 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              의사(을) 정보
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">성명 *</label>
                <input 
                  type="text"
                  value={formData.doctor_name}
                  onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                  placeholder="예: 김의사" 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일 * <span className="text-xs text-gray-500">(전자서명 발송용)</span></label>
                <input 
                  type="email"
                  value={formData.doctor_email}
                  onChange={(e) => setFormData({ ...formData, doctor_email: e.target.value })}
                  placeholder="예: doctor@example.com" 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">주민등록번호</label>
                <input 
                  type="text"
                  value={formData.doctor_registration_number}
                  onChange={(e) => setFormData({ ...formData, doctor_registration_number: e.target.value })}
                  placeholder="예: 800101-1******" 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                <input 
                  type="text"
                  value={formData.doctor_phone}
                  onChange={(e) => setFormData({ ...formData, doctor_phone: e.target.value })}
                  placeholder="예: 010-1234-5678" 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">면허번호</label>
                <input 
                  type="text"
                  value={formData.doctor_license_number}
                  onChange={(e) => setFormData({ ...formData, doctor_license_number: e.target.value })}
                  placeholder="예: 제 12345 호" 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                <input 
                  type="text"
                  value={formData.doctor_address}
                  onChange={(e) => setFormData({ ...formData, doctor_address: e.target.value })}
                  placeholder="거주지 주소 입력" 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">은행명</label>
                  <input 
                    type="text"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">계좌번호</label>
                  <input 
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 근무 조건 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              근무 조건
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">근무일 (복수 선택 가능)</label>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="date" 
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button 
                    type="button"
                    onClick={addWorkDate}
                    className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm font-medium"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {workDates.map((date) => (
                    <div key={date} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                      <span>{date}</span>
                      <button 
                        type="button"
                        onClick={() => removeWorkDate(date)} 
                        className="text-blue-600 hover:text-blue-900 font-bold ml-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400">날짜를 선택하고 '추가' 버튼을 누르세요.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
                  <input 
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
                  <input 
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">휴게 시간</label>
                <input 
                  type="text"
                  value={formData.break_time}
                  onChange={(e) => setFormData({ ...formData, break_time: e.target.value })}
                  placeholder="예: 13:00 ~ 14:00" 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 급여 및 세금 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              급여 및 세금 설정
            </h2>
            <div className="space-y-4">
              {/* 세금 적용 방식 */}
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">세금 적용 방식</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={formData.tax_method === 'business'}
                      onChange={() => setFormData({ ...formData, tax_method: 'business' })}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">사업소득 (3.3%) <span className="text-xs text-gray-500">- 프리랜서</span></span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio"
                      checked={formData.tax_method === 'daily'}
                      onChange={() => setFormData({ ...formData, tax_method: 'daily' })}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">일용근로소득 (비과세 15만원) <span className="text-xs text-gray-500">- 일용직 원칙</span></span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  {formData.tax_method === 'business' 
                    ? '총 지급액의 3.3%를 원천징수합니다. (일반적인 대진의 관행)'
                    : '일급 15만원까지 비과세, 초과분에 대해 2.7%(소득세) + 0.27%(지방세) 공제합니다. (일용직 원칙)'
                  }
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">세전 금액 (Gross)</label>
                  <input 
                    type="number"
                    value={formData.wage_gross}
                    onChange={(e) => onGrossInput(e.target.value)}
                    placeholder="세전 금액" 
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">세후 금액 (Net)</label>
                  <input 
                    type="number"
                    value={formData.wage_net}
                    onChange={(e) => onNetInput(e.target.value)}
                    placeholder="실수령액" 
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-green-50"
                  />
                </div>
              </div>

              {/* 수기 직접입력 토글 */}
              <div className="border-t border-gray-200 pt-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={manualWage}
                    onChange={(e) => setManualWage(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">세전/세후 금액 직접 입력</span>
                </label>
                {manualWage && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">세전 금액 (직접입력)</label>
                      <input
                        type="number"
                        value={formData.wage_gross}
                        onChange={(e) => setFormData(prev => ({ ...prev, wage_gross: e.target.value }))}
                        placeholder="세전 금액"
                        className="w-full p-2 border border-orange-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-orange-50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">세후 금액 (직접입력)</label>
                      <input
                        type="number"
                        value={formData.wage_net}
                        onChange={(e) => setFormData(prev => ({ ...prev, wage_net: e.target.value }))}
                        placeholder="실수령액"
                        className="w-full p-2 border border-orange-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-orange-50 text-sm"
                      />
                    </div>
                    <p className="col-span-2 text-xs text-orange-600">자동 계산 없이 세전/세후 금액을 각각 직접 입력합니다.</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">계약서 표기 기준</label>
                <select 
                  value={formData.wage_type}
                  onChange={(e) => setFormData({ ...formData, wage_type: e.target.value as 'gross' | 'net' })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="net">실수령액 (Net) 기준 표기</option>
                  <option value="gross">세전금액 (Gross) 기준 표기</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">특약사항 (선택)</label>
                <textarea 
                  value={formData.special_conditions}
                  onChange={(e) => setFormData({ ...formData, special_conditions: e.target.value })}
                  placeholder="추가적인 합의 사항이 있다면 입력하세요." 
                  rows={3} 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 부가 서류 설정 */}
          <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-200">
            <h2 className="text-lg font-semibold mb-4 border-b border-blue-200 pb-2 flex items-center text-blue-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              부가 서류 및 설정
            </h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-3 bg-white rounded border border-blue-100 cursor-pointer hover:bg-blue-50 transition">
                <input 
                  type="checkbox"
                  checked={formData.include_security_pledge}
                  onChange={(e) => setFormData({ ...formData, include_security_pledge: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="font-medium text-gray-700">보안 서약서 포함</span>
              </label>
              <label className="flex items-center space-x-3 p-3 bg-white rounded border border-blue-100 cursor-pointer hover:bg-blue-50 transition">
                <input 
                  type="checkbox"
                  checked={formData.include_pay_stub}
                  onChange={(e) => setFormData({ ...formData, include_pay_stub: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="font-medium text-gray-700">급여 명세서 포함</span>
              </label>
              <label className="flex items-center space-x-3 p-3 bg-white rounded border border-blue-100 cursor-pointer hover:bg-blue-50 transition">
                <input 
                  type="checkbox"
                  checked={formData.include_crime_check}
                  onChange={(e) => setFormData({ ...formData, include_crime_check: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="font-medium text-gray-700">성범죄/아동학대 조회 동의서 포함</span>
              </label>
            </div>
          </div>

          {/* 경고 */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-bold text-red-800 mb-1">일용직(단기근로) 고용 시 주의사항</h3>
                <p className="text-xs text-red-700 leading-relaxed">
                  <strong>1개월 이상</strong> 계속 근무하거나 <strong>월 60시간(또는 월 8일) 이상</strong> 근무하는 경우, 
                  일용직이 아닌 <strong>상용직</strong>으로 분류되어 4대보험(국민연금, 건강보험) 가입 의무가 발생할 수 있습니다.
                  <br />본 계약서는 일반적인 일용직 양식이므로, 장기 근무 시에는 노무 전문가와 상담하시기 바랍니다.
                </p>
              </div>
            </div>
          </div>


          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* 오른쪽: 미리보기 */}
        <div className="w-full md:w-2/3 bg-gray-200 p-4 md:p-8 flex justify-center items-start custom-scrollbar print:bg-white print:p-0" style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
          <div id="print-area" className="print-area bg-white shadow-lg print:shadow-none" style={{ width: '210mm' }}>
            <CompleteDailyContractTemplate data={previewData} />
          </div>
        </div>
      </main>
    </div>
  );
}
