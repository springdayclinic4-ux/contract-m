interface RegularContractTemplateProps {
  data: {
    contractNumber?: string;
    // 사용자(병원) 정보
    hospitalName?: string;
    directorName?: string;
    hospitalAddress?: string;
    // 근로자 정보
    employeeName: string;
    employeeBirthDate?: string;
    employeeAddress?: string;
    employeePhone?: string;
    employeeResidentNumber?: string;
    // 계약기간
    workContractStartDate?: string;
    workContractEndDate?: string;
    salaryContractStartDate?: string;
    salaryContractEndDate?: string;
    contractType?: string; // 'regular' | 'temporary' | 'contract'
    probationPeriod?: number; // 수습기간(개월)
    probationSalaryRate?: number; // 수습기간 급여 비율(%)
    // 임금 구성
    annualSalaryTotal?: string;
    baseSalary?: string;
    mealAllowance?: string;
    monthlyBaseSalary?: string;
    monthlyMealAllowance?: string;
    hourlyWage?: string;
    monthlyWorkHours?: string;
    // 근로조건
    workDetails?: string;
    workHoursPerDay?: string;
    workHoursPerWeek?: string;
    workStartTime?: string;
    workEndTime?: string;
    breakTime?: string;
    weeklyHolidays?: string;
    // 지급 조건
    salaryPaymentDay?: string;
    accountBank?: string;
    accountNumber?: string;
    accountHolder?: string;
    // 기타
    specialConditions?: string;
    createdAt?: string;
  };
}

