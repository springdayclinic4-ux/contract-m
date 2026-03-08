import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractAPI, userAPI } from '../lib/api';
import RegularContractTemplate from '../components/RegularContractTemplate';

export default function RegularContractPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // 병원 정보 (자동 입력)
    hospital_name: '',
    director_name: '',
    hospital_address: '',
    
    // 근로자 정보
    employee_name: '',
    employee_email: '',
    employee_birth_date: '',
    employee_address: '',
    employee_phone: '',
    employee_resident_number: '',
    
    // 계약 기간
    contract_type: 'regular' as 'regular' | 'temporary' | 'contract',
    work_contract_start_date: '',
    work_contract_end_date: '',
    salary_contract_start_date: '',
    salary_contract_end_date: '',
    probation_period: 3,
    probation_salary_rate: 100,
    
    // 임금 구성
    annual_salary_total: '',
    base_salary: '',
    meal_allowance: '',
    monthly_base_salary: '',
    monthly_meal_allowance: '',
    hourly_wage: '',
    monthly_work_hours: '209',
    
    // 근로 조건
    work_details: '',
    work_hours_per_day: '8',
    work_hours_per_week: '40',
    work_start_time: '09:00',
    work_end_time: '18:00',
    break_time: '12:00 ~ 13:00 (1시간)',
    weekly_holidays: '일요일',
    
    // 지급 조건
    salary_payment_day: '25',
    account_bank: '',
    account_number: '',
    account_holder: '',
    
    // 기타
    special_conditions: '',
    include_security_pledge: true,
    include_privacy_consent: true,
  });

  // 병원 정보 가져오기
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
          setFormData(prev => ({
            ...prev,
            hospital_name: user.hospitalName || '',
            director_name: user.directorName || '',
            hospital_address: user.hospitalAddress || '',
          }));
          console.log('🏥 Hospital Info:', {
            hospitalName: user.hospitalName,
            directorName: user.directorName,
            hospitalAddress: user.hospitalAddress,
          });
          
          if (!user.hospitalName || !user.directorName || !user.hospitalAddress) {
            alert('병원명, 대표자 성명, 병원 주소 정보가 부족합니다. 설정 페이지에서 정보를 업데이트해주세요.');
          }
        }
      } catch (err: any) {
        console.error('❌ Failed to fetch user info:', err);
        // localStorage fallback
        const savedUser = localStorage.getItem('user');
        if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
          try {
            const user = JSON.parse(savedUser);
            if (user.type === 'hospital') {
              setFormData(prev => ({
                ...prev,
                hospital_name: user.hospitalName || user.hospital_name || '',
                director_name: user.directorName || user.director_name || '',
                hospital_address: user.hospitalAddress || user.hospital_address || '',
              }));
            }
          } catch (parseErr) {
            console.error('Failed to parse user data from localStorage:', parseErr);
          }
        }
      }
    };
    
    fetchUserInfo();
  }, [navigate]);

  // 연봉 총액 변경 시 자동 계산
  useEffect(() => {
    if (formData.annual_salary_total) {
      const annual = Number(formData.annual_salary_total);
      const monthlyTotal = Math.floor(annual / 12);
      const mealAllowance = Number(formData.meal_allowance) || 200000;
      const monthlyBase = monthlyTotal - mealAllowance;
      const hourlyWage = Math.floor(monthlyBase / 209);
      
      setFormData(prev => ({
        ...prev,
        monthly_base_salary: monthlyBase.toString(),
        monthly_meal_allowance: mealAllowance.toString(),
        hourly_wage: hourlyWage.toString(),
        base_salary: (monthlyBase * 12).toString(),
      }));
    }
  }, [formData.annual_salary_total, formData.meal_allowance]);

  const handleSubmit = async () => {
    setError('');

    // 연봉 기간 검증
    if (formData.salary_contract_start_date && formData.salary_contract_end_date) {
      if (formData.salary_contract_end_date < formData.salary_contract_start_date) {
        setError('연봉 종료일은 시작일보다 이후여야 합니다.');
        return;
      }
    }

    // 근로 기간 검증
    if (formData.work_contract_start_date && formData.work_contract_end_date) {
      if (formData.work_contract_end_date < formData.work_contract_start_date) {
        setError('근로 종료일은 시작일보다 이후여야 합니다.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        // 백엔드 필드명 매핑
        work_content: formData.work_details,
        work_location: formData.hospital_address,
        pay_date: formData.salary_payment_day,
        monthly_total: formData.monthly_base_salary && formData.monthly_meal_allowance
          ? (Number(formData.monthly_base_salary) + Number(formData.monthly_meal_allowance)).toString()
          : '',
        regular_hourly_wage: formData.hourly_wage,
        monthly_base_hours: formData.monthly_work_hours,
        employee_resident_number: formData.employee_resident_number,
      };

      const { data } = await contractAPI.createRegular(payload);
      
      if (data.success) {
        alert('일반 근로계약서가 저장되었습니다.');
        if (data.data && data.data.id) {
          navigate(`/contracts/${data.data.id}`);
        } else {
          navigate('/contracts');
        }
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

  // 미리보기 데이터 변환
  const previewData = {
    hospitalName: formData.hospital_name,
    directorName: formData.director_name,
    hospitalAddress: formData.hospital_address,
    employeeName: formData.employee_name,
    employeeBirthDate: formData.employee_birth_date,
    employeeAddress: formData.employee_address,
    employeePhone: formData.employee_phone,
    employeeResidentNumber: formData.employee_resident_number,
    workContractStartDate: formData.work_contract_start_date,
    workContractEndDate: formData.work_contract_end_date,
    salaryContractStartDate: formData.salary_contract_start_date,
    salaryContractEndDate: formData.salary_contract_end_date,
    contractType: formData.contract_type,
    probationPeriod: formData.probation_period,
    probationSalaryRate: formData.probation_salary_rate,
    annualSalaryTotal: formData.annual_salary_total,
    baseSalary: formData.base_salary,
    mealAllowance: formData.meal_allowance,
    monthlyBaseSalary: formData.monthly_base_salary,
    monthlyMealAllowance: formData.monthly_meal_allowance,
    hourlyWage: formData.hourly_wage,
    monthlyWorkHours: formData.monthly_work_hours,
    workDetails: formData.work_details,
    workHoursPerDay: formData.work_hours_per_day,
    workHoursPerWeek: formData.work_hours_per_week,
    workStartTime: formData.work_start_time,
    workEndTime: formData.work_end_time,
    breakTime: formData.break_time,
    weeklyHolidays: formData.weekly_holidays,
    salaryPaymentDay: formData.salary_payment_day,
    accountBank: formData.account_bank,
    accountNumber: formData.account_number,
    accountHolder: formData.account_holder,
    specialConditions: formData.special_conditions,
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
            <h1 className="text-xl font-bold">일반 근로계약서 생성기</h1>
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
              병원 정보
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              회원가입 시 입력한 정보로 자동 채워집니다. 수정이 필요한 경우 <a href="/settings" className="text-blue-600 hover:underline">설정 페이지</a>에서 회원정보를 변경해주세요.
            </p>
            <div className="space-y-3">
              <div>
                <label className="label">병원명 *</label>
                <input
                  type="text"
                  value={formData.hospital_name}
                  className="input-field bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="label">대표자 성명 *</label>
                <input
                  type="text"
                  value={formData.director_name}
                  className="input-field bg-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="label">병원 주소 *</label>
                <input
                  type="text"
                  value={formData.hospital_address}
                  className="input-field bg-gray-100"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* 근로자 정보 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              근로자 정보
            </h2>
            <div className="space-y-3">
              <div>
                <label className="label">성명 *</label>
                <input
                  type="text"
                  value={formData.employee_name}
                  onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                  className="input-field"
                  placeholder="홍길동"
                  required
                />
              </div>
              <div>
                <label className="label">이메일 *</label>
                <input
                  type="email"
                  value={formData.employee_email}
                  onChange={(e) => setFormData({ ...formData, employee_email: e.target.value })}
                  className="input-field"
                  placeholder="employee@example.com"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">생년월일</label>
                  <input
                    type="date"
                    value={formData.employee_birth_date}
                    onChange={(e) => setFormData({ ...formData, employee_birth_date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">연락처</label>
                  <input
                    type="tel"
                    value={formData.employee_phone}
                    onChange={(e) => setFormData({ ...formData, employee_phone: e.target.value })}
                    className="input-field"
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>
              <div>
                <label className="label">주소 *</label>
                <input
                  type="text"
                  value={formData.employee_address}
                  onChange={(e) => setFormData({ ...formData, employee_address: e.target.value })}
                  className="input-field"
                  placeholder="서울특별시 강남구..."
                  required
                />
              </div>
              <div>
                <label className="label">주민등록번호 (선택)</label>
                <input
                  type="text"
                  value={formData.employee_resident_number}
                  onChange={(e) => setFormData({ ...formData, employee_resident_number: e.target.value })}
                  className="input-field"
                  placeholder="000000-0000000"
                />
              </div>
            </div>
          </div>

          {/* 계약 정보 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">계약 정보</h2>
            <div className="space-y-3">
              <div>
                <label className="label">계약 유형</label>
                <select
                  value={formData.contract_type}
                  onChange={(e) => setFormData({ ...formData, contract_type: e.target.value as any })}
                  className="input-field"
                >
                  <option value="regular">정규직 (기간의 정함이 없음)</option>
                  <option value="temporary">임시직</option>
                  <option value="contract">계약직</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">근로 시작일 *</label>
                  <input
                    type="date"
                    value={formData.work_contract_start_date}
                    onChange={(e) => setFormData({ ...formData, work_contract_start_date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">근로 종료일</label>
                  <input
                    type="date"
                    value={formData.work_contract_end_date}
                    onChange={(e) => setFormData({ ...formData, work_contract_end_date: e.target.value })}
                    className="input-field"
                    disabled={formData.contract_type === 'regular'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">연봉 시작일 *</label>
                  <input
                    type="date"
                    value={formData.salary_contract_start_date}
                    onChange={(e) => setFormData({ ...formData, salary_contract_start_date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">연봉 종료일 *</label>
                  <input
                    type="date"
                    value={formData.salary_contract_end_date}
                    onChange={(e) => setFormData({ ...formData, salary_contract_end_date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">수습 기간 (개월)</label>
                  <input
                    type="number"
                    value={formData.probation_period}
                    onChange={(e) => setFormData({ ...formData, probation_period: Number(e.target.value) })}
                    className="input-field"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="label">수습 급여율 (%)</label>
                  <input
                    type="number"
                    value={formData.probation_salary_rate}
                    onChange={(e) => setFormData({ ...formData, probation_salary_rate: Number(e.target.value) })}
                    className="input-field"
                    placeholder="100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 급여 정보 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">급여 정보</h2>
            <div className="space-y-3">
              <div>
                <label className="label">연봉 총액 (원) *</label>
                <input
                  type="number"
                  value={formData.annual_salary_total}
                  onChange={(e) => setFormData({ ...formData, annual_salary_total: e.target.value })}
                  className="input-field"
                  placeholder="43000000"
                  required
                />
              </div>

              <div>
                <label className="label">식대 (연간, 원)</label>
                <input
                  type="number"
                  value={formData.meal_allowance}
                  onChange={(e) => setFormData({ ...formData, meal_allowance: e.target.value })}
                  className="input-field"
                  placeholder="2400000"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded text-sm space-y-1">
                <p className="font-semibold text-blue-900">자동 계산 결과</p>
                <p>• 월 기본급: {formData.monthly_base_salary ? Number(formData.monthly_base_salary).toLocaleString() : '0'}원</p>
                <p>• 월 식대: {formData.monthly_meal_allowance ? Number(formData.monthly_meal_allowance).toLocaleString() : '0'}원</p>
                <p>• 통상시급: {formData.hourly_wage ? Number(formData.hourly_wage).toLocaleString() : '0'}원</p>
              </div>

              <div>
                <label className="label">급여 지급일</label>
                <input
                  type="number"
                  value={formData.salary_payment_day}
                  onChange={(e) => setFormData({ ...formData, salary_payment_day: e.target.value })}
                  className="input-field"
                  placeholder="25"
                  min="1"
                  max="31"
                />
              </div>
            </div>
          </div>

          {/* 근무 정보 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">근무 정보</h2>
            <div className="space-y-3">
              <div>
                <label className="label">업무 내용</label>
                <textarea
                  value={formData.work_details}
                  onChange={(e) => setFormData({ ...formData, work_details: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="담당 업무를 입력하세요."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">1일 근무시간</label>
                  <input
                    type="number"
                    value={formData.work_hours_per_day}
                    onChange={(e) => setFormData({ ...formData, work_hours_per_day: e.target.value })}
                    className="input-field"
                    placeholder="8"
                  />
                </div>
                <div>
                  <label className="label">주 근무시간</label>
                  <input
                    type="number"
                    value={formData.work_hours_per_week}
                    onChange={(e) => setFormData({ ...formData, work_hours_per_week: e.target.value })}
                    className="input-field"
                    placeholder="40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">근무 시작</label>
                  <input
                    type="time"
                    value={formData.work_start_time}
                    onChange={(e) => setFormData({ ...formData, work_start_time: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">근무 종료</label>
                  <input
                    type="time"
                    value={formData.work_end_time}
                    onChange={(e) => setFormData({ ...formData, work_end_time: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="label">휴게시간</label>
                <input
                  type="text"
                  value={formData.break_time}
                  onChange={(e) => setFormData({ ...formData, break_time: e.target.value })}
                  className="input-field"
                  placeholder="12:00 ~ 13:00 (1시간)"
                />
              </div>

              <div>
                <label className="label">주휴일</label>
                <input
                  type="text"
                  value={formData.weekly_holidays}
                  onChange={(e) => setFormData({ ...formData, weekly_holidays: e.target.value })}
                  className="input-field"
                  placeholder="일요일"
                />
              </div>
            </div>
          </div>

          {/* 특이사항 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">특이사항</h2>
            <div>
              <textarea
                value={formData.special_conditions}
                onChange={(e) => setFormData({ ...formData, special_conditions: e.target.value })}
                className="input-field"
                rows={4}
                placeholder="특별히 명시할 사항이 있다면 입력하세요."
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* 오른쪽: 계약서 미리보기 */}
        <div className="w-full md:w-2/3 print:w-full">
          <div className="sticky top-24">
            <div className="bg-white rounded-lg shadow-lg p-4 print:shadow-none print:p-0" style={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
              <div className="mb-4 pb-4 border-b print:hidden">
                <h2 className="text-lg font-semibold text-gray-900">📄 계약서 미리보기</h2>
                <p className="text-sm text-gray-600 mt-1">입력한 내용이 실시간으로 반영됩니다</p>
              </div>
              <div className="print:scale-100" style={{ transform: 'scale(0.7)', transformOrigin: 'top center' }}>
                <RegularContractTemplate data={previewData} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
