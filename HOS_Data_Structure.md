# HOS Data Structure (Hospital Operating System)

## 개요

**Description**: 
- HOS (Hospital Operating System) 플랫폼의 데이터 구조 설계 문서
- Platform > 사용자 Domain, HOS Domain, 메신저 Domain, B2C Domain 중 HOS Domain을 다루는 데이터 구조 파일
- 시스템 흐름은 다음과 같음:
    1. 사용자 회원가입 (개인정보 본인인증) → 사용자 Domain
    2. 사용자 로그인 (계정 인증) → 사용자 Domain
    3. HOS 접속 후 시스템 사용 (현재 설계 중인 데이터 스트럭처) → HOS Domain
- HOS는 조직 데이터부터 시작하여 '피부 미용' 내장 툴을 위한 데이터 스트럭처를 우선 설계해야 함
- 타 진료 과목은 확장성을 열어두고 설계해야 하며, '피부 미용' 서비스 활성화 후 추가 개발 예정임

## 시스템 흐름

```
A 로그인 > 소속 조직 확인 > Session 발급
-> A가 소속된 조직이 MSO, 병원 2개

피부미용 > A > 고객 > 시술 > 중요한 기능
정형외과 > B > 고객 > 시술 > 중요한 기능
```

## 데이터 구조