export default function RegularContractTemplate({ data }: RegularContractTemplateProps) {
  const today = data.createdAt 
    ? new Date(data.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  const getContractTypeText = (type?: string) => {
    switch(type) {
      case 'regular': return '기간의 정함이 없음';
      case 'temporary': return '기간제 계약';
      case 'contract': return '계약직';
      default: return '기간의 정함이 없음';
    }
  };

  return (
    <div className="bg-white p-12 shadow-lg print-area" style={{ minHeight: '297mm', width: '210mm', margin: '0 auto' }}>
      {/* 제목 */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">근로계약서</h1>
        {data.contractNumber && (
          <p className="text-sm text-gray-600">계약서 번호: {data.contractNumber}</p>
        )}
      </div>

      {/* 서문 */}
      <div className="mb-8 leading-relaxed">
        <p className="text-base">
          본 계약은 <strong>{data.hospitalName || '[사업체명]'}</strong> (이하 "사용자"라 함)과{' '}
          <strong>{data.employeeName || '[근로자명]'}</strong> (이하 "근로자"라 함) 와(과) 다음과 같이{' '}
          동료에 및 상호 신뢰의 원칙에 입각하여 다음과 같이 근로계약을 체결한다.
        </p>
      </div>

      <div className="text-center text-2xl font-bold my-6">--- 다 음 ---</div>

      {/* 1. 당사자 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">1. 당사자</h2>
        <table className="w-full border-2 border-gray-800">
          <tbody>
            <tr className="border-b-2 border-gray-800">
              <td className="border-r-2 border-gray-800 px-3 py-2 font-semibold w-24 bg-gray-50">사용자</td>
              <td className="border-r-2 border-gray-800 px-3 py-2 font-semibold w-28">사업체명</td>
              <td className="border-r-2 border-gray-800 px-3 py-2 w-1/3">{data.hospitalName || '[사업체명]'}</td>
              <td className="border-r-2 border-gray-800 px-3 py-2 font-semibold w-28">대표자명</td>
              <td className="px-3 py-2">{data.directorName || '[대표자명]'}</td>
            </tr>
            <tr className="border-b-2 border-gray-800">
              <td className="border-r-2 border-gray-800 px-3 py-2"></td>
              <td className="border-r-2 border-gray-800 px-3 py-2 font-semibold">사업장소재지</td>
              <td className="px-3 py-2" colSpan={3}>{data.hospitalAddress || '[사업장 주소]'}</td>
            </tr>
            <tr>
              <td className="border-r-2 border-gray-800 px-3 py-2 font-semibold bg-gray-50">근로자</td>
              <td className="border-r-2 border-gray-800 px-3 py-2 font-semibold">성명</td>
              <td className="border-r-2 border-gray-800 px-3 py-2">{data.employeeName || '[근로자명]'}</td>
              <td className="border-r-2 border-gray-800 px-3 py-2 font-semibold">생년월일</td>
              <td className="px-3 py-2">{data.employeeBirthDate || '[생년월일]'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. 계약기간 */}
      <div className="mb-8 page-break">
        <h2 className="text-xl font-bold mb-4">2. 계약기간</h2>
        <div className="space-y-3 pl-4 leading-relaxed">
          <p>
            (1) 근로계약기간은 <strong className="underline">{data.workContractStartDate || '____년 __월 __일'}</strong> 부터{' '}
            <strong className="underline">{data.workContractEndDate || getContractTypeText(data.contractType)}</strong> 으로 한다.
          </p>
          
          <p>
            (2) 연봉계약기간은 <strong className="underline">{data.salaryContractStartDate || '____년 __월 __일'}</strong> 부터{' '}
            <strong className="underline">{data.salaryContractEndDate || '____년 __월 __일'}</strong> 으로 한다.
          </p>

          <p className="text-sm text-gray-700 pl-4">
            본 연봉적용기간이 만료되었음에도 불구하고, 별도의 연봉계약이 체결되지 않은 경우에는 새로운 계약이 체결될 때까지 본 연봉 계약의 효력이 연장된다.
          </p>

          <p>
            (3) 근로자는 근무하는 동안 동 회사의 경영방침을 준수하고 근로자로의 본분 및 책무를 다하고 고객에 최선을 다함은 물론{' '}
            동 회사의 발전을 위하여 제반 사항에 대하여 상호 신뢰로 협력한다. 또한 근로자는 동 회사의 경영이 활성화될 수 있도록{' '}
            최선을 다해 협조하며 성실이행의 의무를 진다.
          </p>

          <p>
            (4) 신입/경력 직원을 불문하고, 근로계약 시작일로부터 <strong>{data.probationPeriod || 3}개월</strong>의 수습기간을 적용하며,{' '}
            수습기간 급여는 약정 급여의 <strong>{data.probationSalaryRate || 100}%</strong>로 한다. 수습기간 동안 평가를 통하여 본채용에{' '}
            아래와 같은 결격 사유가 있는 경우, 회사는 본채용을 거부할 수 있다.
          </p>

          <div className="pl-8 space-y-1 text-sm">
            <p>1) 수습 기간 중 근무성적이 현저히 저조하거나 근무태도 등 업무적격성이 회사의 채용기준에 미달하는 경우</p>
            <p>2) 채용 서류 중 허위 기재 또는 허위 사실이 발견된 경우</p>
            <p>3) 취업규칙 등의 규정 및 회사의 지시를 위반하거나 직원으로서 적합하지 아니한 경우</p>
          </div>
        </div>
      </div>

      {/* 3. 임금의 구성 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">3. 임금의 구성</h2>
        <div className="space-y-4">
          <p className="pl-4">
            (1) <strong>연봉총액 : 금 {data.annualSalaryTotal ? `${data.annualSalaryTotal}원` : '________원'} 정 (₩ {data.annualSalaryTotal ? Number(data.annualSalaryTotal).toLocaleString() : '_________'})</strong>
          </p>

          <div className="overflow-x-auto pl-4">
            <table className="w-full border-2 border-gray-800 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border-2 border-gray-800 px-2 py-2" rowSpan={2}>구분</th>
                  <th className="border-2 border-gray-800 px-2 py-2" colSpan={2}>연용액</th>
                  <th className="border-2 border-gray-800 px-2 py-2" colSpan={2}>월급여액(연봉/12)</th>
                  <th className="border-2 border-gray-800 px-2 py-2" colSpan={2}>계산방법</th>
                  <th className="border-2 border-gray-800 px-2 py-2" rowSpan={2}>월 기준시간</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-2 border-gray-800 px-2 py-2 font-semibold">임금항목</td>
                  <td className="border-2 border-gray-800 px-2 py-2 font-semibold">기본연봉(기본급)</td>
                  <td className="border-2 border-gray-800 px-2 py-2 text-right">{data.baseSalary ? Number(data.baseSalary).toLocaleString() : '_____'}</td>
                  <td className="border-2 border-gray-800 px-2 py-2 font-semibold">월 기본급</td>
                  <td className="border-2 border-gray-800 px-2 py-2 text-right">{data.monthlyBaseSalary ? Number(data.monthlyBaseSalary).toLocaleString() : '_____'}</td>
                  <td className="border-2 border-gray-800 px-2 py-2 text-xs" colSpan={2}>(40+(40/5))×4.345-식대</td>
                  <td className="border-2 border-gray-800 px-2 py-2 text-center" rowSpan={3}>{data.monthlyWorkHours || '209'} 시간</td>
                </tr>
                <tr>
                  <td className="border-2 border-gray-800 px-2 py-2"></td>
                  <td className="border-2 border-gray-800 px-2 py-2 font-semibold">식대</td>
                  <td className="border-2 border-gray-800 px-2 py-2 text-right">{data.mealAllowance ? Number(data.mealAllowance).toLocaleString() : '_____'}</td>
                  <td className="border-2 border-gray-800 px-2 py-2 font-semibold">식대</td>
                  <td className="border-2 border-gray-800 px-2 py-2 text-right">{data.monthlyMealAllowance ? Number(data.monthlyMealAllowance).toLocaleString() : '_____'}</td>
                  <td className="border-2 border-gray-800 px-2 py-2 text-xs" colSpan={2}>비과세 식비</td>
                </tr>
                <tr className="font-bold">
                  <td className="border-2 border-gray-800 px-2 py-2"></td>
                  <td className="border-2 border-gray-800 px-2 py-2">총 계</td>
                  <td className="border-2 border-gray-800 px-2 py-2 text-right">{data.annualSalaryTotal ? Number(data.annualSalaryTotal).toLocaleString() : '_____'}</td>
                  <td className="border-2 border-gray-800 px-2 py-2">월 합 계</td>
                  <td className="border-2 border-gray-800 px-2 py-2 text-right">
                    {data.monthlyBaseSalary && data.monthlyMealAllowance 
                      ? (Number(data.monthlyBaseSalary) + Number(data.monthlyMealAllowance)).toLocaleString() 
                      : '_____'}
                  </td>
                  <td className="border-2 border-gray-800 px-2 py-2 font-semibold">통상시급</td>
                  <td className="border-2 border-gray-800 px-2 py-2 text-right">{data.hourlyWage ? Number(data.hourlyWage).toLocaleString() : '_____'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-2 pl-4 text-sm leading-relaxed">
            <p>1) 연봉총액은 기본연봉(기본급) 및 식대 등 비과세를 포함하며 위와 같이 구성되어 있다.</p>
            <p>2) 회사의 업무 특성 상 기본급을 결정하고 이를 기초로 한 연장, 휴일 및 야간근로 등 법정제수당에 대해서는 실제근무시간에 따라 추가로 지급한다.</p>
            <p>3) 연봉과 별도로 지급되는 상여금, 각종수당, 복리후생비 등은 별도 규정에 따라 지급되며, 해당 규정에 의거하여 통상임금에 포함되지 않는다.</p>
          </div>

          <p className="pl-4 font-semibold">(2) 지급방법</p>
          <div className="pl-8 space-y-2 text-sm leading-relaxed">
            <p>
              급여 산정기간은 매월 1일~ 말일 까지 이며, 익월 <strong>{data.salaryPaymentDay || '__'}일</strong>에 지급하되,{' '}
              관련법규에 의한 제세금, 사회보험료 및 사전 동의를 구한 비용은 선공제 후 "근로자"가 지정한 명의의 계좌로 지급한다.
            </p>
          </div>

          <p className="pl-4 font-semibold">(3) 계약기간 중도의 입사/퇴직</p>
          <div className="pl-8 text-sm leading-relaxed">
            <p>월중 입사자 또는 월중 퇴사자의 급여는 해당월의 일수로 일할계산 하여 지급한다.</p>
          </div>
        </div>
      </div>

      {/* 4. 근로조건 */}
      <div className="mb-8 page-break">
        <h2 className="text-xl font-bold mb-4">4. 근로조건</h2>
        <div className="space-y-3 pl-4 text-sm leading-relaxed">
          <p>
            (1) <strong>업무내용</strong> : 위 소속에서 "사용자" 또는 "사용자"의 위임을 받은 자가 지정한 업무
          </p>
          {data.workDetails && (
            <p className="pl-4 text-gray-700 whitespace-pre-wrap">{data.workDetails}</p>
          )}

          <p>
            (2) <strong>근무시간 및 휴게시간</strong>
          </p>
          <div className="pl-4 space-y-1">
            <p>• 근로시간은 1일 <strong>{data.workHoursPerDay || '__'}시간</strong>, 주 <strong>{data.workHoursPerWeek || '__'}시간</strong>을 기준으로 한다.</p>
            <p>• 휴게시간: <strong>{data.breakTime || '____'}</strong></p>
            <p>• 근무시간: <strong>{data.workStartTime || '__:__'} ~ {data.workEndTime || '__:__'}</strong></p>
          </div>

          <p>
            (3) <strong>휴일</strong>
          </p>
          <div className="pl-4 space-y-1">
            <p>• 주휴일: 매주 <strong>{data.weeklyHolidays || '일요일'}</strong></p>
            <p>• 근로자의 날(5월 1일)은 유급휴일로 한다.</p>
          </div>

          <p>
            (4) <strong>연장·야간·휴일근로</strong>
          </p>
          <div className="pl-4">
            <p>업무상 필요시 당사자 합의에 의해 근로시간을 연장하거나 휴일근로를 할 수 있으며, 이 경우 근로기준법에서 정한 기준에 따라 가산임금을 지급한다.</p>
          </div>
        </div>
      </div>

      {/* 5. 휴가 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">5. 휴가</h2>
        <div className="space-y-3 pl-4 text-sm leading-relaxed">
          <p>
            (1) <strong>연차유급휴가</strong>
          </p>
          <div className="pl-4 space-y-1">
            <p>• 근로기준법에 따라 1년간 80% 이상 출근한 근로자에게 15일의 유급휴가를 부여한다.</p>
            <p>• 3년 이상 계속 근로한 근로자에게는 최초 1년을 초과하는 계속 근로연수 매 2년에 대하여 1일을 가산한 유급휴가를 부여한다. (최대 25일)</p>
          </div>

          <p>
            (2) <strong>경조휴가, 생리휴가, 출산휴가, 육아휴직</strong> 등은 회사 규정 및 관련 법령에 따른다.
          </p>
        </div>
      </div>

      {/* 6. 사직 및 퇴직 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">6. 사직 및 퇴직</h2>
        <div className="space-y-3 pl-4 text-sm leading-relaxed">
          <p>
            (1) <strong>근로자의 사직</strong>
          </p>
          <p className="pl-4">
            근로자가 자발적으로 사직하고자 하는 경우, 사직 예정일 30일 전까지 회사에 사직서를 제출하여야 한다.{' '}
            사직서의 효력은 회사가 수리한 날 또는 사직서를 제출한 당기 월 1임금 지급기를 경과한 날로부터 발생하며,{' '}
            사직일자 합의 또는 회사의 승인 전에 출근하지 않을 경우 무단결근으로 처리한다.
          </p>

          <p>
            (2) <strong>근로자 퇴직 후 지켜야 할 사항</strong>
          </p>
          <div className="pl-4 space-y-1">
            <p>1) 회사정보, 개인정보, 사진을 가지고 가지 않도록 한다.</p>
            <p>2) 동 회사 종사자 및 고객 개인정보 및 업무상 비밀에 대하여 누출하지 않도록 한다. 단, 이를 어길 경우 손해배상의 책임도 감수해야 한다.</p>
          </div>
        </div>
      </div>

      {/* 7. 근로계약의 해지사유 */}
      <div className="mb-8 page-break">
        <h2 className="text-xl font-bold mb-4">7. 근로계약의 해지사유</h2>
        <p className="pl-4 text-sm mb-2">
          "사용자"는 "근로자"가 다음 사항 중 하나 이상의 항목에 해당 될 경우 본 계약을 해지할 수 있다.
        </p>
        <div className="pl-8 space-y-1 text-sm leading-relaxed">
          <p>1) 취업규칙(또는 내규) 또는 정당한 업무지시를 위반한 경우</p>
          <p>2) 1주 중 무단결근 3일이상이거나 1개월을 통산하여 무단결근이 5일 이상인 경우</p>
          <p>3) 근로계약이 종료된 경우</p>
          <p>4) 업무수행 중 고의로 손해를 입힌 경우 또는 개설자의 의료기관 내에서 도박, 음주, 시설물 파괴, 풍기문란, 공공횡령 등 직장 질서를 어지럽힌 경우(횡령 등의 경우 손해배상 청구)</p>
          <p>5) 시기를 불문하고, 학력, 경력 등에 대한 허위사실이 발견된 경우</p>
          <p>6) 신체, 정신상의 이유로 업무 수행이 곤란한 경우</p>
          <p>7) 근무를 태만히 하거나 업무 수행 능력이 부족한 경우</p>
          <p>8) 업무와 관련하여 부당한 청탁을 받고, 금품을 수수한 경우</p>
          <p>9) 상기 사유 외 취업규칙과 노동관계 법률상의 해고 사유가 발생한 경우</p>
        </div>
      </div>

      {/* 8. 징계 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">8. 징계</h2>
        <p className="pl-4 text-sm mb-2">
          사용자는 다음 각 호에 해당하는 경우 "근로자"를 징계할 수 있다. 징계의 종류는 경고, 견책, 감봉, 정직, 해고로 한다.
        </p>
        <div className="pl-8 space-y-1 text-sm leading-relaxed">
          <p>1) 부정 및 허위 등의 방법으로 채용된 자</p>
          <p>2) 업무상 비밀 및 기밀을 누설한 자</p>
          <p>3) 회사의 영업을 방해하는 언행을 한 자</p>
          <p>4) 회사의 규율과 상사의 정당한 지시를 무시하여 질서를 문란하게 한 자</p>
          <p>5) 고의 또는 과실로 회사에 손해를 입힌 자</p>
          <p>6) 회사가 정한 복무규정을 위반한 자</p>
          <p>7) 직장 내 성희롱 행위를 한 자</p>
          <p>8) 직장 내 괴롭힘 행위를 한 자</p>
          <p>9) 기타 법령 위반 등 이에 준하는 행위로 직장질서를 문란하게 한 자</p>
        </div>
      </div>

      {/* 9. 퇴직금 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">9. 퇴직금</h2>
        <div className="space-y-2 pl-4 text-sm leading-relaxed">
          <p>(1) 근로기준법에 따라 1년동안 주 15시간 이상 근속한 경우 퇴직금을 지급한다.</p>
          <p>(2) 계속근로연수 1년 이상인 경우 사용자는 근로자에게 '근로자퇴직급여보장법상'의 퇴직금을 지급하거나, 퇴직금을 지급하는 것에 갈음하여 퇴직연금에 가입할 수 있다.</p>
        </div>
      </div>

      {/* 10. 기타 사항 */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">10. 기타 사항</h2>
        <div className="space-y-2 pl-4 text-sm leading-relaxed">
          <p>
            (1) 본 계약은 계약일로부터 효력을 발생하며, 본 계약에 정함이 없는 연봉 및 근로 조건에 대해서는 당사의 취업규칙과{' '}
            근로기준법의 정함에 따른다. 본 계약은 산업안전보건법, 최저임금법, 남녀고용평등법 등 노동 관계 법령을 준수한다.
          </p>
          <p>
            (2) 본 계약의 해석의 차이가 발생하거나 쌍방 간 피해가 발생할 경우 회사 주소지 관할법원에 손해배상을 청구할 수 있다.
          </p>
          <p>
            (3) "근로자"가 회사 업무를 통하여 습득하게 된 기밀문서, 대외비 자료를 소지하고 경쟁사로 전직하는 것은 허용되지 않는다.{' '}
            이를 위반하는 경우 민형사상의 책임 및 소송 비용 등에 대해서는 "근로자"에게 귀책된다.
          </p>
          <p>
            (4) "근로자"는 회사의 사전 동의 없이 동종 영업 또는 경쟁적인 사업을 직, 간접적으로 운영하거나 수행하여서는 아니된다.{' '}
            또한, "근로자"가 겸직하려는 경우 반드시 회사의 사전 동의를 득해야 하며, 그렇지 않은 경우 본 계약의 해제 및 손해배상 사유가 된다는 점을 확인한다.
          </p>
          <p>
            (5) 위 근로조건을 성실히 이행할 것을 약정하며 근로계약을 체결하고 서로 서명하여 1부씩 보관한다.
          </p>
        </div>
      </div>

      {data.specialConditions && (
        <div className="mb-12 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="font-bold mb-2">특이사항</h3>
          <p className="text-sm whitespace-pre-wrap">{data.specialConditions}</p>
        </div>
      )}

      {/* 서명란 */}
      <div className="mt-12 pt-8 border-t-2 border-gray-800">
        <p className="text-center text-lg font-bold mb-8">{today}</p>
        
        <div className="grid grid-cols-2 gap-12">
          {/* 사용자 */}
          <div className="space-y-4">
            <p className="text-center font-bold text-lg mb-4">"사용자"</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold">대표이사</span>
                <span>{data.directorName || '_____________'}</span>
                <span className="ml-4">(인)</span>
              </div>
            </div>
          </div>

          {/* 근로자 */}
          <div className="space-y-4">
            <p className="text-center font-bold text-lg mb-4">"근로자"</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold">성명</span>
                <span>{data.employeeName || '_____________'}</span>
                <span className="ml-4">(인)</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-semibold">주민등록번호</span>
                <span>{data.employeeResidentNumber || '_____________'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
