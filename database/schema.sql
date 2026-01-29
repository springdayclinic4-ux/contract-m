-- HOS Contract Management System Database Schema
-- PostgreSQL 14+

-- Create Database (run separately)
-- CREATE DATABASE hos_contracts;
-- \c hos_contracts;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- User Tables
-- ============================================

-- hospitals (병원 계정)
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_registration_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    hospital_name VARCHAR(255) NOT NULL,
    director_name VARCHAR(100) NOT NULL,
    hospital_address TEXT NOT NULL,
    hospital_phone VARCHAR(20) NOT NULL,
    manager_name VARCHAR(100),
    manager_phone VARCHAR(20),
    hospital_logo_url TEXT,
    hospital_seal_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    terms_service_agreed BOOLEAN DEFAULT FALSE,
    terms_privacy_agreed BOOLEAN DEFAULT FALSE,
    terms_third_party_agreed BOOLEAN DEFAULT FALSE,
    marketing_agreed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hospitals_email ON hospitals(email);
CREATE INDEX IF NOT EXISTS idx_hospitals_business_number ON hospitals(business_registration_number);

-- doctors (의사 계정)
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    bank_name VARCHAR(50),
    account_number VARCHAR(50),
    signature_image_url TEXT,
    seal_image_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    terms_service_agreed BOOLEAN DEFAULT FALSE,
    terms_privacy_agreed BOOLEAN DEFAULT FALSE,
    marketing_agreed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);

-- employees (일반직원 계정)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    birth_date DATE,
    address TEXT,
    phone VARCHAR(20),
    bank_name VARCHAR(50),
    account_number VARCHAR(50),
    signature_image_url TEXT,
    seal_image_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    terms_service_agreed BOOLEAN DEFAULT FALSE,
    terms_privacy_agreed BOOLEAN DEFAULT FALSE,
    marketing_agreed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

-- sessions (로그인 세션)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('hospital', 'doctor', 'employee')),
    user_id UUID NOT NULL,
    access_token VARCHAR(500) NOT NULL,
    refresh_token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_type, user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token);

-- ============================================
-- Contract Tables
-- ============================================

-- contracts (의사 일용직 근로계약서)
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    creator_type VARCHAR(20) NOT NULL CHECK (creator_type IN ('hospital', 'doctor', 'employee')),
    creator_id UUID NOT NULL,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    doctor_email VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(100) NOT NULL,
    doctor_registration_number TEXT,
    doctor_phone VARCHAR(20),
    doctor_license_number VARCHAR(50) NOT NULL,
    doctor_address TEXT NOT NULL,
    doctor_bank_name VARCHAR(50),
    doctor_account_number VARCHAR(50),
    work_dates JSONB,
    start_time TIME,
    end_time TIME,
    break_time VARCHAR(50),
    wage_gross DECIMAL(15, 2),
    wage_net DECIMAL(15, 2),
    wage_type VARCHAR(10) CHECK (wage_type IN ('gross', 'net')),
    special_conditions TEXT,
    include_security_pledge BOOLEAN DEFAULT TRUE,
    include_pay_stub BOOLEAN DEFAULT TRUE,
    include_crime_check BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'pending', 'signed', 'rejected', 'cancelled')),
    sent_at TIMESTAMP,
    signed_at TIMESTAMP,
    signature_image_url TEXT,
    rejection_reason TEXT,
    signed_pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contracts_creator ON contracts(creator_type, creator_id);
CREATE INDEX IF NOT EXISTS idx_contracts_doctor_email ON contracts(doctor_email);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON contracts(created_at);

-- labor_contracts (일반 근로계약서)
CREATE TABLE IF NOT EXISTS labor_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    creator_type VARCHAR(20) NOT NULL CHECK (creator_type IN ('hospital', 'doctor', 'employee')),
    creator_id UUID NOT NULL,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    employee_email VARCHAR(255) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    employee_registration_number TEXT,
    employee_birth_date DATE,
    employee_phone VARCHAR(20),
    employee_address TEXT NOT NULL,
    employee_bank_name VARCHAR(50),
    employee_account_number VARCHAR(50),
    contract_type VARCHAR(20) CHECK (contract_type IN ('regular', 'temporary', 'contract')),
    work_contract_start_date DATE,
    work_contract_end_date DATE,
    salary_contract_start_date DATE,
    salary_contract_end_date DATE,
    probation_period INTEGER,
    probation_salary_rate DECIMAL(5, 2),
    annual_salary_total DECIMAL(15, 2),
    base_salary DECIMAL(15, 2),
    meal_allowance DECIMAL(15, 2),
    fixed_overtime_allowance DECIMAL(15, 2),
    monthly_base_salary DECIMAL(15, 2),
    monthly_meal_allowance DECIMAL(15, 2),
    monthly_overtime_allowance DECIMAL(15, 2),
    monthly_total DECIMAL(15, 2),
    regular_hourly_wage DECIMAL(10, 2),
    monthly_base_hours INTEGER,
    monthly_overtime_hours INTEGER,
    pay_date INTEGER,
    work_content TEXT,
    work_location TEXT,
    work_start_time TIME,
    work_end_time TIME,
    break_time VARCHAR(50),
    work_days_per_week INTEGER,
    include_security_pledge BOOLEAN DEFAULT TRUE,
    include_privacy_consent BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'pending', 'signed', 'rejected', 'cancelled')),
    sent_at TIMESTAMP,
    signed_at TIMESTAMP,
    signature_image_url TEXT,
    rejection_reason TEXT,
    signed_pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_labor_contracts_creator ON labor_contracts(creator_type, creator_id);
CREATE INDEX IF NOT EXISTS idx_labor_contracts_employee_email ON labor_contracts(employee_email);
CREATE INDEX IF NOT EXISTS idx_labor_contracts_status ON labor_contracts(status);
CREATE INDEX IF NOT EXISTS idx_labor_contracts_created_at ON labor_contracts(created_at);

-- ============================================
-- Invitation Tables
-- ============================================

-- contract_invitations (의사 일용직 계약서 초대)
CREATE TABLE IF NOT EXISTS contract_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    invitation_token VARCHAR(100) UNIQUE NOT NULL,
    sent_via VARCHAR(10) DEFAULT 'email' CHECK (sent_via IN ('email')),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    clicked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contract_invitations_token ON contract_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_contract_invitations_contract ON contract_invitations(contract_id);

-- labor_contract_invitations (근로계약서 초대)
CREATE TABLE IF NOT EXISTS labor_contract_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    labor_contract_id UUID NOT NULL REFERENCES labor_contracts(id) ON DELETE CASCADE,
    invitation_token VARCHAR(100) UNIQUE NOT NULL,
    sent_via VARCHAR(10) DEFAULT 'email' CHECK (sent_via IN ('email')),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    clicked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_labor_contract_invitations_token ON labor_contract_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_labor_contract_invitations_labor_contract ON labor_contract_invitations(labor_contract_id);

-- ============================================
-- Verification Tables
-- ============================================

-- email_verifications (이메일 인증)
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    verification_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_code ON email_verifications(verification_code);

-- ============================================
-- Update Triggers (updated_at 자동 업데이트)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON hospitals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_labor_contracts_updated_at BEFORE UPDATE ON labor_contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
