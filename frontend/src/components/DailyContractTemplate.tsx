interface DailyContractTemplateProps {
  data: {
    contractNumber?: string;
    hospitalName?: string;
    hospitalAddress?: string;
    directorName?: string;
    doctorName: string;
    doctorLicenseNumber: string;
    doctorAddress: string;
    doctorPhone?: string;
    doctorRegistrationNumber?: string;
    workDates?: string[];
    startTime?: string;
    endTime?: string;
    breakTime?: string;
    wageGross?: string;
    wageNet?: string;
    wageType?: string;
    bankName?: string;
    accountNumber?: string;
    specialConditions?: string;
    createdAt?: string;
    signatureImageUrl?: string;
    hospitalSignatureUrl?: string;
    taxMethod?: string; // 'business' | 'daily'
    includeSecurityPledge?: boolean;
    includePayStub?: boolean;
    includeCrimeCheck?: boolean;
  };
}

// 서명 이미지 렌더링 헬퍼
function SignatureImage({ src, alt }: { src?: string; alt: string }) {
  if (!src) return <span className="text-gray-400 text-sm">(인/서명)</span>;
  return <img src={src} alt={alt} style={{ maxHeight: '100px', maxWidth: '150px' }} className="object-contain" />;
}

export default function DailyContractTemplate({ data }: DailyContractTemplateProps) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const contractDate = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : today;

  // 근무일 포맷팅
  const formattedWorkDates = data.workDates && data.workDates.length > 0
    ? data.workDates.map(d => new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })).join(', ') +
      (data.workDates.length > 1 ? ` (총 ${data.workDates.length}일)` : '')
    : '';

  // 급여 표시 로직
  const displayWage = data.wageType === 'gross'
    ? (data.wageGross ? Number(data.wageGross).toLocaleString() : '__________')
    : (data.wageNet ? Number(data.wageNet).toLocaleString() : '__________');

  const taxMethod = data.taxMethod || 'business';
  const taxRateDesc = taxMethod === 'business' ? '3.3% 공제' : '일용직 근로소득세 공제';
  const displayWageType = data.wageType === 'gross'
    ? `세전 금액, Gross - ${taxRateDesc} 전`
    : `세후 실수령액, ${taxRateDesc} 후`;

  const hasSpecialConditions = data.specialConditions && data.specialConditions.trim() !== '';

  // 세금 계산 (급여명세서용) - 일급 기준
  const dailyWage = parseFloat(data.wageGross || '0') || 0;
  const dailyNet = parseFloat(data.wageNet || '0') || 0;
  const workDayCount = data.workDates?.length || 1;
  const gross = dailyWage * workDayCount;

  const calculateTax = () => {
    let incomeTax = 0;
    let localTax = 0;
    if (taxMethod === 'business') {
      incomeTax = Math.floor(gross * 0.03);
      localTax = Math.floor(gross * 0.003);
    } else {
      // 일용직 근로소득세: 일급별로 계산 후 합산
      for (let i = 0; i < workDayCount; i++) {
        const DAILY_DEDUCTION = 150000;
        if (dailyWage > DAILY_DEDUCTION) {
          const taxableIncome = dailyWage - DAILY_DEDUCTION;
          incomeTax += Math.floor(taxableIncome * 0.027 / 10) * 10;
        }
      }
      localTax = Math.floor(incomeTax * 0.1 / 10) * 10;
    }
    return { incomeTax, localTax };
  };

  const { incomeTax, localTax } = calculateTax();
  const totalDeduction = incomeTax + localTax;
  const netPay = gross > 0 ? gross - totalDeduction : dailyNet * workDayCount;

  // 급여명세서 귀속년월
  const firstDate = data.workDates && data.workDates.length > 0 ? new Date(data.workDates[0]) : new Date();
  const yearMonth = `${firstDate.getFullYear()}-${String(firstDate.getMonth() + 1).padStart(2, '0')}`;

  // 서명 컨테이너 스타일
  const sigBoxStyle = { width: '150px', height: '100px' };

  return (
    <div className="bg-white p-12" style={{ fontFamily: "'Noto Serif KR', serif", fontSize: '14px', lineHeight: '1.8' }}>
      {/* ========== Page 1: 근로계약서 ========== */}
      <h1 className="text-3xl font-bold text-center mb-8" style={{ textDecoration: 'underline', textUnderlineOffset: '8px' }}>
        {data.taxMethod === 'business' ? '프리랜서 의사 용역계약서' : '일용직(대진) 의사 근로계약서'}
      </h1>

      <p className="mb-8 text-justify">
        <strong>{data.hospitalName || '(병원명)'}</strong> 대표 <strong>{data.directorName || '(대표자명)'}</strong>(이하 "갑"이라 함)와
        의사 <strong>{data.doctorName || '(의사성명)'}</strong>(이하 "을"이라 함)은 다음과 같이 근로계약을 체결하고 이를 성실히 준수할 것을 약정한다.
      </p>

      <div className="space-y-5">
        <section>
          <h3 className="font-bold mb-2">제1조 [목적]</h3>
          <p className="pl-4">"을"은 "갑"이 운영하는 병원에서 의사로서 진료 및 관련 업무를 성실히 수행하며, "갑"은 이에 대한 보수를 지급한다.</p>
        </section>

        <section>
          <h3 className="font-bold mb-2">제2조 [근로장소 및 업무내용]</h3>
          <ol className="list-decimal pl-8 space-y-1">
            <li>
              근무장소: <span className="font-semibold">{data.hospitalName || '________________'}</span>
              ({data.hospitalAddress || '________________'})
            </li>
            <li>업무내용: 외래 진료, 병동 환자 관리 및 기타 병원이 지정하는 진료 관련 업무</li>
          </ol>
        </section>

        <section>
          <h3 className="font-bold mb-2">제3조 [근로일 및 근로시간]</h3>
          <ol className="list-decimal pl-8 space-y-1">
            <li>근로일: <span className="font-semibold">{formattedWorkDates || '________________'}</span></li>
            <li>
              근로시간: <span className="font-semibold">{data.startTime || '09:00'}</span> 부터{' '}
              <span className="font-semibold">{data.endTime || '18:00'}</span> 까지
            </li>
            <li>휴게시간: <span className="font-semibold">{data.breakTime || '13:00 ~ 14:00 (1시간)'}</span></li>
          </ol>
        </section>

        <section>
          <h3 className="font-bold mb-2">제4조 [임금]</h3>
          <ol className="list-decimal pl-8 space-y-1">
            <li>
              일급: <span className="font-bold mx-2">금 {displayWage} 원</span>
              ({displayWageType})
            </li>
            <li>지급방법: 근무 종료 후 당일 지급에 "을"의 계좌로 입금한다.</li>
            <li>
              계좌정보: {data.bankName || '__________'} {data.accountNumber || '__________'}
              (예금주: {data.doctorName || '__________'})
            </li>
          </ol>
        </section>

        <section>
          <h3 className="font-bold mb-2">제5조 [성실의무 및 책임]</h3>
          <p className="pl-4">
            "을"은 의료인으로서의 주의 의무를 다하여 환자를 진료하여야 하며,
            근무 중 병원의 제반 규정을 준수하고 품위를 유지하여야 한다.
          </p>
        </section>

        {hasSpecialConditions && (
          <section>
            <h3 className="font-bold mb-2">제6조 [특약사항]</h3>
            <p className="pl-4 whitespace-pre-wrap">{data.specialConditions}</p>
          </section>
        )}

        <section>
          <h3 className="font-bold mb-2">{hasSpecialConditions ? '제7조' : '제6조'} [기타]</h3>
          <p className="pl-4">본 계약서에 명시되지 않은 사항은 노동관계법령 및 병원의 통상 관례에 따른다.</p>
        </section>
      </div>

      {/* 제1페이지 서명란: 갑(병원) + 을(의사) */}
      <div className="mt-16">
        <p className="text-center mb-8 text-base font-medium">{contractDate}</p>

        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-3">
            <h4 className="font-bold text-lg mb-4 text-center">"갑" (사업주)</h4>
            <div className="flex"><span className="w-20 text-gray-700 shrink-0">상 호</span><span>: {data.hospitalName || '__________'}</span></div>
            <div className="flex"><span className="w-20 text-gray-700 shrink-0">주 소</span><span>: {data.hospitalAddress || '__________'}</span></div>
            <div className="flex items-center mt-6 relative">
              <span className="w-20 text-gray-700 shrink-0">성 명</span>
              <div className="flex-1 flex justify-between items-center border-b border-gray-400 pb-2">
                <span>: {data.directorName || '__________'}</span>
                <div className="relative flex items-center justify-center" style={sigBoxStyle}>
                  <SignatureImage src={data.hospitalSignatureUrl} alt="병원 서명" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-lg mb-4 text-center">"을" (근로자)</h4>
            <div className="flex"><span className="w-24 text-gray-700 shrink-0">주 소</span><span>: {data.doctorAddress || '__________'}</span></div>
            <div className="flex"><span className="w-24 text-gray-700 shrink-0">연락처</span><span>: {data.doctorPhone || '__________'}</span></div>
            <div className="flex"><span className="w-24 text-gray-700 shrink-0">주민등록번호</span><span>: {data.doctorRegistrationNumber || '__________'}</span></div>
            <div className="flex"><span className="w-24 text-gray-700 shrink-0">면허번호</span><span>: {data.doctorLicenseNumber || '__________'}</span></div>
            <div className="flex items-center mt-6 relative">
              <span className="w-24 text-gray-700 shrink-0">성 명</span>
              <div className="flex-1 flex justify-between items-center border-b border-gray-400 pb-2">
                <span>: {data.doctorName || '__________'}</span>
                <div className="relative flex items-center justify-center" style={sigBoxStyle}>
                  <SignatureImage src={data.signatureImageUrl} alt="의사 서명" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== Page 2: 개인정보 동의서 - 의사 서명 ========== */}
      <div className="page-break pt-10 mt-16 border-t-2 border-gray-300">
        <h1 className="text-xl font-bold text-center mb-8" style={{ textDecoration: 'underline', textDecorationThickness: '2px', textUnderlineOffset: '8px' }}>
          개인정보 수집 · 이용 · 제공 동의서
        </h1>

        <p className="mb-6 text-justify">
          <strong>{data.hospitalName || '________'}</strong>(이하 "병원"이라 함)은(는) 근로계약 체결 및 이행을 위하여
          「개인정보 보호법」 제15조 및 제17조에 따라 아래와 같이 귀하의 개인정보를 수집 · 이용 및 제3자에게 제공하고자 합니다.
          내용을 자세히 읽으신 후 동의 여부를 결정하여 주십시오.
        </p>

        <div className="space-y-4">
          <div className="border border-gray-400 p-3">
            <h3 className="font-bold mb-2">1. 개인정보의 수집 및 이용 목적</h3>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>근로계약 체결 및 이행, 임금 지급, 4대보험 신고 및 처리</li>
              <li>원천징수 영수증 발급 등 세무 처리</li>
              <li>기타 인사 · 노무 관리 및 법령상 의무 이행</li>
            </ul>
          </div>
          <div className="border border-gray-400 p-3">
            <h3 className="font-bold mb-2">2. 수집하는 개인정보의 항목</h3>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>필수항목: 성명, 주민등록번호, 주소, 연락처, 면허번호</li>
              <li>선택항목: 계좌번호(급여 지급용)</li>
            </ul>
          </div>
          <div className="border border-gray-400 p-3">
            <h3 className="font-bold mb-2">3. 개인정보의 보유 및 이용 기간</h3>
            <p className="text-xs">수집된 개인정보는 근로계약 종료 후에도 관련 법령에 명시된 보존 기간 동안 보관되며, 보존 기간 종료 후 지체 없이 파기합니다.</p>
          </div>
          <div className="border border-gray-400 p-3">
            <h3 className="font-bold mb-2">4. 동의를 거부할 권리 및 불이익</h3>
            <p className="text-xs">귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 다만, 필수항목 수집에 동의하지 않을 경우 근로계약 체결 및 유지가 불가능할 수 있습니다.</p>
          </div>
        </div>

        <div className="mt-10">
          <p className="text-center mb-8 text-base">{contractDate}</p>
          <div className="flex justify-end pr-8">
            <div className="w-1/2 space-y-2">
              <div className="flex"><span className="w-24 text-gray-600 shrink-0 font-bold">성 명</span><span>: {data.doctorName}</span></div>
              <div className="flex"><span className="w-24 text-gray-600 shrink-0 font-bold">주민등록번호</span><span>: {data.doctorRegistrationNumber || '__________'}</span></div>
              <div className="flex items-center mt-4 relative">
                <span className="w-24 text-gray-600 shrink-0 font-bold">서 명</span>
                <div className="flex-1 flex justify-end items-center border-b border-gray-300 pb-1">
                  <div className="relative flex items-center justify-center" style={sigBoxStyle}>
                    <SignatureImage src={data.signatureImageUrl} alt="의사 서명" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== Page 3: 보안 서약서 - 의사 서명 ========== */}
      {data.includeSecurityPledge !== false && (
        <div className="page-break pt-10 mt-16 border-t-2 border-gray-300">
          <h1 className="text-xl font-bold text-center mb-10" style={{ textDecoration: 'underline', textDecorationThickness: '2px', textUnderlineOffset: '8px' }}>
            개인정보 보호 및 보안 서약서
          </h1>

          <p className="mb-6 text-justify">
            본인은 <strong>{data.hospitalName || '________'}</strong>(이하 "병원"이라 함)에서 근무함에 있어,
            업무 수행 중 알게 된 환자의 개인정보 및 병원의 영업비밀을 보호하기 위하여 다음과 같이 서약합니다.
          </p>

          <div className="space-y-4">
            <div className="border border-gray-400 p-4">
              <h3 className="font-bold mb-2">1. 환자 개인정보 보호</h3>
              <p className="text-xs leading-relaxed">본인은 업무상 취득한 환자의 성명, 주민등록번호, 병력 및 진료기록 등 모든 개인정보를 「개인정보 보호법」 및 「의료법」에 따라 엄격히 보호하며, 진료 목적 외의 용도로 열람하거나 제3자에게 유출하지 않겠습니다.</p>
            </div>
            <div className="border border-gray-400 p-4">
              <h3 className="font-bold mb-2">2. EMR(전자의무기록) 접근 권한 관리</h3>
              <p className="text-xs leading-relaxed">본인에게 부여된 EMR 접근 아이디와 비밀번호를 타인과 공유하지 않으며, 업무 종료 후에는 반드시 로그아웃하여 무단 사용을 방지하겠습니다.</p>
            </div>
            <div className="border border-gray-400 p-4">
              <h3 className="font-bold mb-2">3. 병원 영업비밀 유지</h3>
              <p className="text-xs leading-relaxed">병원의 운영 매뉴얼, 환자 리스트, 경영 정보 등 업무상 알게 된 영업비밀을 재직 중은 물론 퇴직 후에도 외부로 유출하거나 경쟁 병원 등에 공개하지 않겠습니다.</p>
            </div>
            <div className="border border-gray-400 p-4">
              <h3 className="font-bold mb-2">4. 자료의 반납 및 폐기</h3>
              <p className="text-xs leading-relaxed">근무 종료 시 본인이 소지하고 있는 병원 관련 문서, 파일, 저장매체 등 모든 자료를 즉시 반납하거나 복구 불가능한 방법으로 파기하겠습니다.</p>
            </div>
            <div className="border border-gray-400 p-4 bg-gray-50">
              <p className="text-xs leading-relaxed text-center font-bold text-red-600">본인은 위 사항을 위반할 경우 관련 법령에 따른 민·형사상 책임을 질 것을 엄숙히 서약합니다.</p>
            </div>
          </div>

          <div className="mt-16">
            <p className="text-center mb-8 text-base">{contractDate}</p>
            <div className="flex justify-end pr-8">
              <div className="w-1/2 space-y-2">
                <div className="flex"><span className="w-24 text-gray-600 shrink-0 font-bold">소 속</span><span>: 진료부 (대진의)</span></div>
                <div className="flex"><span className="w-24 text-gray-600 shrink-0 font-bold">성 명</span><span>: {data.doctorName}</span></div>
                <div className="flex items-center mt-4 relative">
                  <span className="w-24 text-gray-600 shrink-0 font-bold">서 명</span>
                  <div className="flex-1 flex justify-end items-center border-b border-gray-300 pb-1">
                    <div className="relative flex items-center justify-center" style={sigBoxStyle}>
                      <SignatureImage src={data.signatureImageUrl} alt="의사 서명" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== Page 4: 급여 명세서 - 병원 서명 ========== */}
      {data.includePayStub !== false && (
        <div className="page-break pt-10 mt-16 border-t-2 border-gray-300">
          <h1 className="text-xl font-bold text-center mb-4" style={{ textDecoration: 'underline', textDecorationThickness: '2px', textUnderlineOffset: '8px' }}>
            일용직 급여 명세서
          </h1>
          <p className="text-center text-sm text-gray-500 mb-8">(귀속년월: {yearMonth})</p>

          <div className="mb-4 text-right">
            <h3 className="text-lg font-bold">{data.doctorName} 님 귀하</h3>
          </div>

          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-400 text-sm">
              <tbody>
                <tr>
                  <th className="border border-gray-400 bg-gray-100 p-2 w-1/4">성 명</th>
                  <td className="border border-gray-400 p-2 w-1/4 text-center">{data.doctorName}</td>
                  <th className="border border-gray-400 bg-gray-100 p-2 w-1/4">주민등록번호</th>
                  <td className="border border-gray-400 p-2 w-1/4 text-center">{data.doctorRegistrationNumber || '-'}</td>
                </tr>
                <tr>
                  <th className="border border-gray-400 bg-gray-100 p-2">근무일자</th>
                  <td className="border border-gray-400 p-2 text-center">{formattedWorkDates}</td>
                  <th className="border border-gray-400 bg-gray-100 p-2">근무시간</th>
                  <td className="border border-gray-400 p-2 text-center">{data.startTime || '-'} ~ {data.endTime || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-8">
            <table className="w-full border-collapse border border-gray-400 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-3 w-1/2">지급 내역</th>
                  <th className="border border-gray-400 p-3 w-1/2">공제 내역</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-0 align-top">
                    <div className="flex justify-between p-3 border-b border-dashed border-gray-300">
                      <span>일급</span>
                      <span>{dailyWage > 0 ? dailyWage.toLocaleString() : dailyNet.toLocaleString()} 원</span>
                    </div>
                    <div className="flex justify-between p-3 border-b border-dashed border-gray-300">
                      <span>근무일수</span>
                      <span>{workDayCount}일</span>
                    </div>
                    <div className="flex justify-between p-3 border-b border-dashed border-gray-300">
                      <span>기본급 합계 (세전)</span>
                      <span className="font-bold">{gross > 0 ? gross.toLocaleString() : '-'} 원</span>
                    </div>
                  </td>
                  <td className="border border-gray-400 p-0 align-top">
                    <div className="flex justify-between p-3 border-b border-dashed border-gray-300">
                      <span>{taxMethod === 'business' ? '사업소득세 (3%)' : '일용근로소득세'}</span>
                      <span className="text-red-600">{incomeTax.toLocaleString()} 원</span>
                    </div>
                    <div className="flex justify-between p-3 border-b border-dashed border-gray-300">
                      <span>{taxMethod === 'business' ? '지방소득세 (0.3%)' : '일용지방소득세'}</span>
                      <span className="text-red-600">{localTax.toLocaleString()} 원</span>
                    </div>
                    <div className="flex justify-between p-3 border-b border-dashed border-gray-300 text-gray-400">
                      <span>고용보험</span>
                      <span>(일용직 제외)</span>
                    </div>
                  </td>
                </tr>
                <tr className="bg-gray-50 font-bold">
                  <td className="border border-gray-400 p-3">
                    <div className="flex justify-between">
                      <span>지급 합계 (A)</span>
                      <span>{gross > 0 ? gross.toLocaleString() : '-'} 원</span>
                    </div>
                  </td>
                  <td className="border border-gray-400 p-3">
                    <div className="flex justify-between">
                      <span>공제 합계 (B)</span>
                      <span>{totalDeduction.toLocaleString()} 원</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border-2 border-blue-900 p-6 text-center bg-blue-50 mb-10">
            <h3 className="text-lg font-bold text-gray-600 mb-2">실 수령액 (A - B)</h3>
            <p className="text-3xl font-bold text-blue-900">{netPay.toLocaleString()} 원</p>
          </div>

          <div className="mt-16 text-center">
            <p className="mb-4 font-bold text-lg">귀하의 노고에 깊이 감사드립니다.</p>
            <p className="mb-8">{contractDate}</p>
            <div className="flex justify-center items-center gap-4">
              <span className="font-bold text-lg">{data.hospitalName || '________'} 대표 {data.directorName || '________'}</span>
              <div className="flex items-center justify-center" style={{ width: '150px', height: '100px' }}>
                <SignatureImage src={data.hospitalSignatureUrl} alt="병원 서명" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== Page 5: 성범죄/아동학대 조회 동의서 - 의사 서명 ========== */}
      {data.includeCrimeCheck !== false && (
        <div className="page-break pt-10 mt-16 border-t-2 border-gray-300">
          <h1 className="text-xl font-bold text-center mb-8" style={{ textDecoration: 'underline', textDecorationThickness: '2px', textUnderlineOffset: '8px' }}>
            성범죄 경력 및 아동학대 관련 범죄 전력 조회 동의서
          </h1>

          <p className="mb-4 text-sm text-justify">
            본인은 「아동·청소년의 성보호에 관한 법률」 제56조 및 같은 법 시행령 제25조,
            「아동복지법」 제29조의3 및 같은 법 시행령 제26조의4에 따라,
            아래의 기관장이 본인의 성범죄 경력 및 아동학대 관련 범죄 전력을 조회하는 것에 동의합니다.
          </p>

          <div className="border-2 border-gray-800 p-1 mb-6">
            <table className="w-full border-collapse border border-gray-400 text-sm">
              <tbody>
                <tr>
                  <th rowSpan={4} className="border border-gray-400 bg-gray-100 p-2 w-1/6">동의자<br />(본인)</th>
                  <th className="border border-gray-400 bg-gray-50 p-2 w-1/6">성 명</th>
                  <td className="border border-gray-400 p-2">{data.doctorName}</td>
                </tr>
                <tr>
                  <th className="border border-gray-400 bg-gray-50 p-2">주민등록번호</th>
                  <td className="border border-gray-400 p-2">{data.doctorRegistrationNumber || '-'}</td>
                </tr>
                <tr>
                  <th className="border border-gray-400 bg-gray-50 p-2">주 소</th>
                  <td className="border border-gray-400 p-2">{data.doctorAddress}</td>
                </tr>
                <tr>
                  <th className="border border-gray-400 bg-gray-50 p-2">전화번호</th>
                  <td className="border border-gray-400 p-2">{data.doctorPhone || '-'}</td>
                </tr>
                <tr>
                  <th className="border border-gray-400 bg-gray-100 p-2">조회 대상 기관</th>
                  <th className="border border-gray-400 bg-gray-50 p-2">기관명</th>
                  <td className="border border-gray-400 p-2">{data.hospitalName || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-8">
            <p className="font-bold mb-2 text-sm">※ 관련 법령 확인</p>
            <div className="border border-gray-300 bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
              <strong>「아동·청소년의 성보호에 관한 법률」 제56조</strong> - 성범죄로 확정된 자는 10년간 아동·청소년 관련 업무 종사 불가<br /><br />
              <strong>「아동복지법」 제29조의3</strong> - 아동학대범죄로 확정된 자는 10년간 아동관련기관 취업 불가
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-center mb-8 text-base">{contractDate}</p>
            <div className="flex justify-end pr-8">
              <div className="w-1/2 space-y-2">
                <div className="flex"><span className="w-24 text-gray-600 shrink-0 font-bold">성 명</span><span>: {data.doctorName}</span></div>
                <div className="flex items-center mt-4 relative">
                  <span className="w-24 text-gray-600 shrink-0 font-bold">서 명</span>
                  <div className="flex-1 flex justify-end items-center border-b border-gray-300 pb-1">
                    <div className="relative flex items-center justify-center" style={sigBoxStyle}>
                      <SignatureImage src={data.signatureImageUrl} alt="의사 서명" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h4 className="font-bold text-lg text-center">{data.hospitalName || '________'} 귀중</h4>
          </div>
        </div>
      )}
    </div>
  );
}
