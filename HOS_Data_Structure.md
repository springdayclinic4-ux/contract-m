# HOS Data Structure (Hospital Operating System)

**마지막 업데이트:** 2026-03-08
**데이터베이스:** PostgreSQL + Prisma ORM
**스키마 파일:** `backend/prisma/schema.prisma`

---

## 개요

HOS 계약서 관리 시스템의 실제 데이터 구조.
Prisma ORM을 사용하며, 모든 테이블은 snake_case 컬럼명으로 매핑됨.

---

## ER 다이어그램 (관계도)

```
Hospital ──1:N──→ Contract (hospitalId)
Doctor   ──1:N──→ Contract (doctorId)
Contract ──1:1──→ ContractInvitation (contractId)

Hospital ──1:N──→ LaborContract (hospitalId)
Doctor   ──1:N──→ LaborContract (doctorId)
Employee ──1:N──→ LaborContract (employeeId)
LaborContract ──1:1──→ LaborContractInvitation (laborContractId)

Session (독립 - userType + userId로 다형성 참조)
EmailVerification (독립)
```

---

## 모델 상세

### 1. Hospital (병원)

**테이블명:** `hospitals`

| 컬럼 | 타입 | 설명 | 제약조건 |
|------|------|------|---------|
| id | UUID | PK | auto |
| business_registration_number | String | 사업자등록번호 | unique |
| email | String | 로그인 이메일 | unique |
| password_hash | String | bcrypt 해시 | |
| hospital_name | String | 병원명 | |
| director_name | String | 대표자명 | |
| hospital_address | String | 병원 주소 | |
| hospital_phone | String | 병원 전화번호 | |
| manager_name | String? | 담당자명 | nullable |
| manager_phone | String? | 담당자 연락처 | nullable |
| hospital_logo_url | String? | 로고 URL | nullable |
| hospital_seal_url | String? | 직인 URL | nullable |
| email_verified | Boolean | 이메일 인증 여부 | default: false |
| terms_service_agreed | Boolean | 서비스 약관 동의 | default: false |
| terms_privacy_agreed | Boolean | 개인정보 처리 동의 | default: false |
| terms_third_party_agreed | Boolean | 제3자 제공 동의 | default: false |
| marketing_agreed | Boolean | 마케팅 수신 동의 | default: false |
| created_at | DateTime | 생성일 | auto |
| updated_at | DateTime | 수정일 | auto |

**인덱스:** email, business_registration_number
**관계:** → Contract (1:N), → LaborContract (1:N)

---

### 2. Doctor (의사)

**테이블명:** `doctors`

| 컬럼 | 타입 | 설명 | 제약조건 |
|------|------|------|---------|
| id | UUID | PK | auto |
| email | String | 로그인 이메일 | unique |
| password_hash | String | bcrypt 해시 | |
| name | String | 성명 | |
| license_number | String | 면허번호 | |
| address | String? | 주소 | nullable |
| phone | String? | 연락처 | nullable |
| bank_name | String? | 은행명 | nullable |
| account_number | String? | 계좌번호 | nullable |
| signature_image_url | String? | 서명 이미지 | nullable |
| seal_image_url | String? | 도장 이미지 | nullable |
| email_verified | Boolean | 이메일 인증 | default: false |
| terms_* | Boolean | 약관 동의 (3종) | default: false |
| marketing_agreed | Boolean | 마케팅 동의 | default: false |
| created_at / updated_at | DateTime | 타임스탬프 | auto |

**인덱스:** email
**관계:** → Contract (1:N), → LaborContract (1:N)

---

### 3. Employee (일반직원)

**테이블명:** `employees`

| 컬럼 | 타입 | 설명 | 제약조건 |
|------|------|------|---------|
| id | UUID | PK | auto |
| email | String | 로그인 이메일 | unique |
| password_hash | String | bcrypt 해시 | |
| name | String | 성명 | |
| birth_date | Date? | 생년월일 | nullable |
| address | String? | 주소 | nullable |
| phone | String? | 연락처 | nullable |
| bank_name | String? | 은행명 | nullable |
| account_number | String? | 계좌번호 | nullable |
| signature_image_url | String? | 서명 이미지 | nullable |
| seal_image_url | String? | 도장 이미지 | nullable |
| email_verified | Boolean | 이메일 인증 | default: false |
| terms_* | Boolean | 약관 동의 (2종) | default: false |
| marketing_agreed | Boolean | 마케팅 동의 | default: false |
| created_at / updated_at | DateTime | 타임스탬프 | auto |

**인덱스:** email
**관계:** → LaborContract (1:N)

---

### 4. Session (세션)

**테이블명:** `sessions`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_type | String | 'hospital' / 'doctor' / 'employee' |
| user_id | String | 사용자 ID (다형성 참조) |
| access_token | String | JWT 액세스 토큰 |
| refresh_token | String | 리프레시 토큰 |
| expires_at | DateTime | 만료 시각 |
| created_at | DateTime | 생성일 |