```
Platform
│ <!-- HOS는 사용자 개인 정보와 완전 분리된 형태로 독립적 책임을 보유하고 있음. -->
│ <!-- 한 병원에서 진료하는 과목이 두 가지 이상이면 어떻게 하지? -->
├── HOS (Hospital Operating System)
│               │
│               ├── 조직 DB
│               │       │
│               │       ├── Organizaion 데이터
│               │       │                 │ <!-- 사용자 소속 정보 ('퇴사일' 컬럼이 기입되면, 사용자 DB의 '경력' 테이블에 데이터 삽입) -->
│               │       │                 ├── Member Information
│               │       │                 │                   ├── ID
│               │       │                 │                   ├── UUID
│               │       │                 │                   ├── is_Active
│               │       │                 │                   ├── Personal Information ID
│               │       │                 │                   ├── Organization ID
│               │       │                 │                   ├── 소속 상태 ['ENUM'] ('근무', '퇴사', '휴직')
│               │       │                 │                   ├── Member Abled Permission Set [JSON/ARRAY]  # 개별 추가 권한(최우선 고려 대상)
│               │       │                 │                   ├── Member Disabled Permission Set [JSON/ARRAY] # 개별 제외 권한(최우선 고려 대상)
│               │       │                 │                   ├── 입사일 [DATE]
│               │       │                 │                   ├── 퇴사일 [DATE]
│               │       │                 │                   ├── 급여 정보 연결
│               │       │                 │                   ├── 성과 정보 연결
│               │       │                 │                   ├── 연차 및 휴가 정보 연결
│               │       │                 │                   ├── 등등
│               │       │                 │                   ├── 생성 일시
│               │       │                 │                   └── 수정 일시
│               │       │                 │
│               │       │                 │
│               │       │                 │ <!-- 멤버 개별 권한 추가/제거에 대한 히스토리 -->
│               │       │                 ├── Member_Permission History
│               │       │                 │                   ├── ID
│               │       │                 │                   ├── UUID
│               │       │                 │                   ├── Member ID
│               │       │                 │                   ├── Changed_By_Member ID
│               │       │                 │                   ├── Permission Key
│               │       │                 │                   ├── Action Type ('ADD', 'REMOVE')[ENUM]
│               │       │                 │                   ├── 변경 사유 [TEXT]
│               │       │                 │                   ├── IP Address
│               │       │                 │                   ├── User Agent
│               │       │                 │                   ├── 생성 일시 [TIMESTAMP]
│               │       │                 │                   └── 수정 일시 [TIMESTAMP]
│               │       │                 │
│               │       │                 │
│               │       │                 │ <!-- 조직 정의 -->
│               │       │                 ├── Organizaion Definition
│               │       │                 │                       ├── ID
│               │       │                 │                       ├── UUID
│               │       │                 │                       ├── is_Active
│               │       │                 │                       ├── Personal Infomation ID (조직 대표자 ID)
│               │       │                 │                       ├── parent ID (MSO - 병원 물리적 종속성을 위한 컬럼)
│               │       │                 │                       ├── 조직 유형 [ENUM] ('MSO', 'H_법인', 'H_개인', '의료법인_법인')
│               │       │                 │                       ├── 조직 이름
│               │       │                 │                       ├── 조직 설명
│               │       │                 │                       ├── 주소
│               │       │                 │                       ├── 전화번호
│               │       │                 │                       ├── 도메인 주소
│               │       │                 │                       ├── Organization Operating Information ID (조직 운영 정보 UUID)
│               │       │                 │                       ├── Organization Available Permission Set [JSON/ARRAY]
│               │       │                 │                       ├── Organization Disavailable Permission Set [JSON/ARRAY]
│               │       │                 │                       ├── 사업자 등록증
│               │       │                 │                       ├── 사업자 등록증 사본
│               │       │                 │                       ├── 사업자 등록증 인증 여부 [Boolean]
│               │       │                 │                       ├── 승인 담당자 ID (Account ID OR Personal Information ID)
│               │       │                 │                       ├── 로고
│               │       │                 │                       ├── 생성 일시
│               │       │                 │                       └── 수정 일시
│               │       │                 │
│               │       │                 │ <!-- 조직 운영 정보 -->
│               │       │                 ├── Organization Operating Information
│               │       │                 │                                   ├── ID
│               │       │                 │                                   ├── UUID
│               │       │                 │                                   ├── is_Active
│               │       │                 │                                   ├── 진료 과목 [ENUM/ARRAY] (NULL 허용)
│               │       │                 │                                   ├── 평일 운영 시작 시간
│               │       │                 │                                   ├── 평일 운영 종료 시간
│               │       │                 │                                   ├── 토요일 운영 시작 시간
│               │       │                 │                                   ├── 토요일 운영 종료 시간
│               │       │                 │                                   ├── 일요일 운영 시작 시간
│               │       │                 │                                   ├── 일요일 운영 종료 시간
│               │       │                 │                                   ├── 공휴일 운영 시작 시간
│               │       │                 │                                   ├── 공휴일 운영 종료 시간
│               │       │                 │                                   ├── 점심(휴게) 시작 시간
│               │       │                 │                                   ├── 점심(휴게) 종료 시간
│               │       │                 │                                   ├── 정기 휴무 안내
│               │       │                 │                                   ├── 야간 진료 시작 시간
│               │       │                 │                                   ├── 야간 진료 종료 시간
│               │       │                 │                                   ├── 운영 시간 부가 설명 [TEXT]
│               │       │                 │                                   ├── 운영용 이메일
│               │       │                 │                                   ├── 주차 가능 여부
│               │       │                 │                                   ├── 주차 안내 설명
│               │       │                 │                                   ├── 생성 일시
│               │       │                 │                                   └── 수정 일시
│               │       │                 │
│               │       │                 │
│               │       │                 │ <!-- 멤버를 어떤 팀의 어떤 역할에 배정할 지에 대한 정의 -->
│               │       │                 ├── Member_Team_Role Assignment
│               │       │                 │                         ├── ID
│               │       │                 │                         ├── UUID
│               │       │                 │                         ├── is_Active
│               │       │                 │                         ├── Member ID
│               │       │                 │                         ├── Team ID
│               │       │                 │                         ├── Role ID
│               │       │                 │                         ├── 배정 일자 [Date]
│               │       │                 │                         ├── 배정 해제 일자 [Date]
│               │       │                 │                         ├── 배정 사유 [Text]
│               │       │                 │                         ├── 배정 해제 사유 [Text]
│               │       │                 │                         ├── 생성 일시
│               │       │                 │                         └── 수정 일시
│               │       │                 │
│               │       │                 │
│               │       │                 │ <!-- Role에서 기본 권한 프리셋 관리 및 멤버 역할 정의 -->
│               │       │                 ├── Role
│               │       │                 │      ├── ID
│               │       │                 │      ├── UUID
│               │       │                 │      ├── Organization ID
│               │       │                 │      ├── Role Permission Set [JSON/ARRAY]
│               │       │                 │      ├── Role 이름
│               │       │                 │      ├── Role 설명
│               │       │                 │      ├── 생성 일시
│               │       │                 │      └── 수정 일시
│               │       │                 │
│               │       │                 │
│               │       │                 │ <!-- 조직 내 사용하는 '팀(예: 상담팀, 간호팀)'에 대한 정의. -->
│               │       │                 │ <!-- 팀 내 Role이 포함되어 있는 구조. 다양한 역할을 가진 사용자면 여러 팀에 속할 수 있음. -->
│               │       │                 ├── Team
│               │       │                 │      ├── ID
│               │       │                 │      ├── UUID
│               │       │                 │      ├── is_Active
│               │       │                 │      ├── Organization ID
│               │       │                 │      ├── Role IDs [ARRAY] # 이 팀에서 할당 가능한 역할들
│               │       │                 │      ├── Team 이름
│               │       │                 │      ├── Team 설명
│               │       │                 │      ├── 생성 일시
│               │       │                 │      └── 수정 일시
│               │       │                 │
│               │       │                 │
│               │       │                 │ <!-- 조직 내 규약 문서: 이걸 어떤 형태로 보관해야 할지 고민할 필요가 있음. -->
│               │       │                 ├── Organization Documentation
│               │       │                 │                           ├── ID
│               │       │                 │                           ├── UUID
│               │       │                 │                           ├── is_Active
│               │       │                 │                           ├── Organization ID
│               │       │                 │                           ├── 문서 파일명
│               │       │                 │                           ├── 문서 URL # Storage
│               │       │                 │                           ├── 문서 유형 ('환불 정책', '가격 정책' 등등) [ENUM]
│               │       │                 │                           ├── 생성 일시
│               │       │                 │                           └── 수정 일시
│               │       │                 │      
│               │       │                 │
│               │       │                 │ <!-- 조직에 방문한 고객 데이터 -->
│               │       │                 ├── Customer 데이터
│               │       │                 │              │ <!-- 조직에 방문한 고객의 인적 사항 -->
│               │       │                 │              ├── Customer Information
│               │       │                 │              │                     ├── ID
│               │       │                 │              │                     ├── UUID
│               │       │                 │              │                     ├── is_Active
│               │       │                 │              │                     ├── Personal Information ID
│               │       │                 │              │                     ├── Organization ID
│               │       │                 │              │                     ├── Customer TMP ID
│               │       │                 │              │                     ├── 고객 이름
│               │       │                 │              │                     ├── 성별
│               │       │                 │              │                     ├── 고객 전화번호
│               │       │                 │              │                     ├── 고객 보호자 전화번호
│               │       │                 │              │                     ├── 고객 생년월일
│               │       │                 │              │                     ├── 고객 주민등록번호
│               │       │                 │              │                     ├── 주소
│               │       │                 │              │                     ├── 상세 주소
│               │       │                 │              │                     ├── 고객 차트번호
│               │       │                 │              │                     ├── 생성 일시
│               │       │                 │              │                     └── 수정 일시
│               │       │                 │              │
│               │       │                 │              │ <!-- 고객 시술 이력 -->
│               │       │                 │              ├── Customer Procedure Information
│               │       │                 │              │                               ├── ID
│               │       │                 │              │                               ├── UUID
│               │       │                 │              │                               ├── Organization ID [FK]
│               │       │                 │              │                               ├── Customer ID [FK]
│               │       │                 │              │                               ├── 시술 출처 병원 [ENUM]
│               │       │                 │              │                               ├── Procedure Element ID
│               │       │                 │              │                               ├── 시술 부위 [STRING]
│               │       │                 │              │                               ├── 시술 일시 [DATETIME][NULL]
│               │       │                 │              │                               ├── 담당의 Member ID [FK][NULL]
│               │       │                 │              │                               ├── Medical Record ID [FK][NULL]
│               │       │                 │              │                               ├── 시술 일시 추정 일자 [DATE]
│               │       │                 │              │                               ├── 환자 진술 여부 [BOOLEAN]
│               │       │                 │              │
│               │       │                 │              │
│               │       │                 │              │ <!-- 고객 의료 안전 체크 정보 -->
│               │       │                 │              ├── Customer Medical Safety Information
│               │       │                 │              │                                    ├── ID
│               │       │                 │              │                                    ├── UUID
│               │       │                 │              │                                    ├── is_Active
│               │       │                 │              │                                    ├── Customer Information ID
│               │       │                 │              │                                    ├── 혈액형 [ENUM][NULL]
│               │       │                 │              │                                    ├── 알레르기 정보/진술 [JSON/ARRAY]
│               │       │                 │              │                                    ├── 기저질환 정보/진술 [JSON/ARRAY]
│               │       │                 │              │                                    ├── 복용 약물 진술 [JSON/ARRAY][NULL]
│               │       │                 │              │                                    ├── 임신 여부 [BOOLEAN]
│               │       │                 │              │                                    ├── 최근 업데이트 담당자 Member ID [FK]
│               │       │                 │              │                                    ├── 최근 업데이트 일시 [DATETIME]
│               │       │                 │              │                                    ├── 생성 일시
│               │       │                 │              │                                    └── 수정 일시
│               │       │                 │              │
│               │       │                 │              │ <!-- 처방전 -->
│               │       │                 │              ├── Prescription
│               │       │                 │              │             ├── ID
│               │       │                 │              │             ├── UUID
│               │       │                 │              │             ├── is_Active
│               │       │                 │              │
│               │       │                 │              │
│               │       │                 │              │ <!-- 처방 약물 상세 정보 -->
│               │       │                 │              ├── Prescription Drug
│               │       │                 │              │                  ├── ID
│               │       │                 │              │                  ├── UUID
│               │       │                 │              │                  ├── is_Active
│               │       │                 │              │
│               │       │                 │              │
│               │       │                 │              │ <!-- 고객이 한 번 방문했을 때의 히스토리 -->
│               │       │                 │              ├── Customer Visit History
│               │       │                 │              │                       ├── ID
│               │       │                 │              │                       ├── UUID
│               │       │                 │              │                       ├── is_Active
│               │       │                 │              │                       ├── Customer Information ID
│               │       │                 │              │                       ├── Customer TMP ID
│               │       │                 │              │                       ├── 방문 유형 ('예약 방문', '당일 방문' 등등) [ENUM]
│               │       │                 │              │                       ├── 체크인 일자 [DATE]
│               │       │                 │              │                       ├── 체크인 시간 [TIME]
│               │       │                 │              │                       ├── 체크아웃 일자 [DATE]
│               │       │                 │              │                       ├── 체크아웃 시간 [TIME]
│               │       │                 │              │                       ├── 총 체류시간(분)
│               │       │                 │              │                       ├── 당일 직원 메모
│               │       │                 │              │                       ├── 다음 예약 일자
│               │       │                 │              │                       ├── 다음 예약 시간
│               │       │                 │              │                       ├── 생성 일시
│               │       │                 │              │                       └── 수정 일시
│               │       │                 │              │ 
│               │       │                 │              │
│               │       │                 │              │ <!-- 고객이 소지한 멤버십 정보 -->
│               │       │                 │              ├── Customer Purchase Membership
│               │       │                 │              │                             ├── ID
│               │       │                 │              │                             ├── UUID
│               │       │                 │              │                             ├── is_Active
│               │       │                 │              │                             ├── Customer Information ID
│               │       │                 │              │                             ├── Customer TMP ID
│               │       │                 │              │                             ├── Membership ID
│               │       │                 │              │                             ├── 멤버십 추가 시술 완료 여부 [Boolean]
│               │       │                 │              │                             ├── 맴버십 구매 일시
│               │       │                 │              │                             ├── 맴버십 유효 시작일
│               │       │                 │              │                             ├── 맴버십 유효 종료일
│               │       │                 │              │                             ├── 멤버십 구매 금액
│               │       │                 │              │                             ├── 보너스 적립금    # 가격이 적립금보다 먼저 소모되도록 (적립금 먹튀 방지)
│               │       │                 │              │                             ├── 남은 금액
│               │       │                 │              │                             ├── 맴버십 사용 상태 ('사용 중', '취소', '만료', '환불') [ENUM]
│               │       │                 │              │                             ├── 멤버십 정책 동의 여부 [Boolean]
│               │       │                 │              │                             ├── 생성일자
│               │       │                 │              │                             └── 수정일자
│               │       │                 │              │
│               │       │                 │              │
│               │       │                 │              │
│               │       │                 │              │
│               │       │                 │
│               │       │                 │
│               │       │                 │
│               │       │                 │ <!-- 조직 운영 데이터 -->
│               │       │                 ├── Operation 데이터
│               │       │                 │               │
│               │       │                 │               │ <!-- 예약 관리 -->
│               │       │                 │               ├── Appointment Management
│               │       │                 │               │                     │ <!-- 예약 내역: 알림도 보내줘야 함. 이건 Notification에서 관리-->
│               │       │                 │               │                     ├── Appointment
│               │       │                 │               │                     │            ├── ID
│               │       │                 │               │                     │            ├── UUID
│               │       │                 │               │                     │            ├── is_Active
│               │       │                 │               │                     │            ├── Organization ID
│               │       │                 │               │                     │            ├── Customer Information ID
│               │       │                 │               │                     │            ├── 예약 일자 [DATE]
│               │       │                 │               │                     │            ├── 예약 시작 시간 [TIME]
│               │       │                 │               │                     │            ├── 예약 종료 시간 [TIME]
│               │       │                 │               │                     │            ├── 예약 승인 담장자 Member ID
│               │       │                 │               │                     │            ├── 예약 승인 일시 [DATETIME]
│               │       │                 │               │                     │            ├── Appointment Status ID [INTEGER][FK]
│               │       │                 │               │                     │            ├── Appointment Channel ID [INTEGER][FK]
│               │       │                 │               │                     │            ├── 예약 고객 요구사항 [TEXT]
│               │       │                 │               │                     │            ├── 예약 시술 ID [JSON/ARRAY]
│               │       │                 │               │                     │            ├── 생성 일시
│               │       │                 │               │                     │            └── 수정 일시
│               │       │                 │               │                     │
│               │       │                 │               │                     │
│               │       │                 │               │                     │ <!-- 예약 취소 관리 -->
│               │       │                 │               │                     ├── Appointment Cancellation
│               │       │                 │               │                     │                         ├── ID
│               │       │                 │               │                     │                         ├── UUID
│               │       │                 │               │                     │                         ├── is_Active
│               │       │                 │               │                     │                         ├── Appointment ID
│               │       │                 │               │                     │                         ├── Customer Information ID
│               │       │                 │               │                     │                         ├── Organization ID
│               │       │                 │               │                     │                         ├── Appointment Cancell Reason ID [INTEGER]
│               │       │                 │               │                     │                         ├── 예약 취소 상세 사유 [TEXT]
│               │       │                 │               │                     │                         ├── 취소 담당자 Member ID
│               │       │                 │               │                     │                         ├── 예약 취소 주체자 ('고객','병원') [ENUM]
│               │       │                 │               │                     │                         ├── 예약 취소 주체자 Member ID
│               │       │                 │               │                     │                         ├── 원래 예약 일시 [DATETIME]
│               │       │                 │               │                     │                         ├── 원래 예약 시술 ID [JSON/ARRAY]
│               │       │                 │               │                     │                         ├── 예약 취소 알림 발송 여부
│               │       │                 │               │                     │                         ├── 생성 일시
│               │       │                 │               │                     │                         └── 수정 일시
│               │       │                 │               │                     │
│               │       │                 │               │                     │
│               │       │                 │               │                             
│               │       │                 │               │                             
│               │       │                 │               │                             
│               │       │                 │               │                     
│               │       │                 │               │                     
│               │       │                 │               │ <!-- 방문 관리 -->
│               │       │                 │               ├── Visit Management    
│               │       │                 │               │                 │ <!-- 고객 방문시 인포데스크(코디네이터)에서 확인하고 입력하는 데이터 -->    
│               │       │                 │               │                 ├── Customer Visit History
│               │       │                 │               │                 │                       ├── ID
│               │       │                 │               │                 │                       ├── UUID
│               │       │                 │               │                 │                       ├── is_Active
│               │       │                 │               │                 │                       ├── Organization ID
│               │       │                 │               │                 │                       ├── Customer Information ID
│               │       │                 │               │                 │                       ├── Appointment ID [INTEGER][NULL]
│               │       │                 │               │                 │                       ├── 방문 시간
│               │       │                 │               │                 │
│               │       │                 │               │                 │
│               │       │                 │               │                 │ <!-- 고객이 방문했을 때, 현재 어디에서 뭘하고 있는지를 나타내기 위한 테이블 -->
│               │       │                 │               │                 ├── Visit Status Tracking
│               │       │                 │               │                 │
│               │       │                 │               │                 │
│               │       │                 │               │                 │
│               │       │                 │               │                 ├──             
│               │       │                 │               │                     
│               │       │                 │               │                     
│               │       │                 │               │ <!-- 고객 아웃바운드 관리 -->
│               │       │                 │               ├── Leave Management
│               │       │                 │               │                 ├── 
│               │       │                 │               │                 │
│               │       │                 │               │                 ├──
│               │       │                 │               │                 │
│               │       │                 │               │                 ├──
│               │       │                 │               │                 │
│               │       │                 │               │                 ├──
│               │       │                 │               │
│               │       │                 │
│               │       │                 │
│               │       │                 │
│               │       │                 │ <!-- 조직 내 상담 데이터 -->
│               │       │                 ├── Consultation 데이터
│               │       │                 │                  │ <!-- 한 번의 상담 세션에 대한 기록 -->
│               │       │                 │                  ├── Consultation Session
│               │       │                 │                  │                     ├── ID
│               │       │                 │                  │                     ├── UUID
│               │       │                 │                  │                     ├── Organization ID
│               │       │                 │                  │                     ├── 상담 담당자 Member ID
│               │       │                 │                  │                     ├── Customer Information ID
│               │       │                 │                  │                     │
│               │       │                 │                  │                     ├── 상담 시작 시간 [TIMESTAMP]
│               │       │                 │                  │                     ├── 상담 종료 시간 [TIMESTAMP]
│               │       │                 │                  │                     ├── 상담 소요 시간(분) [INTEGER]
│               │       │                 │                  │                     ├── 예약 상담 여부 [Boolean]
│               │       │                 │                  │                     │
│               │       │                 │                  │                     ├── 고객 유형 ID [FK][INTEGER]
│               │       │                 │                  │                     ├── 유입 마케팅 채널 ID [FK][INTEGER][NULL]
│               │       │                 │                  │                     ├── 고객 유입 경로 ID [FK][INTEGER][NULL]
│               │       │                 │                  │                     ├── 고객 고민 정보[JSON][NULL]
│               │       │                 │                  │                     │   # { 고민 유형, 상세, 우선순위, 목표시술 }
│               │       │                 │                  │                     ├── 
│               │       │                 │                  │                     ├── 당시 알레르기 확인 여부 [BOOLEAN]
│               │       │                 │                  │                     ├── 알레르기 [JSON/ARRAY]
│               │       │                 │                  │                     │   # { 상병코드, 알레르기명, 수집 일시 }
│               │       │                 │                  │                     ├── 당시 기저질환 확인 여부 [BOOLEAN]
│               │       │                 │                  │                     ├── 기저질환 [JSON/ARRAY]
│               │       │                 │                  │                     │   # { 상병코드, 기저질환명, 수집 일시 }
│               │       │                 │                  │                     │
│               │       │                 │                  │                     ├── 당시 약 복용 여부 [Boolean]
│               │       │                 │                  │                     ├── 당시 복용 약물 [JSON/ARRAY]
│               │       │                 │                  │                     │   # { 식별코드, 약물명, 수집일시 }
│               │       │                 │                  │                     ├── 임신 가능성 확인 여부 [Boolean]
│               │       │                 │                  │                     ├── 당시 고객 임신 여부 [Boolean]
│               │       │                 │                  │                     ├── 
│               │       │                 │                  │                     ├── 고객 타 병원 시술 이력 [JSON/ARRAY][NULL]
│               │       │                 │                  │                     │   # { 시술 유형, 시술 명, 시술 시기, 부작용 여부, 특이사항 }
│               │       │                 │                  │                     │   # Procedure Element를 기반으로 데이터 불러오기
│               │       │                 │                  │                     │
│               │       │                 │                  │                     ├── 상담 상세 내용 [TEXT]
│               │       │                 │                  │                     ├── 중요 특이 사항 [TEXT]
│               │       │                 │                  │                     │
│               │       │                 │                  │                     ├── 고객 구매 상품 [JSON/ARRAY]
│               │       │                 │                  │                     │   # { 상품유형, 상품명, 수량, 단가, 총 금액 }
│               │       │                 │                  │                     │   # Product 테이블을 기반으로 데이터 불러오기
│               │       │                 │                  │                     ├── 업셀링 여부 [Boolean]
│               │       │                 │                  │                     │
│               │       │                 │                  │                     ├── 고객 구매 상품 총액 [INTEGER][NULL]
│               │       │                 │                  │                     ├── 추가 할인율 [FLOAT] # Range: 1% ~ 10%
│               │       │                 │                  │                     ├── 결제 유형 ID
│               │       │                 │                  │                     ├── 최종 결제액 [INTEGER][NULL]
│               │       │                 │                  │                     ├── 결제 완료 여부 [BOOLEAN]
│               │       │                 │                  │                     │
│               │       │                 │                  │                     ├── 생성 일시
│               │       │                 │                  │                     └── 수정 일시
│               │       │                 │                  │   
│               │       │                 │                  │   
│               │       │                 │                  │
│               │       │                 │                  │   
│               │       │                 │                  │   
│               │       │                 │                  │   
│               │       │                 │                  │   
│               │       │                 │                  │   
│               │       │                 │                  │   
│               │       │                 │                                     
│               │       │                 │                                     
│               │       │                 │                                     
│               │       │                 │                                     
│               │       │                 │                                     
│               │       │                 │                                     
│               │       │                 │                                     
│               │       │                 │
│               │       │                 ├── 간호 데이터
│               │       │                 │
│               │       │                 │
│               │       │                 ├── 피부 데이터
│               │       │                 │ 
│               │       │                 │ 
│               │       │                 ├── 경영 데이터
│               │       │                 │         ├── 각 팀 보고서
│               │       │                 │         ├── 매출 데이터
│               │       │                 │         ├── 각종 문서 데이터
│               │       │                 │         ├── 
│               │       │                 │         
│               │       │                 ├── Product 데이터
│               │       │                 │             │ <!-- 여기서 기입되는 고객 정보는 고객 데이터 쪽으로 삽입 -->
│               │       │                 │             ├── 일반 상품
│               │       │                 │             │        ├── ID
│               │       │                 │             │        ├── UUID
│               │       │                 │             │        ├── is_Active
│               │       │                 │             │        ├── Package Type ID [INTEGER][ENUM]
│               │       │                 │             │        ├── Procedure Element ID
│               │       │                 │             │        ├── Procedure Bundle ID
│               │       │                 │             │        ├── Procedure Custom ID
│               │       │                 │             │        ├── Procedure Sequence ID
│               │       │                 │             │        ├── Standard Info ID
│               │       │                 │             │        ├── 시술자 지정 정보 ID [INTEGER] # ENUM으로 할지 안 할지
│               │       │                 │             │        ├── 상품 원가
│               │       │                 │             │        ├── 실 판매가
│               │       │                 │             │        ├── 부가세
│               │       │                 │             │        ├── 할인율
│               │       │                 │             │        ├── 상품 정상가
│               │       │                 │             │        ├── 마진값
│               │       │                 │             │        ├── 마진율
│               │       │                 │             │        ├── 상품 노출 시작일
│               │       │                 │             │        ├── 상품 노출 최종일
│               │       │                 │             │        ├── 유효기간
│               │       │                 │             │        ├── Covered Type ID [INTEGER][ENUM]
│               │       │                 │             │        ├── Taxable Type ID [INTEGER][ENUM]
│               │       │                 │             │        ├── 생성 일시
│               │       │                 │             │        └── 수정 일시
│               │       │                 │             │
│               │       │                 │             │
│               │       │                 │             ├── 이벤트 상품
│               │       │                 │             │         ├── ID
│               │       │                 │             │         ├── UUID
│               │       │                 │             │         ├── is_Active
│               │       │                 │             │         ├── Package Type ID [INTEGER][ENUM]
│               │       │                 │             │         ├── Procedure Element ID
│               │       │                 │             │         ├── Procedure Bundle ID
│               │       │                 │             │         ├── Procedure Custom ID
│               │       │                 │             │         ├── Procedure Sequence ID
│               │       │                 │             │         ├── Event Info ID
│               │       │                 │             │         ├── 시술자 지정 정보 ID [INTEGER] # ENUM으로 할지 안 할지
│               │       │                 │             │         ├── 상품 원가
│               │       │                 │             │         ├── 실 판매가
│               │       │                 │             │         ├── 부가세
│               │       │                 │             │         ├── 할인율
│               │       │                 │             │         ├── 상품 정상가
│               │       │                 │             │         ├── 마진값
│               │       │                 │             │         ├── 마진율
│               │       │                 │             │         ├── 이벤트 시작일
│               │       │                 │             │         ├── 이벤트 최종일
│               │       │                 │             │         ├── 유효기간
│               │       │                 │             │         ├── Covered Type ID [INTEGER][ENUM]
│               │       │                 │             │         ├── Taxable Type ID [INTEGER][ENUM]
│               │       │                 │             │         ├── 생성 일시
│               │       │                 │             │         └── 수정 일시
│               │       │                 │             │
│               │       │                 │             │
│               │       │                 │             └── Product Membership
│               │       │                 │                                 ├── ID
│               │       │                 │                                 ├── UUID
│               │       │                 │                                 ├── is_Active
│               │       │                 │                                 ├── Organizaiton ID
│               │       │                 │                                 ├── 멤버십 상품 이름
│               │       │                 │                                 ├── 맴버십 상품 설명
│               │       │                 │                                 ├── 멤버십 추가 혜택 Product Standard ID
│               │       │                 │                                 ├── 멤버십 가격
│               │       │                 │                                 ├── 적용 할인율 [FLOAT]
│               │       │                 │                                 ├── 멤버십 유효 기간 (일)
│               │       │                 │                                 ├── 멤버십 보너스 적립금
│               │       │                 │                                 ├── 멤버십 판매 시작일
│               │       │                 │                                 ├── 멤버십 판매 종료일
│               │       │                 │                                 ├── Organization Documentation ID   # 관련 정책 문서 ID
│               │       │                 │                                 ├── 생성 일시
│               │       │                 │                                 └── 수정 일시
│               │       │                 │              
│               │       │                 │              
│               │       │                 │              
│               │       │                 │              
│               │       │                 │              
│               │       │                 │              
│               │       │                 │              
│               │       │                 │              
│               │       │                 │              
│               │       │                 │                     
│               │       │                 │                             
│               │       │                 ├── Procedure 데이터
│               │       │                 │               │ <!-- 시술 최소 단위 (예시: 블랙필 1회, 블랙필 3회, 보톡스 1바이알) -->
│               │       │                 │               ├── Element (단일 시술)
│               │       │                 │               │                 ├── ID
│               │       │                 │               │                 ├── UUID
│               │       │                 │               │                 ├── is_Active
│               │       │                 │               │                 ├── 시술 대분류 ID [INTEGER][ENUM]
│               │       │                 │               │                 ├── 시술 중분류 ID [INTEGER][ENUM]
│               │       │                 │               │                 ├── 시술 소분류 ID [INTEGER][ENUM]
│               │       │                 │               │                 ├── 시술 속성 ID [INTEGER][ENUM]
│               │       │                 │               │                 ├── 단일 시술 이름
│               │       │                 │               │                 ├── 단일 시술 설명
│               │       │                 │               │                 ├── 시술자 타입 ID [INTEGER][ENUM]
│               │       │                 │               │                 ├── 시술 소요시간(분) [INTEGER]
│               │       │                 │               │                 ├── 플랜 여부 [BOOLEAN]
│               │       │                 │               │                 │
│               │       │                 │               │                 │   # IF 시술 명 = '흑자 5mm 기준 5개' 라면, 플랜 여부는 1이고, 플랜 횟수는 5여야 함.
│               │       │                 │               │                 ├── 플랜 횟수 [INTEGER]
│               │       │                 │               │                 ├── 시술 주기 [INTEGER]   # 해당 시술은 얼마만큼의 주기로 재시술 받을 수 있는가
│               │       │                 │               │                 ├── Consumable ID [INTEGER]  # 이 시술에는 어떤 소모품이 사용되는가
│               │       │                 │               │                 ├── 시술 플랜 1회당 소모품 소모 개수 # 1회의 시술당 소모품 몇 개가 소모되는가
│               │       │                 │               │                 ├── 시술 난이도 ID [INTEGER][ENUM] # 매우 쉬움 ~ 매우 어려움
│               │       │                 │               │                 │
│               │       │                 │               │                 │   # 인건비 * 소요시간 * 플랜횟수(플랜 여부가 True일 때) + 소모품 가격 * 소모품 개수
│               │       │                 │               │                 ├── 시술 원가 [INTEGER]
│               │       │                 │               │                 ├── 시술 가격 [INTEGER] # 마진을 남기기 위한 시술 가격
│               │       │                 │               │                 │  
│               │       │                 │               │                 ├── 생성 일시
│               │       │                 │               │                 └── 수정 일시
│               │       │                 │               │
│               │       │                 │               │
│               │       │                 │               │ <!-- Element끼리의 묶음 (예시: 필패키지 = 블랙필 3회 + 라라필 3회) -->
│               │       │                 │               ├── Bundle (패키지)
│               │       │                 │               │              ├── Group ID
│               │       │                 │               │              ├── ID
│               │       │                 │               │              ├── UUID
│               │       │                 │               │              ├── is_Active
│               │       │                 │               │              ├── 번들 이름
│               │       │                 │               │              ├── 번들 설명
│               │       │                 │               │              ├── Procedure Element ID
│               │       │                 │               │              │   # 묶인 Element 원가의 합
│               │       │                 │               │              ├── 시술 원가
│               │       │                 │               │              ├── 시술 가격 비율 [FLOAT] # 어떤 Element가 높은 비율을 차지하는가
│               │       │                 │               │              ├── 생성 일시
│               │       │                 │               │              └── 수정 일시
│               │       │                 │               │
│               │       │                 │               │
│               │       │                 │               │ <!-- 방식이 여러 개인 Element (예시: ldm, 블랙필, 라라필 중 택 1 ) -->
│               │       │                 │               ├── Custom (커스텀)
│               │       │                 │               │              ├── Group ID
│               │       │                 │               │              ├── ID
│               │       │                 │               │              ├── UUID
│               │       │                 │               │              ├── is_Active
│               │       │                 │               │              ├── 커스텀 이름
│               │       │                 │               │              ├── 커스텀 설명
│               │       │                 │               │              ├── Procedure Element ID [INTEGER]
│               │       │                 │               │              ├── 시술 횟수
│               │       │                 │               │              ├── 개별 횟수 제한
│               │       │                 │               │              ├── 시술 원가
│               │       │                 │               │              ├── 시술 가격비율
│               │       │                 │               │              ├── 생성 일시
│               │       │                 │               │              └── 수정 일시
│               │       │                 │               │
│               │       │                 │               │
│               │       │                 │               │ <!-- Element들의 묶음, Bundle + Element의 묶음 (예시: 필패키지 + 보톡스 1바이알) -->
│               │       │                 │               └── Sequence (시퀀스)
│               │       │                 │                                ├── Group ID
│               │       │                 │                                ├── ID
│               │       │                 │                                ├── UUID
│               │       │                 │                                ├── is_Active
│               │       │                 │                                ├── 순번 # 시퀀스 시술 내 순번
│               │       │                 │                                ├── Procedure Element ID [INTEGER][NULL]
│               │       │                 │                                ├── Procedure Bundle ID [INTEGER][NULL]
│               │       │                 │                                ├── Procedure Custom ID [INTEGER][NULL]
│               │       │                 │                                ├── 재방문 주기
│               │       │                 │                                ├── 시술 원가
│               │       │                 │                                ├── 시술 가격 비율
│               │       │                 │                                ├── 생성 일시
│               │       │                 │                                └── 수정 일시
│               │       │                 │       
│               │       │                 │       
│               │       │                 │       
│               │       │                 ├── 재고 데이터 (시술 소모품 + 아이템 소모품을 구분지어야 함.)
│               │       │                 │       
│               │       │                 │       
│               │       │                 │       
│               │       │                 │       
│               │       │                 ├── 인사 데이터
│               │       │                 │         │
│               │       │                 │         ├── 인건비 (의사 인건비 + 간호사 인건비 등등)
│               │       │                 │         ├── 성과
│               │       │                 │         ├── 인사에서 주로 보는 것들
│               │       │                 │         │
│               │       │                 │         │ <!-- 계약서 관리 모듈 (현재 개발 중) -->
│               │       │                 │         ├── contracts (의사 일용직 근로계약서)
│               │       │                 │         ├── labor_contracts (일반 근로계약서)
│               │       │                 │         ├── contract_invitations
│               │       │                 │         └── labor_contract_invitations
│               │       │                 │
│               │       │                 │
│               │       │                 ├── 장비 데이터
│               │       │                 │       
│               │       │                 │
│               │       │                 │
│               │       │                 │ <!-- 재무 -->
│               │       │                 ├── Finance 데이터
│               │       │                 │             │ <!-- 조직 내 결제 관리-->
│               │       │                 │             ├── Payment
│               │       │                 │             │        ├── ID [PK]
│               │       │                 │             │        ├── UUID
│               │       │                 │             │        ├── Organization ID [FK]
│               │       │                 │             │        ├── Customer ID [FK]
│               │       │                 │             │        ├── Consultation Session ID [FK][NULL] # 어떤 상담에서 결제가 이루어졌는지 추적
│               │       │                 │             │        ├── 결제를 처리한 Member ID [FK]
│               │       │                 │             │        │
│               │       │                 │             │        ├── 결제 유형 ID [INTEGER][FK]
│               │       │                 │             │        ├── 결제 상태 ID [INTEGER][FK]
│               │       │                 │             │        ├── 결제 일시 [DATETIME]
│               │       │                 │             │        ├── 환불 여부 [BOOLEAN]
│               │       │                 │             │        │
│               │       │                 │             │        ├── 정가 (순수 결제 받아야 할 금액)
│               │       │                 │             │        ├── 정가에 적용되는 할인율 (정가에 n% 적용되는 일괄 할인율)
│               │       │                 │             │        ├── 공급가액 (세금이 붙기 전 순수 매출이자 정가에 할인율이 적용된 금액)
│               │       │                 │             │        ├── 부가세 (공급가액 10%의 세금)
│               │       │                 │             │        ├── 실 결제액 (공급가액 + 부가세)
│               │       │                 │             │        ├── 
│               │       │                 │             │        │
│               │       │                 │             │        ├── 결제 메모 [TEXT][NULL]
│               │       │                 │             │        │
│               │       │                 │             │        ├── 생성 일시 [DATETIME]
│               │       │                 │             │        └── 수정 일시 [DATETIME]
│               │       │                 │             │
│               │       │                 │             │
│               │       │                 │             │ <!-- 환불 이력 관리 -->
│               │       │                 │             ├── Refund
│               │       │                 │             │        ├── ID [PK]
│               │       │                 │             │        ├── UUID
│               │       │                 │             │        ├── Payment ID [FK]
│               │       │                 │             │        ├── Organization ID [FK]
│               │       │                 │             │        │
│               │       │                 │             │        ├── 환불_유형_ID [INTEGER][FK]
│               │       │                 │             │        ├── 환불_금액 [INTEGER]
│               │       │                 │             │        ├── 환불_사유_ID [INTEGER][FK]
│               │       │                 │             │        ├── 환불_사유_상세 [TEXT]
│               │       │                 │             │        │
│               │       │                 │             │        ├── 환불_상태_ID [INTEGER][FK]  # ENUM: 요청/승인/완료/거부
│               │       │                 │             │        ├── 환불_요청_일시 [DATETIME]
│               │       │                 │             │        ├── 환불_승인_일시 [DATETIME][NULL]
│               │       │                 │             │        ├── 환불_완료_일시 [DATETIME][NULL]
│               │       │                 │             │        │
│               │       │                 │             │        ├── 환불_요청자 [VARCHAR(50)]  # 고객명
│               │       │                 │             │        ├── 환불_처리자_Member_ID [FK]
│               │       │                 │             │        ├── 환불_승인자_Member_ID [FK][NULL]
│               │       │                 │             │        │
│               │       │                 │             │        ├── 생성_일시 [DATETIME]
│               │       │                 │             │        └── 수정_일시 [DATETIME]
│               │       │                 │             │
│               │       │                 │   
│               │       │                 │   
│               │       │                 │   
│               │       │                 │   
│               │       │                        
│               │       │                 
│               │       ├── 시스템 데이터
│               │       │           │ <!-- 시스템 권한 정의: 불변의 데이터셋 -->
│               │       │           ├── Permission
│               │       │           │           ├── ID
│               │       │           │           ├── is_Active
│               │       │           │           ├── Permission Key (예: HOS:Consultation:CREATE)
│               │       │           │           ├── Permission 설명
│               │       │           │           ├── 권한 도메인 (예: 상담, 간호, 경영)
│               │       │           │           ├── 생성 일시
│               │       │           │           └── 수정 일시
│               │       │           │
│               │       │           │
│               │       │           │ <!-- 시스템 로그 -->
│               │       │           ├── Log
│               │       │           │
│               │       │           │
│               │       │           │
│               │       │           │
│               │       │           │
│               │       │           │
```

