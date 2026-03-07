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
  };
}

export default function DailyContractTemplate({ data }: DailyContractTemplateProps) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 근무일 포맷팅
  const formattedWorkDates = data.workDates && data.workDates.length > 0
    ? data.workDates.map(d => new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })).join(', ') +
      (data.workDates.length > 1 ? ` (총 ${data.workDates.length}일)` : '')
    : '';

  // 급여 표시 로직
  const displayWage = data.wageType === 'gross'
    ? (data.wageGross ? Number(data.wageGross).toLocaleString() : '__________')
    : (data.wageNet ? Number(data.wageNet).toLocaleString() : '__________');

  const displayWageType = data.wageType === 'gross'
    ? '세전 금액, Gross - 3.3% 공제 전'
    : '세후 실수령액, 3.3% 공제 후';

  const hasSpecialConditions = data.specialConditions && data.specialConditions.trim() !== '';

  return (
    <div className="bg-white p-12" style={{ fontFamily: "'Noto Serif KR', serif", fontSize: '14px', lineHeight: '1.8' }}>
      {/* 제목 */}
      <h1 className="text-3xl font-bold text-center mb-8" style={{ textDecoration: 'underline', textUnderlineOffset: '8px' }}>
        일용직(대진) 의사 근로계약서
      </h1>

      {/* 서론 */}
      <p className="mb-8 text-justify">
        <strong>{data.hospitalName || '(병원명)'}</strong> 대표 <strong>{data.directorName || '(대표자명)'}</strong>(이하 "갑"이라 함)와
        의사 <strong>{data.doctorName || '(의사성명)'}</strong>(이하 "을"이라 함)은 다음과 같이 근로계약을 체결하고 이를 성실히 준수할 것을 약정한다.
      </p>

      {/* 조항 */}
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

      {/* 서명란 */}
      <div className="mt-16">
        <p className="text-center mb-8 text-base font-medium">
          {data.createdAt
            ? new Date(data.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
            : today
          }
        </p>

        <div className="grid grid-cols-2 gap-12">
          {/* 갑 (병원) */}
          <div className="space-y-3">
            <h4 className="font-bold text-lg mb-4 text-center">"갑" (사업주)</h4>
            <div className="flex">
              <span className="w-20 text-gray-700 shrink-0">상 호</span>
              <span>: {data.hospitalName || '__________'}</span>
            </div>
            <div className="flex">
              <span className="w-20 text-gray-700 shrink-0">주 소</span>
              <span>: {data.hospitalAddress || '__________'}</span>
            </div>
            <div className="h-16"></div>
            <div className="flex items-center mt-6 relative">
              <span className="w-20 text-gray-700 shrink-0">성 명</span>
              <div className="flex-1 flex justify-between items-center border-b border-gray-400 pb-2">
                <span>: {data.directorName || '__________'}</span>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  {data.hospitalSignatureUrl ? (
                    <img src={data.hospitalSignatureUrl} alt="병원 서명" className="max-h-14 max-w-14 object-contain" />
                  ) : (
                    <span className="text-gray-400 text-sm">(인/서명)</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 을 (의사) */}
          <div className="space-y-3">
            <h4 className="font-bold text-lg mb-4 text-center">"을" (근로자)</h4>
            <div className="flex">
              <span className="w-24 text-gray-700 shrink-0">주 소</span>
              <span>: {data.doctorAddress || '__________'}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-700 shrink-0">연락처</span>
              <span>: {data.doctorPhone || '__________'}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-700 shrink-0">주민등록번호</span>
              <span>: {data.doctorRegistrationNumber || '__________'}</span>
            </div>
            <div className="flex">
              <span className="w-24 text-gray-700 shrink-0">면허번호</span>
              <span>: {data.doctorLicenseNumber || '__________'}</span>
            </div>
            <div className="flex items-center mt-6 relative">
              <span className="w-24 text-gray-700 shrink-0">성 명</span>
              <div className="flex-1 flex justify-between items-center border-b border-gray-400 pb-2">
                <span>: {data.doctorName || '__________'}</span>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  {data.signatureImageUrl ? (
                    <img src={data.signatureImageUrl} alt="의사 서명" className="max-h-14 max-w-14 object-contain" />
                  ) : (
                    <span className="text-gray-400 text-sm">(인/서명)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