**인덱스:** (user_type, user_id), refresh_token
**참고:** user_type에 따라 Hospital/Doctor/Employee 테이블을 application 레벨에서 참조

---

### 5. Contract (일용직 계약서)

**테이블명:** `contracts`

| 컬럼 | 타입 | 설명 | 제약조건 |
|------|------|------|---------|
| id | UUID | PK | auto |
| contract_number | String | 계약번호 (YYYYMMDD-xxxxxxxx) | unique |
| creator_type | String | 생성자 유형 | |
| creator_id | String | 생성자 ID | |
| hospital_id | String? | 병원 FK | nullable |
| doctor_id | String? | 의사 FK | nullable |
| doctor_email | String | 의사 이메일 (lowercase 정규화) | |
| doctor_name | String | 의사 성명 | |
| doctor_registration_number | String? | 주민등록번호 (삭제 가능) | nullable |
| doctor_phone | String? | 연락처 (삭제 가능) | nullable |
| doctor_license_number | String | 면허번호 | |
| doctor_address | String | 주소 | |
| doctor_bank_name | String? | 은행명 (삭제 가능) | nullable |
| doctor_account_number | String? | 계좌번호 (삭제 가능) | nullable |
| work_dates | Json? | 근무일 배열 ["2026-03-10", ...] | |
| start_time | String? | 시작 시간 | |
| end_time | String? | 종료 시간 | |
| break_time | String? | 휴게 시간 | |
| wage_gross | Decimal(15,2)? | 세전 일급 | |
| wage_net | Decimal(15,2)? | 세후 일급 | |
| wage_type | String? | 'gross' / 'net' | |
| tax_method | String? | 'business' (3.3%) / 'daily' (근로소득세) | |
| payment_date | String? | 지급일 선택 | default: 'same_day' |
| special_conditions | String? | 특약사항 | |
| include_security_pledge | Boolean | 보안서약서 포함 | default: true |
| include_pay_stub | Boolean | 급여명세서 포함 | default: true |
| include_crime_check | Boolean | 성범죄조회 포함 | default: true |
| status | String | 상태 | default: 'draft' |
| sent_at | DateTime? | 발송 시각 | |
| signed_at | DateTime? | 서명 시각 | |
| signature_image_url | String? | 의사 서명 이미지 (base64) | |
| hospital_signature_url | String? | 병원 서명 이미지 (base64) | |
| rejection_reason | String? | 거부 사유 | |
| signed_pdf_url | String? | 서명 완료 PDF URL | |
| created_at / updated_at | DateTime | 타임스탬프 | auto |

**상태값:** `draft` → `sent` → `signed` / `rejected` / `cancelled`
**인덱스:** (creator_type, creator_id), doctor_email, status, created_at
**관계:** → Hospital (N:1), → Doctor (N:1), → ContractInvitation (1:1)

**payment_date 값:**
| 값 | 의미 |
|----|------|
| same_day | 당일 지급 |
| next_day | 익일 지급 |
| weekly | 매주 지급 |
| monthly_10 | 매월 10일 |
| monthly_15 | 매월 15일 |
| monthly_25 | 매월 25일 |
| monthly_last | 매월 말일 |

**삭제 가능 필드 (의사 직접 삭제):**
- doctor_registration_number → null
- doctor_account_number → null
- doctor_bank_name → null
- doctor_phone → null

---

### 6. LaborContract (근로계약서)

**테이블명:** `labor_contracts`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| contract_number | String | 계약번호 (unique) |
| creator_type / creator_id | String | 생성자 |
| hospital_id | String? | 병원 FK |
| doctor_id | String? | 의사 FK |
| employee_id | String? | 직원 FK |
| employee_email | String | 직원 이메일 |
| employee_name | String | 직원 성명 |
| employee_registration_number | String? | 주민번호 |
| employee_birth_date | Date? | 생년월일 |
| employee_phone | String? | 연락처 |
| employee_address | String | 주소 |
| employee_bank_name | String? | 은행명 |
| employee_account_number | String? | 계좌번호 |
| contract_type | String? | 'regular' / 'temporary' / 'contract' |
| work_contract_start_date | Date? | 근로계약 시작일 |
| work_contract_end_date | Date? | 근로계약 종료일 |
| salary_contract_start_date | Date? | 급여계약 시작일 |
| salary_contract_end_date | Date? | 급여계약 종료일 |
| probation_period | Int? | 수습기간 (개월) |
| probation_salary_rate | Decimal(5,2)? | 수습급여 비율 |
| annual_salary_total | Decimal(15,2)? | 연봉 총액 |
| base_salary | Decimal(15,2)? | 기본급 |
| meal_allowance | Decimal(15,2)? | 식대 |
| fixed_overtime_allowance | Decimal(15,2)? | 고정 OT수당 |
| monthly_base_salary | Decimal(15,2)? | 월 기본급 |
| monthly_meal_allowance | Decimal(15,2)? | 월 식대 |
| monthly_overtime_allowance | Decimal(15,2)? | 월 OT수당 |
| monthly_total | Decimal(15,2)? | 월 합계 |
| regular_hourly_wage | Decimal(10,2)? | 통상 시급 |
| monthly_base_hours | Int? | 월 소정근로시간 |
| monthly_overtime_hours | Int? | 월 고정OT시간 |
| pay_date | Int? | 급여일 (1~31) |
| work_content | String? | 업무내용 |
| work_location | String? | 근무장소 |
| work_start_time / work_end_time | String? | 근무시간 |
| break_time | String? | 휴게시간 |
| work_days_per_week | Int? | 주 근무일수 |
| include_security_pledge | Boolean | 보안서약서 |
| include_privacy_consent | Boolean | 개인정보동의 |
| status | String | 상태 (draft/sent/signed/rejected) |
| sent_at / signed_at | DateTime? | 발송/서명 시각 |
| signature_image_url | String? | 직원 서명 |
| rejection_reason | String? | 거부 사유 |
| signed_pdf_url | String? | 서명 PDF |
| created_at / updated_at | DateTime | 타임스탬프 |