## 계약서 관리 모듈과 HOS 구조의 연계

### 현재 구현 (계약서 관리 모듈만)
- `hospitals` 테이블: 병원 계정 정보
- `doctors` 테이블: 의사 계정 정보
- `employees` 테이블: 일반직원 계정 정보
- `contracts` 테이블: 의사 일용직 근로계약서
- `labor_contracts` 테이블: 일반 근로계약서

### 향후 HOS 플랫폼 통합 시
1. **조직 중심 계약서 관리**
   - `hospitals` → `organizations` (Organization Definition)
   - `doctors`, `employees` → `member_information` (Member Information)
   - `contracts`, `labor_contracts` → 인사 데이터 모듈의 일부로 통합
   - 계약서 작성자는 `member_information.id`와 연결

2. **권한 기반 계약서 접근**
   - `Permission` 테이블의 권한 키:
     - `HOS:Contract:CREATE` - 계약서 생성 권한
     - `HOS:Contract:VIEW` - 계약서 조회 권한
     - `HOS:Contract:EDIT` - 계약서 수정 권한
     - `HOS:Contract:DELETE` - 계약서 삭제 권한
     - `HOS:Contract:SEND` - 계약서 발송 권한
     - `HOS:Contract:SIGN` - 계약서 서명 권한
   - `Role`의 권한 프리셋 또는 `Member Permission Set`을 통해 개별 권한 부여/제거

3. **팀 및 역할 기반 계약서 관리**
   - 특정 팀(예: 인사팀)만 계약서 생성 가능
   - 역할(예: 인사담당자)별로 다른 계약서 접근 권한 부여

4. **멤버 소속 정보 활용**
   - 멤버의 입사일, 퇴사일 정보를 계약서와 연계
   - 멤버의 급여 정보와 계약서의 급여 정보 연동
   - 멤버의 성과 정보와 계약서 이력 연계

## 참고 API 및 문서

[API]
- https://www.data.go.kr/data/15067467/fileData.do#/ = 상병마스터
- https://www.data.go.kr/data/15057639/openapi.do#tab_layer_recommend_data = 식품의약품안전처_의약품 낱알식별 정보

[참고 문서]
- https://www.mohw.go.kr/menu.es?mid=a10702040400 => DUR제도에 대해