**인덱스:** (creator_type, creator_id), employee_email, status, created_at
**관계:** → Hospital (N:1), → Doctor (N:1), → Employee (N:1), → LaborContractInvitation (1:1)

---

### 7. ContractInvitation (일용직 계약서 초대)

**테이블명:** `contract_invitations`

| 컬럼 | 타입 | 설명 | 제약조건 |
|------|------|------|---------|
| id | UUID | PK | auto |
| contract_id | String | 계약서 FK | unique |
| invitation_token | String | 초대 토큰 (UUID) | unique |
| sent_via | String | 발송 방식 | default: 'email' |
| sent_at | DateTime | 발송 시각 | auto |
| expires_at | DateTime | 만료 시각 (7일) | |
| clicked_at | DateTime? | 클릭 시각 | nullable |
| created_at | DateTime | 생성일 | auto |

**인덱스:** invitation_token
**관계:** → Contract (N:1, cascade delete)
**참고:** 재발송 시 기존 레코드 삭제 후 새로 생성

---

### 8. LaborContractInvitation (근로계약서 초대)

**테이블명:** `labor_contract_invitations`

ContractInvitation과 동일 구조, `labor_contract_id` 사용.
**관계:** → LaborContract (N:1, cascade delete)

---

### 9. EmailVerification (이메일 인증)

**테이블명:** `email_verifications`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| email | String | 대상 이메일 |
| verification_code | String | 6자리 인증코드 |
| expires_at | DateTime | 만료 시각 (10분) |
| verified | Boolean | 인증 완료 여부 |
| created_at | DateTime | 생성일 |

**인덱스:** email, verification_code

---

## 마이그레이션 이력

| 마이그레이션 | 설명 |
|-------------|------|
| 20260123082223_init | 초기 스키마 (전체 테이블 생성) |
| 20260125073020_add_labor_contract | LaborContract + LaborContractInvitation 추가 |
| 20260128_add_hospital_signature | hospital_signature_url 컬럼 추가 |
| 20260308200001_purge_signed_registration_numbers | 서명 완료 계약서 주민번호 일괄 삭제 |
| 20260308300001_add_payment_date | payment_date 컬럼 추가 (default: 'same_day') |

---

## 데이터 흐름 다이어그램

### 계약서 생성~서명 전체 흐름

```
병원 로그인
  ↓
POST /api/contracts/daily (body: 의사정보, 근무조건, 급여)
  ↓
DB: contracts 테이블에 INSERT (status: 'draft')
  ↓
POST /api/contracts/:id/send
  ↓
DB: contract_invitations에 INSERT (invitationToken)
DB: contracts 상태 → 'sent'
Email: 의사에게 초대 이메일 발송
  ↓
의사가 이메일 클릭 → GET /api/contracts/invitation/:token
  ↓
DB: contract_invitations.clicked_at 업데이트
Response: 계약서 전체 데이터 반환 (병원정보 포함)
  ↓
의사 로그인 후 서명 → POST /api/contracts/invitation/:token/sign
  ↓
DB: contracts 상태 → 'signed', signature_image_url 저장
  ↓
(선택) 의사가 개인정보 삭제 → POST /api/contracts/invitation/:token/delete-personal-info
  ↓
DB: doctor_registration_number, doctor_account_number, doctor_bank_name, doctor_phone → null
```

### 재발송 흐름

```
POST /api/contracts/:id/send (status가 'sent'인 경우)
  ↓
DB: 기존 contract_invitations DELETE
DB: 새 contract_invitations INSERT (새 invitationToken)
Email: 의사에게 새 초대 이메일 발송
```
